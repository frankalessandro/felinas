-- Catálogo real (de felinas-web): reemplaza los datos demo. Los profesores y salones se conservan.

-- 1) Limpieza de la demo. Sin reservas/asistencias/planes de alumnas se borra; si las hubiera, se archiva.
do $$
begin
  if not exists (select 1 from public.bookings)
     and not exists (select 1 from public.attendance)
     and not exists (select 1 from public.student_plans) then
    delete from public.class_sessions;
    delete from public.class_schedules;
    delete from public.plans;          -- cascada: plan_class_types, plan_category_quotas
    delete from public.class_types;
  else
    update public.class_schedules set active = false;
    update public.plans set active = false, deleted_at = coalesce(deleted_at, now());
    update public.class_types
       set active = false, deleted_at = coalesce(deleted_at, now()), slug = slug || '-demo-' || left(id::text, 8);
  end if;
end $$;

-- 2) Tipos de clase
insert into public.class_types (name, slug, description, level, color, category_id)
select v.name, v.slug, v.description, v.level::public.class_level, v.color, c.id
from (values
  ('Twerk Recreativo', 'twerk-recreativo', 'Twerk para divertirse y soltarse', 'all', '#ea1a62', 'twerk'),
  ('Twerk Avanzado', 'twerk-avanzado', 'Twerk de nivel avanzado', 'advanced', '#b3124a', 'twerk'),
  ('Hip Hop', 'hip-hop', 'Técnica y coreografía de hip hop', 'all', '#8a3dff', 'urbano'),
  ('Breaking', 'breaking', 'Fundamentos de breaking', 'all', '#5b21b6', 'urbano'),
  ('Flex/Yoga/Gimnasia', 'flex-yoga-gimnasia', 'Flexibilidad, movilidad, yoga y gimnasia', 'all', '#a78bfa', 'urbano'),
  ('Personalizada Twerk', 'personalizada-twerk', 'Clase individual de twerk agendada por la academia', 'all', '#ff6a9a', 'twerk')
) as v(name, slug, description, level, color, category_slug)
join public.class_categories c on c.slug = v.category_slug
on conflict (slug) do update set category_id = excluded.category_id;

-- 3) Planes (todos por mes calendario; duration_days no se usa en calendar_month)
insert into public.plans (name, description, type, class_count, duration_days, price, is_private, validity)
select v.name, v.description, 'package', v.class_count, 30, v.price, v.is_private, 'calendar_month'
from (values
  ('Despierta', '4 clases al mes: 3 Twerk + 1 Urbano', 4, 120000, false),
  ('Instinto', '6 clases al mes: 3 Twerk + 3 Urbano', 6, 165000, false),
  ('Alfa', '8 clases al mes, combina Twerk y Urbano libremente', 8, 210000, false),
  ('Ruge y Fluye', '12 clases al mes, combina Twerk y Urbano libremente', 12, 260000, false),
  ('Tic Toc', '6 clases grupales de Twerk al mes', 6, 135000, false),
  ('Shake personalizado', 'Clases individuales de Twerk (4 sesiones al mes)', 4, 200000, true),
  ('Jiggle personalizado intensivo', 'Clases individuales de Twerk intensivo (8 sesiones al mes)', 8, 360000, true),
  ('Base', '4 clases de Urbano al mes', 4, 130000, false),
  ('Intermedio', '6 clases de Urbano al mes', 6, 180000, false),
  ('Plus', '8 clases de Urbano al mes', 8, 225000, false),
  ('Clase suelta Twerk', '1 clase de Twerk', 1, 30000, false),
  ('Clase suelta Urbano', '1 clase de Urbano', 1, 35000, false)
) as v(name, description, class_count, price, is_private)
where not exists (select 1 from public.plans p where p.name = v.name and p.deleted_at is null);

-- Estilos permitidos por plan (scope: all = Twerk + Urbano grupales)
insert into public.plan_class_types (plan_id, class_type_id)
select p.id, ct.id
from (values
  ('Despierta', 'all'), ('Instinto', 'all'), ('Alfa', 'all'), ('Ruge y Fluye', 'all'),
  ('Tic Toc', 'twerk'), ('Clase suelta Twerk', 'twerk'),
  ('Base', 'urbano'), ('Intermedio', 'urbano'), ('Plus', 'urbano'), ('Clase suelta Urbano', 'urbano'),
  ('Shake personalizado', 'private'), ('Jiggle personalizado intensivo', 'private')
) as m(plan_name, scope)
join public.plans p on p.name = m.plan_name and p.deleted_at is null
join public.class_types ct on ct.deleted_at is null
join public.class_categories cat on cat.id = ct.category_id
where (m.scope = 'private' and ct.slug = 'personalizada-twerk')
   or (m.scope <> 'private' and ct.slug <> 'personalizada-twerk'
       and (m.scope = 'all' or cat.slug = m.scope))
on conflict do nothing;

-- Cupos por categoría
insert into public.plan_category_quotas (plan_id, category_id, max_classes)
select p.id, c.id, q.max_classes
from (values
  ('Despierta', 'twerk', 3), ('Despierta', 'urbano', 1),
  ('Instinto', 'twerk', 3), ('Instinto', 'urbano', 3)
) as q(plan_name, category_slug, max_classes)
join public.plans p on p.name = q.plan_name and p.deleted_at is null
join public.class_categories c on c.slug = q.category_slug
on conflict do nothing;

-- 4) Horario de ejemplo (weekday ISO 1 = lunes), hora Bogotá, cupo 6, sin salón definido
insert into public.class_schedules (class_type_id, teacher_id, weekday, start_time, end_time, capacity, valid_from)
select ct.id, t.id, v.weekday, v.start_time::time, v.end_time::time, 6,
       date_trunc('month', (now() at time zone 'America/Bogota'))::date
from (values
  ('twerk-recreativo', 'Mae', 2, '19:00', '20:00'),
  ('twerk-recreativo', 'Mae', 4, '19:00', '20:00'),
  ('hip-hop', 'Jahn Evels', 1, '19:00', '20:00'),
  ('hip-hop', 'Jahn Evels', 3, '19:00', '20:00'),
  ('twerk-recreativo', 'Angélica', 5, '18:00', '19:00')
) as v(slug, teacher, weekday, start_time, end_time)
join public.class_types ct on ct.slug = v.slug
join public.teachers t on t.full_name = v.teacher and t.deleted_at is null
where not exists (
  select 1 from public.class_schedules s
  where s.class_type_id = ct.id and s.teacher_id = t.id
    and s.weekday = v.weekday and s.start_time = v.start_time::time
);

-- 5) Sesiones del mes actual y el siguiente
select public._generate_sessions_range(
  date_trunc('month', (now() at time zone 'America/Bogota'))::date,
  public._month_end((public._month_end((now() at time zone 'America/Bogota')::date) + 1))
);
