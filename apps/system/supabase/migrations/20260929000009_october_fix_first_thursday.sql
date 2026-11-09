-- En el calendario real, el jueves 1 de octubre no hay Twerk Recreativo: arranca el 8.
update public.class_schedules s set valid_from = '2026-10-08'
  from public.class_types ct
 where ct.id = s.class_type_id and ct.slug = 'twerk-recreativo' and s.valid_from = '2026-10-01' and s.valid_until = '2026-10-31';

delete from public.class_sessions s
 using public.class_types ct
 where ct.id = s.class_type_id and ct.slug = 'twerk-recreativo'
   and s.starts_at = '2026-10-01 19:00'::timestamp at time zone 'America/Bogota'
   and not exists (select 1 from public.bookings b where b.session_id = s.id);
