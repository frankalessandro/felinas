-- Vistas y reportes

-- Resumen por plan de alumna. security_invoker: la alumna solo ve lo suyo (RLS de student_plans), admin todo.
create view public.student_plan_summary
with (security_invoker = true) as
select
  sp.id as student_plan_id,
  sp.student_id,
  sp.plan_id,
  pl.name as plan_name,
  pl.type as plan_type,
  pl.is_private,
  sp.starts_on,
  sp.expires_on,
  case when sp.status = 'active' and sp.expires_on < (now() at time zone 'America/Bogota')::date
       then 'expired'::public.student_plan_status else sp.status end as effective_status,
  sp.classes_total,
  sp.classes_used,
  case when sp.classes_total is not null then greatest(sp.classes_total - sp.classes_used, 0) end as classes_remaining,
  pl.weekly_limit,
  case when pl.type = 'monthly' then (
    select count(*) from public.bookings b
    join public.class_sessions s on s.id = b.session_id
    where b.student_plan_id = sp.id and b.status = 'booked' and s.status = 'scheduled'
      and date_trunc('week', s.starts_at at time zone 'America/Bogota')
        = date_trunc('week', now() at time zone 'America/Bogota')
  ) end as booked_this_week,
  (sp.expires_on - (now() at time zone 'America/Bogota')::date) as days_to_expire,
  (
    sp.status = 'active'
    and sp.expires_on >= (now() at time zone 'America/Bogota')::date
    and (
      (sp.expires_on - (now() at time zone 'America/Bogota')::date) <= 7
      or (sp.classes_total is not null and sp.classes_total - sp.classes_used <= 2)
    )
  ) as is_expiring
from public.student_plans sp
join public.plans pl on pl.id = sp.plan_id;

create function public.admin_inactive_students(p_days int default 14)
returns table (
  student_id uuid, full_name text, email text, phone text, avatar_url text,
  last_attended_at timestamptz, days_inactive int
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  return query
  select p.id, p.full_name, p.email, p.phone, p.avatar_url,
         la.last_at,
         floor(extract(epoch from (now() - coalesce(la.last_at, p.created_at))) / 86400)::int
  from public.profiles p
  left join lateral (
    select max(s.starts_at) as last_at
    from public.attendance a
    join public.class_sessions s on s.id = a.session_id
    where a.student_id = p.id and a.status = 'present'
  ) la on true
  where p.role = 'student' and p.status = 'active' and p.deleted_at is null
    -- alumnas sin asistencias cuentan desde su fecha de registro
    and coalesce(la.last_at, p.created_at) < now() - make_interval(days => p_days)
  order by la.last_at nulls first, p.full_name;
end;
$$;

-- Ocupacion de clases grupales no canceladas. dimension: class_type | teacher | weekday_hour.
create function public.admin_occupancy_report(p_from date, p_to date)
returns table (
  dimension text, key_id uuid, label text, weekday smallint, hour smallint,
  sessions_count int, capacity_total bigint, booked_total bigint, occupancy_rate numeric,
  attended_count bigint, attendance_rate numeric
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  return query
  with base as (
    select s.id, s.class_type_id, s.teacher_id, s.capacity, s.booked_count,
           extract(isodow from s.starts_at at time zone 'America/Bogota')::smallint as wd,
           extract(hour from s.starts_at at time zone 'America/Bogota')::smallint as hr,
           (s.starts_at < now()) as finished,
           (select count(*) from public.attendance a
             where a.session_id = s.id and a.status = 'present') as present
    from public.class_sessions s
    where s.kind = 'group' and s.status = 'scheduled'
      and (s.starts_at at time zone 'America/Bogota')::date between p_from and p_to
  ), agg as (
    select 'class_type'::text as dimension, b.class_type_id as key_id, ct.name as label,
           null::smallint as weekday, null::smallint as hour, b
    from base b join public.class_types ct on ct.id = b.class_type_id
    union all
    select 'teacher', b.teacher_id, t.full_name, null, null, b
    from base b join public.teachers t on t.id = b.teacher_id
    union all
    select 'weekday_hour', null, null, b.wd, b.hr, b from base b
  )
  select a.dimension, a.key_id, a.label, a.weekday, a.hour,
         count(*)::int,
         sum((a.b).capacity)::bigint,
         sum((a.b).booked_count)::bigint,
         round(sum((a.b).booked_count)::numeric / nullif(sum((a.b).capacity), 0), 4),
         sum((a.b).present)::bigint,
         round(sum((a.b).present)::numeric
               / nullif(sum((a.b).booked_count) filter (where (a.b).finished), 0), 4)
  from agg a
  group by a.dimension, a.key_id, a.label, a.weekday, a.hour
  order by a.dimension, a.label, a.weekday, a.hour;
end;
$$;

revoke all on public.student_plan_summary from anon;
grant select on public.student_plan_summary to authenticated;

revoke execute on function public.admin_inactive_students(int) from public, anon;
revoke execute on function public.admin_occupancy_report(date, date) from public, anon;
grant execute on function public.admin_inactive_students(int) to authenticated;
grant execute on function public.admin_occupancy_report(date, date) to authenticated;
