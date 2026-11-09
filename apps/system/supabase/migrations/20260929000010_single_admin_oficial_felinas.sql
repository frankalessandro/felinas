-- Producción: el único admin es la cuenta oficial de la academia. Todos los demás (incluido el
-- desarrollador) entran como alumnas: encuesta de primer ingreso y espera de aprobación.
insert into public.admin_emails (email) values ('oficial.felinas@gmail.com')
on conflict (email) do update set is_developer = false;

delete from public.admin_emails where lower(email) <> 'oficial.felinas@gmail.com';

-- Si la cuenta oficial ya existiera, queda admin de inmediato.
update public.profiles
   set role = 'admin', status = 'active', is_developer = false
 where lower(email) = 'oficial.felinas@gmail.com';

-- Nadie más conserva privilegios de admin ni de desarrollador.
update public.profiles
   set role = 'student', status = 'pending', is_developer = false
 where lower(email) <> 'oficial.felinas@gmail.com'
   and (role = 'admin' or is_developer);
