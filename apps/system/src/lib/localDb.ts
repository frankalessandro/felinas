import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cliente del modo local (VITE_USE_LOCAL_DB=true): habla con el PostgREST de docker/compose.yml,
// que no tiene Auth. Es un SupabaseClient real (sin dependencias nuevas) con `auth` y `storage`
// sustituidos. supabase-js pide el token a `auth.getSession()`, así que cada petición lleva un JWT
// firmado aquí para el usuario de prueba y las políticas RLS se aplican igual que en producción.

/** Usuario de prueba elegido en el selector; si no hay, el de VITE_LOCAL_USER. */
export const LOCAL_USER_STORAGE_KEY = 'felinas.local-user'

function readActiveEmail(fallback: string): string {
  try {
    return window.localStorage.getItem(LOCAL_USER_STORAGE_KEY) ?? fallback
  } catch {
    return fallback
  }
}

const TOKEN_TTL_SECONDS = 60 * 60
const REFRESH_MARGIN_MS = 60_000
const STORAGE_UNAVAILABLE = { message: 'El almacenamiento de archivos no está disponible en modo local.' }

interface LocalConfig {
  postgrestUrl: string
  email: string
  jwtSecret: string
}

interface LocalIdentity {
  id: string
  token: string
  expiresAt: number
}

function base64Url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes
  let binary = ''
  raw.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function signJwt(claims: Record<string, unknown>, secret: string): Promise<string> {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(JSON.stringify(claims))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${payload}`))
  return `${header}.${payload}.${base64Url(new Uint8Array(signature))}`
}

async function resolveUserId(config: LocalConfig, email: string): Promise<string> {
  const response = await fetch(`${config.postgrestUrl}/rpc/dev_user_id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_email: email }),
  })
  const id: unknown = response.ok ? await response.json() : null
  if (typeof id !== 'string') {
    throw new Error(`No existe el usuario de prueba ${email}. Revisa VITE_LOCAL_USER (o el selector) y docker/init/20-dev-users.sql (¿corriste pnpm db:up?).`)
  }
  return id
}

export function createLocalClient(config: LocalConfig): SupabaseClient<Database> {
  const email = readActiveEmail(config.email)
  let identity: Promise<LocalIdentity> | null = null

  async function currentIdentity(): Promise<LocalIdentity> {
    const cached = identity ? await identity.catch(() => null) : null
    if (cached && cached.expiresAt - Date.now() > REFRESH_MARGIN_MS) return cached
    identity = (async () => {
      const id = await resolveUserId(config, email)
      const expiresAt = Date.now() + TOKEN_TTL_SECONDS * 1000
      const token = await signJwt(
        { sub: id, role: 'authenticated', email, aud: 'authenticated', exp: Math.floor(expiresAt / 1000) },
        config.jwtSecret,
      )
      return { id, token, expiresAt }
    })()
    return identity
  }

  // supabase-js antepone /rest/v1 (así responde Supabase); el PostgREST suelto sirve desde la raíz.
  const rootFetch: typeof fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    return fetch(url.replace('/rest/v1/', '/'), init)
  }

  async function buildSession(): Promise<Session> {
    const { id, token, expiresAt } = await currentIdentity()
    return {
      access_token: token,
      refresh_token: 'local',
      token_type: 'bearer',
      expires_in: TOKEN_TTL_SECONDS,
      expires_at: Math.floor(expiresAt / 1000),
      user: {
        id,
        email,
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: { full_name: email },
        created_at: new Date().toISOString(),
      },
    }
  }

  const auth = {
    getSession: async () => {
      try {
        return { data: { session: await buildSession() }, error: null }
      } catch (error) {
        return { data: { session: null }, error: error instanceof Error ? error : new Error('Sin sesión local') }
      }
    },
    onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
      void buildSession().then((session) => callback('INITIAL_SESSION', session), () => callback('INITIAL_SESSION', null))
      return { data: { subscription: { unsubscribe: () => undefined } } }
    },
    // No hay login real: la sesión siempre es la del usuario de VITE_LOCAL_USER.
    signInWithOAuth: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
  }

  const storage = {
    from: () => ({
      upload: async () => ({ data: null, error: STORAGE_UNAVAILABLE }),
      remove: async () => ({ data: null, error: STORAGE_UNAVAILABLE }),
      createSignedUrl: async () => ({ data: null, error: STORAGE_UNAVAILABLE }),
    }),
  }

  const client = createClient<Database>(config.postgrestUrl, 'local-no-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: rootFetch },
  })
  Object.defineProperty(client, 'auth', { value: auth })
  Object.defineProperty(client, 'storage', { value: storage })
  return client
}
