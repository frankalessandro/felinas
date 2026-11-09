-- Corrección de 20260929000010: el desarrollador conserva acceso total (super admin) para probar
-- todos los roles. La cuenta oficial de la academia (Mae) es quien opera y aprueba usuarios;
-- cualquier otra persona entra como alumna: encuesta de primer ingreso y espera de aprobación.
insert into public.admin_emails (email, is_developer)
values ('frank.alessandro.roldan@gmail.com', true)
on conflict (email) do update set is_developer = true;

update public.profiles
   set role = 'admin', status = 'active', is_developer = true
 where lower(email) = 'frank.alessandro.roldan@gmail.com';
