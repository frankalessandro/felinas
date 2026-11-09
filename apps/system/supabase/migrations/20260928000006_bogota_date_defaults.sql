-- current_date usa UTC; las fechas de negocio deben usar la fecha de Bogota.
alter table public.class_schedules
  alter column valid_from set default ((now() at time zone 'America/Bogota')::date);
alter table public.student_plans
  alter column starts_on set default ((now() at time zone 'America/Bogota')::date);

-- corrige filas creadas con la fecha UTC (un dia adelantada respecto a Bogota)
update public.class_schedules
   set valid_from = (now() at time zone 'America/Bogota')::date
 where valid_from > (now() at time zone 'America/Bogota')::date;
