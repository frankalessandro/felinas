-- Lo mínimo de Supabase que las migraciones dan por hecho, sin el servicio de Auth:
-- roles, esquema `auth` (users + auth.uid()), esquema `storage` (buckets/objects) y un `cron` de mentira.

-- ---------------------------------------------------------------- roles
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
grant anon, authenticated, service_role to postgres;

-- Rol con el que se conecta PostgREST; cambia a anon/authenticated según el JWT de cada petición.
create role authenticator noinherit login password 'authenticator';
grant anon, authenticated, service_role to authenticator;

-- ---------------------------------------------------------------- auth
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  raw_app_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Igual que Supabase: el "usuario actual" sale de los claims de la sesión.
create function auth.uid() returns uuid
language sql stable
as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;

create function auth.role() returns text
language sql stable
as $$
  select coalesce(
    current_setting('request.jwt.claim.role', true),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )
$$;

create function auth.jwt() returns jsonb
language sql stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

grant execute on function auth.uid(), auth.role(), auth.jwt() to anon, authenticated, service_role;

-- ---------------------------------------------------------------- storage
create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key,
  name text not null unique,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz not null default now()
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated, service_role;
grant select on storage.buckets to authenticated, service_role;

-- ---------------------------------------------------------------- cron
-- pg_cron no viene en la imagen: las migraciones lo programan, aquí se ignora.
create schema cron;
create function cron.schedule(job_name text, schedule text, command text) returns bigint
language sql
as $$ select 0::bigint $$;

-- ---------------------------------------------------------------- permisos de public
-- Supabase da estos privilegios por defecto a lo que se crea en `public`; las políticas RLS hacen el resto.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ---------------------------------------------------------------- utilidades de prueba
-- select dev.login('alumna1@felinas.test');  -- desde aquí las consultas corren con RLS como esa persona
-- select dev.logout();                        -- vuelve a postgres (sin RLS)
create schema dev;
grant usage on schema dev to public;

create function dev.login(p_email text) returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    raise exception 'No existe el usuario %', p_email;
  end if;
  perform set_config('request.jwt.claim.sub', v_id::text, false);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_id, 'role', 'authenticated', 'email', p_email)::text, false);
  perform set_config('role', 'authenticated', false);
  return v_id;
end;
$$;

create function dev.logout() returns void
language plpgsql
as $$
begin
  perform set_config('role', 'none', false);
  perform set_config('request.jwt.claim.sub', '', false);
  perform set_config('request.jwt.claims', '', false);
end;
$$;
