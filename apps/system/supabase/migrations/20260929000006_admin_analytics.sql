-- RPCs de analítica para el panel admin (todas solo admin: hint FORBIDDEN).

create function public._birthday_in_year(p_birth date, p_year int)
returns date
language sql immutable set search_path = ''
as $$
  select case
    when extract(month from p_birth) = 2 and extract(day from p_birth) = 29
         and not ((p_year % 4 = 0 and p_year % 100 <> 0) or p_year % 400 = 0)
      then make_date(p_year, 2, 28)
    else make_date(p_year, extract(month from p_birth)::int, extract(day from p_birth)::int)
  end;
$$;
revoke execute on function public._birthday_in_year(date, int) from public, anon, authenticated;

-- ---------------------------------------------------------------- suscripciones del mes
create function public.admin_subscriptions_overview(p_month date default null)
returns table (
  student_id uuid, full_name text, avatar_url text, phone text, birth_date date,
  student_plan_id uuid, plan_id uuid, plan_name text,
  price numeric, paid numeric, balance numeric, payment_status text,
  classes_total int, classes_used int, classes_remaining int, expires_on date, is_frozen boolean,
  prev_student_plan_id uuid, prev_plan_id uuid, prev_plan_name text,
  last_payment_on date, last_attended_at timestamptz,
  bucket text,
  expired_not_renewed boolean, balance_due boolean, expiring_soon boolean, no_plan boolean
)
language plpgsql stable security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_start date := public._month_start(coalesce(p_month, (now() at time zone 'America/Bogota')::date));
  v_end date;
  v_prev_start date;
  v_prev_end date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  v_end := public._month_end(v_start);
  v_prev_end := v_start - 1;
  v_prev_start := public._month_start(v_prev_end);

  return query
  with cur as (
    select distinct on (sp.student_id)
           sp.id, sp.student_id, sp.plan_id, pl.name as plan_name, sp.price,
           sp.classes_total, sp.classes_used, sp.expires_on, sp.frozen_at, sp.status
    from public.student_plans sp
    join public.plans pl on pl.id = sp.plan_id
    where sp.status <> 'cancelled' and sp.starts_on <= v_end and sp.expires_on >= v_start
    order by sp.student_id, pl.is_private, sp.starts_on desc, sp.created_at desc
  ), prev as (
    select distinct on (sp.student_id)
           sp.id, sp.student_id, sp.plan_id, pl.name as plan_name
    from public.student_plans sp
    join public.plans pl on pl.id = sp.plan_id
    where sp.status <> 'cancelled' and sp.starts_on <= v_prev_end and sp.expires_on >= v_prev_start
    order by sp.student_id, pl.is_private, sp.starts_on desc, sp.created_at desc
  ), base as (
    select p.id as student_id, p.full_name, p.avatar_url, p.phone, p.birth_date,
           c.id as sp_id, c.plan_id, c.plan_name, c.price,
           coalesce((select sum(pm.amount) from public.payments pm
                      where pm.student_plan_id = c.id and pm.voided_at is null), 0) as paid,
           c.classes_total, c.classes_used, c.expires_on, (c.frozen_at is not null) as is_frozen,
           c.frozen_at, c.status,
           pv.id as prev_sp_id, pv.plan_id as prev_plan_id, pv.plan_name as prev_plan_name,
           (select max(pm.paid_on) from public.payments pm
             where pm.student_id = p.id and pm.voided_at is null) as last_payment_on,
           (select max(s.starts_at) from public.attendance a
              join public.class_sessions s on s.id = a.session_id
             where a.student_id = p.id and a.status = 'present') as last_attended_at
    from public.profiles p
    left join cur c on c.student_id = p.id
    left join prev pv on pv.student_id = p.id
    where p.status = 'active' and p.deleted_at is null
      and (p.role = 'student' or (p.is_developer and c.id is not null))
  ), flagged as (
    select b.*,
      (b.sp_id is null and b.prev_sp_id is not null) as f_expired,
      (b.sp_id is not null and coalesce(b.price, 0) - b.paid > 0) as f_balance,
      (b.sp_id is not null and b.status = 'active' and b.frozen_at is null
        and b.expires_on >= v_today
        and ((b.expires_on - v_today) <= 5
             or (b.classes_total is not null and b.classes_total - b.classes_used <= 1))) as f_expiring,
      (b.sp_id is null and b.prev_sp_id is null) as f_noplan
    from base b
  )
  select f.student_id, f.full_name, f.avatar_url, f.phone, f.birth_date,
         f.sp_id, f.plan_id, f.plan_name,
         f.price, f.paid,
         case when f.sp_id is not null then coalesce(f.price, 0) - f.paid end,
         case
           when f.sp_id is null then null
           when coalesce(f.price, 0) = 0 then 'free'
           when f.paid >= f.price then 'paid'
           when f.paid > 0 then 'partial'
           else 'pending'
         end,
         f.classes_total, f.classes_used,
         case when f.classes_total is not null then greatest(f.classes_total - f.classes_used, 0) end,
         f.expires_on, f.is_frozen,
         f.prev_sp_id, f.prev_plan_id, f.prev_plan_name,
         f.last_payment_on, f.last_attended_at,
         case
           when f.f_expired then 'expired_not_renewed'
           when f.f_balance then 'balance_due'
           when f.f_expiring then 'expiring_soon'
           when f.f_noplan then 'no_plan'
           else 'ok'
         end,
         f.f_expired, f.f_balance, f.f_expiring, f.f_noplan
  from flagged f
  order by
    case
      when f.f_expired then 1 when f.f_balance then 2 when f.f_expiring then 3
      when f.f_noplan then 4 else 5
    end,
    f.full_name;
end;
$$;

-- ---------------------------------------------------------------- ingresos
create function public.admin_revenue_report(p_from date, p_to date)
returns table (dimension text, key text, label text, amount numeric, payments_count int)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  return query
  with pay as (
    select pm.amount, pm.method, pm.paid_on, pl.id as plan_id, pl.name as plan_name
    from public.payments pm
    left join public.student_plans sp on sp.id = pm.student_plan_id
    left join public.plans pl on pl.id = sp.plan_id
    where pm.voided_at is null and pm.paid_on between p_from and p_to
  )
  select 'month'::text, to_char(x.paid_on, 'YYYY-MM'), to_char(x.paid_on, 'YYYY-MM'),
         sum(x.amount), count(*)::int
  from pay x group by to_char(x.paid_on, 'YYYY-MM')
  union all
  select 'method'::text, x.method::text,
         case x.method when 'cash' then 'Efectivo' when 'nequi' then 'Nequi'
           when 'daviplata' then 'Daviplata' when 'transfer' then 'Transferencia'
           when 'card' then 'Tarjeta' else 'Otro' end,
         sum(x.amount), count(*)::int
  from pay x group by x.method
  union all
  select 'plan'::text, coalesce(x.plan_id::text, 'none'), coalesce(x.plan_name, 'Sin plan asociado'),
         sum(x.amount), count(*)::int
  from pay x group by x.plan_id, x.plan_name
  order by 1, 2;
end;
$$;

create function public.admin_outstanding_balance()
returns table (total numeric, students int)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  return query
  select coalesce(sum(t.bal), 0)::numeric, count(distinct t.student_id)::int
  from (
    select sp.student_id,
           sp.price - coalesce((select sum(pm.amount) from public.payments pm
                                 where pm.student_plan_id = sp.id and pm.voided_at is null), 0) as bal
    from public.student_plans sp
    where sp.status <> 'cancelled' and coalesce(sp.price, 0) > 0
  ) t
  where t.bal > 0;
end;
$$;

-- ---------------------------------------------------------------- renovaciones
create function public.admin_renewal_report(p_months int default 6)
returns table (dimension text, key text, label text, ended bigint, renewed bigint, renewal_rate numeric)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_cur date := public._month_start((now() at time zone 'America/Bogota')::date);
  v_first date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  if p_months is null or p_months < 1 or p_months > 36 then
    raise exception 'Los meses deben estar entre 1 y 36' using hint = 'INVALID_MONTHS';
  end if;
  v_first := (v_cur - make_interval(months => p_months))::date;

  return query
  with inst as (
    select sp.id, sp.plan_id, pl.name as plan_name, public._month_start(sp.starts_on) as m,
           exists (
             select 1 from public.student_plans n
             where n.student_id = sp.student_id and n.status <> 'cancelled'
               and public._month_start(n.starts_on) = (public._month_start(sp.starts_on) + interval '1 month')::date
           ) as renewed
    from public.student_plans sp
    join public.plans pl on pl.id = sp.plan_id
    where sp.status <> 'cancelled' and public._month_start(sp.starts_on) >= v_first
      and public._month_start(sp.starts_on) < v_cur
  )
  select 'month'::text, to_char(i.m, 'YYYY-MM'), to_char(i.m, 'YYYY-MM'),
         count(*), count(*) filter (where i.renewed),
         round(count(*) filter (where i.renewed)::numeric / nullif(count(*), 0), 4)
  from inst i group by i.m
  union all
  select 'plan'::text, i.plan_id::text, i.plan_name,
         count(*), count(*) filter (where i.renewed),
         round(count(*) filter (where i.renewed)::numeric / nullif(count(*), 0), 4)
  from inst i group by i.plan_id, i.plan_name
  order by 1, 2;
end;
$$;

-- ---------------------------------------------------------------- alumnas en riesgo
create function public.admin_at_risk_students(p_days int default 10)
returns table (
  student_id uuid, full_name text, avatar_url text, phone text,
  last_attended_at timestamptz, usual_weekly numeric, days_since int
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  if p_days is null or p_days < 1 then
    raise exception 'Los días deben ser al menos 1' using hint = 'INVALID_DAYS';
  end if;
  return query
  select p.id, p.full_name, p.avatar_url, p.phone, st.last_at,
         round(st.prior_n / 4.0, 2),
         floor(extract(epoch from (now() - st.last_at)) / 86400)::int
  from public.profiles p
  cross join lateral (
    select max(s.starts_at) as last_at,
           count(*) filter (
             where s.starts_at >= now() - make_interval(days => p_days + 28)
               and s.starts_at < now() - make_interval(days => p_days)) as prior_n,
           count(*) filter (where s.starts_at >= now() - make_interval(days => p_days)) as recent
    from public.attendance a
    join public.class_sessions s on s.id = a.session_id
    where a.student_id = p.id and a.status = 'present'
  ) st
  where p.role = 'student' and p.status = 'active' and p.deleted_at is null
    and st.prior_n >= 4 and st.recent = 0
    and not exists (
      select 1 from public.bookings b
      join public.class_sessions s on s.id = b.session_id
      where b.student_id = p.id and b.status = 'booked'
        and s.status = 'scheduled' and s.starts_at > now()
    )
  order by st.last_at, p.full_name;
end;
$$;

-- ---------------------------------------------------------------- cumpleaños
create function public.admin_upcoming_birthdays(p_days int default 7)
returns table (
  profile_id uuid, full_name text, avatar_url text, phone text, role public.user_role,
  birth_date date, next_birthday date, days_until int, turning_age int
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_year int := extract(year from (now() at time zone 'America/Bogota'))::int;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  if p_days is null or p_days < 0 then
    raise exception 'Los días no pueden ser negativos' using hint = 'INVALID_DAYS';
  end if;
  return query
  select p.id, p.full_name, p.avatar_url, p.phone, p.role, p.birth_date,
         nb.d, (nb.d - v_today)::int,
         (extract(year from nb.d)::int - extract(year from p.birth_date)::int)
  from public.profiles p
  cross join lateral (
    select min(t.d) as d
    from (select public._birthday_in_year(p.birth_date, y) as d
          from generate_series(v_year, v_year + 1) as y) t
    where t.d >= v_today
  ) nb
  where p.status = 'active' and p.deleted_at is null
    and p.role in ('student', 'teacher') and p.birth_date is not null
    and (nb.d - v_today) <= p_days
  order by nb.d, p.full_name;
end;
$$;

-- ---------------------------------------------------------------- permisos
revoke execute on function public.admin_subscriptions_overview(date) from public, anon;
revoke execute on function public.admin_revenue_report(date, date) from public, anon;
revoke execute on function public.admin_outstanding_balance() from public, anon;
revoke execute on function public.admin_renewal_report(int) from public, anon;
revoke execute on function public.admin_at_risk_students(int) from public, anon;
revoke execute on function public.admin_upcoming_birthdays(int) from public, anon;
grant execute on function public.admin_subscriptions_overview(date) to authenticated;
grant execute on function public.admin_revenue_report(date, date) to authenticated;
grant execute on function public.admin_outstanding_balance() to authenticated;
grant execute on function public.admin_renewal_report(int) to authenticated;
grant execute on function public.admin_at_risk_students(int) to authenticated;
grant execute on function public.admin_upcoming_birthdays(int) to authenticated;
