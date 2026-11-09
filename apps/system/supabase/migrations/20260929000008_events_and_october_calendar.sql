-- Eventos de la academia (shows, batallas, obras): no son clases, no tienen cupo ni consumen plan.
create table public.academy_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  location text,
  description text,
  event_date date not null,
  starts_at timestamptz,
  ends_at timestamptz,
  is_free boolean not null default false,
  color text not null default '#ffd900',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index academy_events_date_idx on public.academy_events (event_date) where deleted_at is null;
create index academy_events_created_by_idx on public.academy_events (created_by);

alter table public.academy_events enable row level security;

create policy academy_events_select on public.academy_events
  for select to authenticated
  using (public.is_admin() or (public.is_active_user() and deleted_at is null));

create policy academy_events_admin_insert on public.academy_events
  for insert to authenticated with check (public.is_admin());
create policy academy_events_admin_update on public.academy_events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy academy_events_admin_delete on public.academy_events
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- Calendario real de octubre 2026
-- Los horarios de ejemplo terminan en septiembre; sus sesiones futuras no tienen reservas.
update public.class_schedules set valid_until = '2026-09-30', active = false
 where valid_until is null or valid_until > '2026-09-30';

delete from public.class_sessions s
 where s.starts_at >= '2026-10-01 00:00-05'
   and not exists (select 1 from public.bookings b where b.session_id = s.id);

insert into public.class_types (name, slug, description, level, color, category_id)
select v.name, v.slug, v.description, 'all'::public.class_level, v.color, c.id
  from (values
    ('Sexy Twerk', 'sexy-twerk', 'Twerk con enfoque en sensualidad, actitud y expresión.', '#ff5fa2', 'twerk'),
    ('House', 'house', 'Danza urbana de club: footwork, groove y musicalidad.', '#35c7d9', 'urbano')
  ) as v(name, slug, description, color, category_slug)
  join public.class_categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- Las nuevas clases entran en los planes que ya cubren su categoría.
insert into public.plan_class_types (plan_id, class_type_id)
select distinct pct.plan_id, new_ct.id
  from public.class_types new_ct
  join public.class_types same_cat on same_cat.category_id = new_ct.category_id and same_cat.id <> new_ct.id
  join public.plan_class_types pct on pct.class_type_id = same_cat.id
  join public.plans p on p.id = pct.plan_id and not p.is_private
 where new_ct.slug in ('sexy-twerk', 'house')
   and same_cat.slug not like 'personalizada%'
on conflict do nothing;

-- Recurrentes del mes (plantillas limitadas a octubre).
insert into public.class_schedules (class_type_id, teacher_id, room_id, weekday, start_time, end_time, capacity, valid_from, valid_until, active)
select ct.id, t.id, r.id, v.weekday, v.start_time::time, v.end_time::time, 6, v.valid_from::date, '2026-10-31', true
  from (values
    ('twerk-avanzado',   'Mae', 2, '20:30', '21:30', '2026-10-01'),
    ('twerk-recreativo', 'Mae', 4, '19:00', '20:00', '2026-10-01'),
    ('sexy-twerk',       'Mae', 3, '20:00', '21:00', '2026-10-14')
  ) as v(type_slug, teacher_name, weekday, start_time, end_time, valid_from)
  join public.class_types ct on ct.slug = v.type_slug
  join public.teachers t on t.full_name = v.teacher_name and t.deleted_at is null
  cross join lateral (select id from public.rooms where name = 'Salón principal' limit 1) r;

select public._generate_sessions('2026-10-01', 5);

-- Clases únicas del mes.
insert into public.class_sessions (class_type_id, teacher_id, room_id, kind, starts_at, ends_at, capacity)
select ct.id, t.id, r.id, 'group', (v.day || ' ' || v.start_time)::timestamp at time zone 'America/Bogota',
       (v.day || ' ' || v.end_time)::timestamp at time zone 'America/Bogota', 6
  from (values
    ('flex-yoga-gimnasia', 'Andrea Altamirano', '2026-10-07', '19:30', '20:30'),
    ('breaking',           'Jahn Evels',        '2026-10-16', '19:30', '20:30'),
    ('house',              'Angélica',          '2026-10-19', '19:30', '20:30')
  ) as v(type_slug, teacher_name, day, start_time, end_time)
  join public.class_types ct on ct.slug = v.type_slug
  join public.teachers t on t.full_name = v.teacher_name and t.deleted_at is null
  cross join lateral (select id from public.rooms where name = 'Salón principal' limit 1) r;

insert into public.academy_events (title, location, event_date, is_free)
values
  ('Show Felinas', 'Go Park', '2026-10-04', true),
  ('Obra de Andrea', 'Teatro Materón', '2026-10-11', true),
  ('Hallotwerk al Parque', null, '2026-10-18', false),
  ('Session Krump', 'La Carbonera', '2026-10-23', false),
  ('Wartime Battles', null, '2026-10-25', false);
