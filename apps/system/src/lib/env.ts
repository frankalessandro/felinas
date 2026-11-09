import { z } from 'zod'

const flag = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true')

const baseSchema = z.object({ VITE_USE_LOCAL_DB: flag })

const supabaseSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

// Modo local: Postgres + PostgREST de `docker/compose.yml`, sin Auth. La sesión se sintetiza
// con un JWT firmado en el navegador para el usuario `VITE_LOCAL_USER`, y así la RLS es real.
const localSchema = z.object({
  VITE_POSTGREST_URL: z.url(),
  VITE_LOCAL_USER: z.email(),
  VITE_LOCAL_JWT_SECRET: z.string().min(32),
})

export type Env =
  | { useLocalDb: false; supabaseUrl: string; supabasePublishableKey: string }
  | { useLocalDb: true; postgrestUrl: string; localUser: string; localJwtSecret: string }

function parseEnv(): Env {
  const raw = import.meta.env
  // El modo local solo existe en desarrollo: un build de producción nunca lo activa, aunque la variable llegue.
  const useLocalDb = baseSchema.parse(raw).VITE_USE_LOCAL_DB && import.meta.env.DEV

  const parsed = (useLocalDb ? localSchema : supabaseSchema).safeParse(raw)
  // Falla al arrancar, pero diciendo qué falta: en producción las variables se configuran en el
  // hosting (el `.env` no se sube a git) y un ZodError crudo no dice cuál es.
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
    throw new Error(`Faltan variables de entorno o son inválidas: ${missing}. Configúralas (ver .env.example) y vuelve a arrancar.`)
  }

  if (!useLocalDb) {
    const data = parsed.data as z.infer<typeof supabaseSchema>
    return { useLocalDb: false, supabaseUrl: data.VITE_SUPABASE_URL, supabasePublishableKey: data.VITE_SUPABASE_PUBLISHABLE_KEY }
  }
  const data = parsed.data as z.infer<typeof localSchema>
  return { useLocalDb: true, postgrestUrl: data.VITE_POSTGREST_URL, localUser: data.VITE_LOCAL_USER, localJwtSecret: data.VITE_LOCAL_JWT_SECRET }
}

export const env = parseEnv()
