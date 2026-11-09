-- Mínimo de reservas para dictar una clase grupal. Se define en el horario (plantilla) y cada sesión
-- generada lo copia, así cambiarlo después no altera las clases que ya existen. Si una clase no llega
-- al mínimo, el admin la ve en riesgo en el tablero y decide si la cancela (cancel_session avisa a las alumnas).
alter table public.class_schedules
  add column min_bookings int not null default 3 check (min_bookings >= 1);

alter table public.class_sessions
  add column min_bookings int not null default 3 check (min_bookings >= 1);

create or replace function public._generate_sessions_range(p_from date, p_to date)
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_n int;
begin
  insert into public.class_sessions (
    schedule_id, class_type_id, teacher_id, room_id, kind, description, starts_at, ends_at, capacity, min_bookings
  )
  select s.id, s.class_type_id, s.teacher_id, s.room_id, 'group', s.description,
         (g.d::date + s.start_time) at time zone 'America/Bogota',
         (g.d::date + s.end_time) at time zone 'America/Bogota',
         s.capacity, s.min_bookings
  from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') as g(d)
  join public.class_schedules s
    on s.active
   and s.weekday = extract(isodow from g.d)::int
   and g.d::date >= s.valid_from
   and (s.valid_until is null or g.d::date <= s.valid_until)
  join public.class_types ct on ct.id = s.class_type_id and ct.active and ct.deleted_at is null
  join public.teachers t on t.id = s.teacher_id and t.active and t.deleted_at is null
  on conflict (schedule_id, starts_at) do nothing;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;
