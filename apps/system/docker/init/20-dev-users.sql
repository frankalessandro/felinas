-- Usuarios ficticios para pruebas (correos @felinas.test, nada real). Corre como postgres:
-- auth.uid() es nulo, así que los triggers de protección lo tratan como llamada interna.

insert into public.admin_emails (email) values ('admin@felinas.test') on conflict (email) do nothing;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000001', 'admin@felinas.test',    '{"full_name": "Admin Prueba"}'),
  ('00000000-0000-4000-8000-000000000002', 'profe@felinas.test',    '{"full_name": "Profe Prueba"}'),
  ('00000000-0000-4000-8000-000000000011', 'alumna1@felinas.test',  '{"full_name": "Alumna Uno"}'),
  ('00000000-0000-4000-8000-000000000012', 'alumna2@felinas.test',  '{"full_name": "Alumna Dos"}'),
  ('00000000-0000-4000-8000-000000000013', 'alumna3@felinas.test',  '{"full_name": "Alumna Tres"}'),
  ('00000000-0000-4000-8000-000000000014', 'pendiente@felinas.test', '{"full_name": "Registro Pendiente"}')
on conflict (id) do nothing;

-- El trigger de auth.users ya creó los perfiles: el admin queda activo (está en admin_emails) y el resto pendiente.
update public.profiles
   set role = 'teacher', status = 'active', phone = '3000000002'
 where email = 'profe@felinas.test';

-- Quienes ya ingresaron tienen el registro completo (si no, la app los manda al onboarding).
update public.profiles
   set onboarded_at = now(), data_consent_at = now(), birth_date = coalesce(birth_date, date '1990-01-15'), phone = coalesce(phone, '3000000001')
 where email in ('admin@felinas.test', 'profe@felinas.test');

-- Cumpleaños repartidos en el mes actual para probar la tarjeta "Felinas que cumplen este mes".
update public.profiles p
   set status = 'active',
       phone = v.phone,
       birth_date = v.birth_date,
       onboarded_at = now(),
       data_consent_at = now()
  from (values
    ('alumna1@felinas.test', '3000000011', (date_trunc('month', current_date) + interval '1 day' - interval '24 years')::date),
    ('alumna2@felinas.test', '3000000012', (current_date - interval '27 years')::date),
    ('alumna3@felinas.test', '3000000013', (date_trunc('month', current_date) + interval '27 days' - interval '31 years')::date)
  ) as v(email, phone, birth_date)
 where p.email = v.email;

-- La profe de prueba queda vinculada a una profe del seed.
update public.teachers
   set profile_id = '00000000-0000-4000-8000-000000000002'
 where full_name = 'Angélica' and profile_id is null;

-- Solo para el modo local de la app (VITE_USE_LOCAL_DB=true): resuelve el id del usuario de prueba
-- por correo, porque sin Auth el navegador no tiene otra forma de conocerlo. Nunca va a Supabase.
create function public.dev_user_id(p_email text) returns uuid
language sql stable security definer set search_path = ''
as $$ select id from auth.users where lower(email) = lower(p_email) $$;
grant execute on function public.dev_user_id(text) to anon, authenticated;

-- Alimenta el selector de usuario de prueba de la app (solo modo local).
create function public.dev_users() returns table (email text, full_name text, role public.user_role, status public.profile_status)
language sql stable security definer set search_path = ''
as $$
  select p.email, p.full_name, p.role, p.status
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.role, p.full_name
$$;
grant execute on function public.dev_users() to anon, authenticated;
