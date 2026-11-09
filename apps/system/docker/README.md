# Postgres local para pruebas

Misma base que Supabase (las migraciones y el seed de `supabase/`), sin el servicio de Auth. Sirve para crear datos, probar RPCs y comprobar RLS sin tocar producción.

```
pnpm db:up      # levanta Postgres en localhost:54329 (usuario y clave: postgres)
pnpm db:psql    # abre psql dentro del contenedor
pnpm db:reset   # borra todo y recrea desde las migraciones
pnpm db:down    # apaga (los datos se conservan)
```

Conexión: `postgresql://postgres:postgres@localhost:54329/postgres`

## Cómo se hizo sin Auth

`init/00-supabase-shim.sql` crea lo mínimo que las migraciones esperan: roles `anon`/`authenticated`/`service_role`, `auth.users` y `auth.uid()`, `storage.buckets/objects` y un `cron.schedule` vacío (la imagen no trae `pg_cron`; la expiración diaria de planes no corre sola, llámala a mano con `select public.expire_student_plans();`).

Los scripts de `init/` corren solo cuando el volumen está vacío. Si cambias una migración, usa `pnpm db:reset`.

## Actuar como una persona (con RLS)

Como `postgres` no hay RLS. Para probar como un usuario:

```sql
select dev.login('alumna1@felinas.test');   -- de aquí en adelante corre como esa persona
select * from public.profiles;               -- solo ve lo suyo
select dev.logout();                         -- vuelve a postgres
```

Usuarios ficticios (`init/20-dev-users.sql`): `admin@felinas.test`, `profe@felinas.test` (vinculada a Angélica), `alumna1`, `alumna2`, `alumna3` (activas, con cumpleaños este mes) y `pendiente@felinas.test`.

## Usar la app contra este Postgres (`pnpm dev`)

En `.env`:

```
VITE_USE_LOCAL_DB=true          # false = Supabase real
VITE_POSTGREST_URL=http://localhost:54330
VITE_LOCAL_USER=admin@felinas.test
VITE_LOCAL_JWT_SECRET=felinas-local-dev-secret-not-for-production
```

Con `true`, la app habla con el PostgREST de este compose (puerto 54330) en vez de Supabase. No hay pantalla de login: la sesión es siempre la de `VITE_LOCAL_USER`, y el navegador firma un JWT para ese usuario, así que la RLS se aplica igual que en producción. Para cambiar de rol usa el selector de usuario de prueba (esquina inferior izquierda, solo en modo local): Admin, Profe, alumnas activas o la alumna pendiente. `VITE_LOCAL_USER` es solo el usuario con el que arranca. La clave debe ser la misma que `PGRST_JWT_SECRET` en `compose.yml`.

Limitaciones: la subida de comprobantes de pago (Storage) no está disponible en modo local, y "Cerrar sesión" no hace nada.

## Qué no incluye

Auth (Google OAuth, sesiones reales) ni Storage.
