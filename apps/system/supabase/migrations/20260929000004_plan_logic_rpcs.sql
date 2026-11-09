-- Lógica de planes: cupos por categoría, mes calendario, renovación, congelación, planificación mensual.

-- ---------------------------------------------------------------- _plan_reason
-- null = el plan admite una reserva más de ese tipo de clase; si no, código de hint.
create function public._plan_reason(p_sp_id uuid, p_class_type_id uuid, p_starts_at timestamptz)
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_tz constant text := 'America/Bogota';
  v_week timestamp := date_trunc('week', p_starts_at at time zone v_tz);
  r record;
  v_n int;
  v_cat uuid;
  v_quota int;
begin
  select sp.id, sp.plan_id, sp.classes_total, sp.classes_used, sp.frozen_at,
         pl.type as plan_type, pl.weekly_limit
    into r
  from public.student_plans sp join public.plans pl on pl.id = sp.plan_id
  where sp.id = p_sp_id;
  if not found then
    return 'PLAN_NOT_FOUND';
  end if;
  if r.frozen_at is not null then
    return 'PLAN_FROZEN';
  end if;

  if r.plan_type = 'package' then
    select count(*) into v_n
    from public.bookings b
    join public.class_sessions s on s.id = b.session_id
    where b.student_plan_id = r.id and b.status = 'booked'
      and s.status = 'scheduled' and s.starts_at > now()
      and not exists (select 1 from public.attendance a where a.booking_id = b.id and a.consumed);
    if coalesce(r.classes_total, 0) - r.classes_used - v_n <= 0 then
      return 'PLAN_LIMIT_REACHED';
    end if;
  else
    select count(*) into v_n
    from public.bookings b
    join public.class_sessions s on s.id = b.session_id
    where b.student_plan_id = r.id and b.status = 'booked'
      and s.status = 'scheduled'
      and date_trunc('week', s.starts_at at time zone v_tz) = v_week;
    if v_n >= r.weekly_limit then
      return 'PLAN_LIMIT_REACHED';
    end if;
  end if;

  -- cupo por categoría (solo si el plan define cupos y la clase tiene categoría)
  select ct.category_id into v_cat from public.class_types ct where ct.id = p_class_type_id;
  if v_cat is not null then
    select q.max_classes into v_quota
    from public.plan_category_quotas q
    where q.plan_id = r.plan_id and q.category_id = v_cat;
    if found then
      select
        (select count(*)
           from public.bookings b
           join public.class_sessions s on s.id = b.session_id
           join public.class_types ct on ct.id = s.class_type_id
          where b.student_plan_id = r.id and b.status = 'booked'
            and ct.category_id = v_cat
            and s.status = 'scheduled' and s.starts_at > now()
            and not exists (select 1 from public.attendance a where a.booking_id = b.id and a.consumed))
        +
        (select count(*)
           from public.attendance a
           join public.class_sessions s on s.id = a.session_id
           join public.class_types ct on ct.id = s.class_type_id
          where a.student_plan_id = r.id and a.consumed and ct.category_id = v_cat)
      into v_n;
      if v_n >= v_quota then
        return 'CATEGORY_QUOTA_REACHED';
      end if;
    end if;
  end if;
  return null;
end;
$$;

-- ---------------------------------------------------------------- _plan_lookup
-- o_plan_id = plan válido (o null). Si no hay, o_reason = motivo del primer candidato bloqueado
-- (PLAN_FROZEN / PLAN_LIMIT_REACHED / CATEGORY_QUOTA_REACHED) o null si ningún plan aplica.
create function public._plan_lookup(
  p_student_id uuid, p_class_type_id uuid, p_starts_at timestamptz, p_private boolean,
  out o_plan_id uuid, out o_reason text
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_tz constant text := 'America/Bogota';
  v_date date := (p_starts_at at time zone v_tz)::date;
  v_today date := (now() at time zone v_tz)::date;
  r record;
  v_reason text;
begin
  for r in
    select sp.id
    from public.student_plans sp
    join public.plans pl on pl.id = sp.plan_id
    where sp.student_id = p_student_id
      and sp.status = 'active'
      and sp.starts_on <= v_date
      and sp.expires_on >= v_date
      and sp.expires_on >= v_today
      and pl.is_private = p_private
      and exists (
        select 1 from public.plan_class_types pct
        where pct.plan_id = sp.plan_id and pct.class_type_id = p_class_type_id
      )
    order by sp.expires_on, sp.created_at
  loop
    v_reason := public._plan_reason(r.id, p_class_type_id, p_starts_at);
    if v_reason is null then
      o_plan_id := r.id;
      o_reason := null;
      return;
    end if;
    o_reason := coalesce(o_reason, v_reason);
  end loop;
  o_plan_id := null;
end;
$$;

create or replace function public._find_valid_plan(
  p_student_id uuid, p_class_type_id uuid, p_starts_at timestamptz, p_private boolean
) returns uuid
language sql stable security definer set search_path = ''
as $$
  select o_plan_id from public._plan_lookup(p_student_id, p_class_type_id, p_starts_at, p_private);
$$;

revoke execute on function public._plan_reason(uuid, uuid, timestamptz) from public, anon, authenticated;
revoke execute on function public._plan_lookup(uuid, uuid, timestamptz, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------- student_plans defaults (precio)
create or replace function public.student_plans_defaults()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_plan public.plans;
begin
  select * into v_plan from public.plans where id = new.plan_id;
  if v_plan.type = 'package' and new.classes_total is null then
    new.classes_total := v_plan.class_count;
  end if;
  if v_plan.type = 'monthly' then
    new.classes_total := null;
  end if;
  if new.price is null then
    new.price := v_plan.price;
  end if;
  return new;
end;
$$;

-- los planes congelados no vencen
create or replace function public.expire_student_plans()
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_n int;
begin
  update public.student_plans
     set status = 'expired'
   where status = 'active' and frozen_at is null
     and expires_on < (now() at time zone 'America/Bogota')::date;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- ---------------------------------------------------------------- book_session
create or replace function public.book_session(p_session_id uuid)
returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session public.class_sessions;
  v_plan uuid;
  v_reason text;
  v_booked int;
  v_booking public.bookings;
  v_date date;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using hint = 'NOT_AUTHENTICATED';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = v_uid and status = 'active' and deleted_at is null
  ) or not public.is_student_or_dev(v_uid) then
    raise exception 'Solo alumnas activas pueden reservar' using hint = 'NOT_ACTIVE_STUDENT';
  end if;

  select * into v_session from public.class_sessions where id = p_session_id for update;
  if not found then
    raise exception 'La clase no existe' using hint = 'SESSION_NOT_FOUND';
  end if;
  if v_session.status <> 'scheduled' then
    raise exception 'La clase fue cancelada' using hint = 'SESSION_CANCELLED';
  end if;
  if v_session.kind <> 'group' then
    raise exception 'Las clases personalizadas las agenda la academia' using hint = 'SESSION_PRIVATE';
  end if;
  if v_session.starts_at <= now() then
    raise exception 'La clase ya comenzó' using hint = 'SESSION_STARTED';
  end if;
  if exists (
    select 1 from public.bookings
    where session_id = p_session_id and student_id = v_uid and status <> 'cancelled'
  ) then
    raise exception 'Ya tienes una reserva en esta clase' using hint = 'ALREADY_BOOKED';
  end if;

  select l.o_plan_id, l.o_reason into v_plan, v_reason
  from public._plan_lookup(v_uid, v_session.class_type_id, v_session.starts_at, false) l;
  if v_plan is null then
    if v_reason = 'PLAN_FROZEN' then
      raise exception 'Tu plan está congelado' using hint = 'PLAN_FROZEN';
    elsif v_reason = 'CATEGORY_QUOTA_REACHED' then
      raise exception 'Alcanzaste el máximo de clases de esta categoría en tu plan' using hint = 'CATEGORY_QUOTA_REACHED';
    elsif v_reason = 'PLAN_LIMIT_REACHED' then
      raise exception 'Tu plan alcanzó su límite de clases' using hint = 'PLAN_LIMIT_REACHED';
    end if;
    v_date := (v_session.starts_at at time zone 'America/Bogota')::date;
    if not exists (
      select 1 from public.student_plans sp join public.plans pl on pl.id = sp.plan_id
      where sp.student_id = v_uid and sp.status = 'active' and not pl.is_private
        and sp.starts_on <= v_date and sp.expires_on >= v_date
        and sp.expires_on >= (now() at time zone 'America/Bogota')::date
    ) then
      raise exception 'No tienes un plan vigente para esta fecha' using hint = 'NO_ACTIVE_PLAN';
    elsif not exists (
      select 1 from public.student_plans sp join public.plans pl on pl.id = sp.plan_id
      join public.plan_class_types pct on pct.plan_id = pl.id
      where sp.student_id = v_uid and sp.status = 'active' and not pl.is_private
        and sp.starts_on <= v_date and sp.expires_on >= v_date
        and pct.class_type_id = v_session.class_type_id
    ) then
      raise exception 'Tu plan no incluye este tipo de clase' using hint = 'CLASS_TYPE_NOT_COVERED';
    else
      raise exception 'Tu plan alcanzó su límite de clases' using hint = 'PLAN_LIMIT_REACHED';
    end if;
  end if;

  select count(*) into v_booked from public.bookings
  where session_id = p_session_id and status = 'booked';

  if v_booked < v_session.capacity then
    insert into public.bookings (session_id, student_id, student_plan_id, status, created_by)
    values (p_session_id, v_uid, v_plan, 'booked', v_uid)
    returning * into v_booking;
  else
    insert into public.bookings (session_id, student_id, student_plan_id, status, waitlist_position, created_by)
    values (
      p_session_id, v_uid, v_plan, 'waitlist',
      coalesce((select max(waitlist_position) from public.bookings
                where session_id = p_session_id and status = 'waitlist'), 0) + 1,
      v_uid
    )
    returning * into v_booking;
  end if;
  return v_booking;
end;
$$;

-- ---------------------------------------------------------------- admin_add_student_to_session (+ p_force)
drop function public.admin_add_student_to_session(uuid, uuid, uuid);
create function public.admin_add_student_to_session(
  p_session_id uuid, p_student_id uuid, p_student_plan_id uuid default null, p_force boolean default false
) returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session public.class_sessions;
  v_plan public.student_plans;
  v_plan_id uuid := p_student_plan_id;
  v_reason text;
  v_existing public.bookings;
  v_booking public.bookings;
  v_date date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede hacer esto' using hint = 'FORBIDDEN';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = p_student_id and status = 'active' and deleted_at is null
  ) or not public.is_student_or_dev(p_student_id) then
    raise exception 'La alumna no existe o no está activa' using hint = 'STUDENT_NOT_ACTIVE';
  end if;

  select * into v_session from public.class_sessions where id = p_session_id for update;
  if not found then
    raise exception 'La clase no existe' using hint = 'SESSION_NOT_FOUND';
  end if;
  if v_session.status <> 'scheduled' then
    raise exception 'La clase fue cancelada' using hint = 'SESSION_CANCELLED';
  end if;
  v_date := (v_session.starts_at at time zone 'America/Bogota')::date;

  if v_plan_id is not null then
    select * into v_plan from public.student_plans
    where id = v_plan_id and student_id = p_student_id;
    if not found then
      raise exception 'El plan no pertenece a la alumna' using hint = 'PLAN_NOT_FOUND';
    end if;
    if v_plan.status = 'cancelled' then
      raise exception 'El plan está cancelado' using hint = 'PLAN_CANCELLED';
    end if;
    if v_date > v_plan.expires_on or v_date < v_plan.starts_on then
      raise exception 'El plan no está vigente en la fecha de la clase' using hint = 'PLAN_EXPIRED';
    end if;
    if not p_force then
      v_reason := public._plan_reason(v_plan_id, v_session.class_type_id, v_session.starts_at);
      if v_reason = 'PLAN_FROZEN' then
        raise exception 'El plan está congelado' using hint = 'PLAN_FROZEN';
      elsif v_reason = 'CATEGORY_QUOTA_REACHED' then
        raise exception 'El plan alcanzó el máximo de clases de esta categoría' using hint = 'CATEGORY_QUOTA_REACHED';
      end if;
    end if;
  else
    select l.o_plan_id, l.o_reason into v_plan_id, v_reason
    from public._plan_lookup(p_student_id, v_session.class_type_id, v_session.starts_at, v_session.kind = 'private') l;
    if v_plan_id is null and not p_force then
      if v_reason = 'PLAN_FROZEN' then
        raise exception 'El plan de la alumna está congelado' using hint = 'PLAN_FROZEN';
      elsif v_reason = 'CATEGORY_QUOTA_REACHED' then
        raise exception 'El plan alcanzó el máximo de clases de esta categoría' using hint = 'CATEGORY_QUOTA_REACHED';
      end if;
    end if;
  end if;

  select * into v_existing from public.bookings
  where session_id = p_session_id and student_id = p_student_id and status <> 'cancelled'
  for update;
  if found then
    if v_existing.status = 'booked' then
      raise exception 'La alumna ya está reservada en esta clase' using hint = 'ALREADY_BOOKED';
    end if;
    update public.bookings
       set status = 'booked', waitlist_position = null, promoted_at = now(),
           student_plan_id = coalesce(v_plan_id, student_plan_id)
     where id = v_existing.id
     returning * into v_booking;
    perform public._renumber_waitlist(p_session_id);
  else
    insert into public.bookings (session_id, student_id, student_plan_id, status, created_by)
    values (p_session_id, p_student_id, v_plan_id, 'booked', v_uid)
    returning * into v_booking;
  end if;

  perform public._notify(
    p_student_id, 'booking_added', 'Te agregaron a una clase',
    'Quedaste inscrita en ' || public._session_label(p_session_id) || '.', p_session_id
  );
  return v_booking;
end;
$$;

revoke execute on function public.admin_add_student_to_session(uuid, uuid, uuid, boolean) from public, anon;
grant execute on function public.admin_add_student_to_session(uuid, uuid, uuid, boolean) to authenticated;

-- ---------------------------------------------------------------- asignar / renovar planes
create function public._assign_plan_core(
  p_student_id uuid, p_plan_id uuid, p_starts_on date, p_month date,
  p_notes text, p_price numeric, p_created_by uuid
) returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_plan public.plans;
  v_m date;
  v_start date;
  v_exp date;
  v_row public.student_plans;
begin
  if not public.is_student_or_dev(p_student_id) then
    raise exception 'La alumna no existe' using hint = 'STUDENT_NOT_FOUND';
  end if;
  select * into v_plan from public.plans where id = p_plan_id and active and deleted_at is null;
  if not found then
    raise exception 'El plan no existe o está inactivo' using hint = 'PLAN_NOT_FOUND';
  end if;
  if p_price is not null and p_price < 0 then
    raise exception 'El valor no puede ser negativo' using hint = 'INVALID_PRICE';
  end if;

  if p_month is not null then
    v_m := public._month_start(p_month);
    if v_m < public._month_start(v_today) then
      raise exception 'No se pueden asignar planes a un mes pasado' using hint = 'INVALID_MONTH';
    end if;
    v_start := case when v_m = public._month_start(v_today) then v_today else v_m end;
  else
    v_start := coalesce(p_starts_on, v_today);
  end if;

  v_exp := case when v_plan.validity = 'calendar_month'
                then public._month_end(v_start)
                else v_start + v_plan.duration_days end;

  insert into public.student_plans (
    student_id, plan_id, starts_on, expires_on, classes_total, price, notes, created_by
  ) values (
    p_student_id, p_plan_id, v_start, v_exp,
    case when v_plan.type = 'package' then v_plan.class_count end,
    coalesce(p_price, v_plan.price), p_notes, p_created_by
  )
  returning * into v_row;
  return v_row;
end;
$$;

drop function public.assign_plan(uuid, uuid, date, text);
create function public.assign_plan(
  p_student_id uuid, p_plan_id uuid, p_starts_on date default null, p_notes text default null,
  p_month date default null, p_price numeric default null
) returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede asignar planes' using hint = 'FORBIDDEN';
  end if;
  return public._assign_plan_core(
    p_student_id, p_plan_id, p_starts_on, p_month, p_notes, p_price, (select auth.uid())
  );
end;
$$;

create function public.renew_plan(p_student_plan_id uuid, p_price numeric default null)
returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_sp public.student_plans;
  v_plan public.plans;
  v_target date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede renovar planes' using hint = 'FORBIDDEN';
  end if;
  select * into v_sp from public.student_plans where id = p_student_plan_id;
  if not found then
    raise exception 'El plan de la alumna no existe' using hint = 'STUDENT_PLAN_NOT_FOUND';
  end if;
  select * into v_plan from public.plans where id = v_sp.plan_id;
  if v_plan.validity <> 'calendar_month' then
    raise exception 'Solo se renuevan planes por mes calendario' using hint = 'PLAN_NOT_RENEWABLE';
  end if;

  v_target := (public._month_start(v_sp.starts_on) + interval '1 month')::date;
  if v_target < public._month_start(v_today) then
    v_target := public._month_start(v_today);
  end if;

  if exists (
    select 1 from public.student_plans o
    where o.student_id = v_sp.student_id and o.plan_id = v_sp.plan_id
      and o.status <> 'cancelled' and public._month_start(o.starts_on) = v_target
  ) then
    raise exception 'La alumna ya tiene este plan para ese mes' using hint = 'ALREADY_RENEWED';
  end if;

  return public._assign_plan_core(
    v_sp.student_id, v_sp.plan_id, null, v_target, null, p_price, (select auth.uid())
  );
end;
$$;

create function public.renew_plans_bulk(p_student_plan_ids uuid[], p_month date)
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_m date := public._month_start(coalesce(p_month, v_today));
  v_id uuid;
  v_sp public.student_plans;
  v_n int := 0;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede renovar planes' using hint = 'FORBIDDEN';
  end if;
  if v_m < public._month_start(v_today) then
    raise exception 'No se pueden asignar planes a un mes pasado' using hint = 'INVALID_MONTH';
  end if;

  foreach v_id in array coalesce(p_student_plan_ids, '{}'::uuid[]) loop
    select * into v_sp from public.student_plans where id = v_id;
    continue when not found;
    continue when exists (
      select 1 from public.student_plans o
      where o.student_id = v_sp.student_id and o.plan_id = v_sp.plan_id
        and o.status <> 'cancelled' and public._month_start(o.starts_on) = v_m
    );
    begin
      perform public._assign_plan_core(
        v_sp.student_id, v_sp.plan_id, null, v_m, null, null, (select auth.uid())
      );
      v_n := v_n + 1;
    exception when raise_exception then
      null; -- alumna o plan ya no disponible: se omite
    end;
  end loop;
  return v_n;
end;
$$;

-- ---------------------------------------------------------------- congelar
create function public.freeze_plan(p_student_plan_id uuid, p_reason text default null)
returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_sp public.student_plans;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede congelar planes' using hint = 'FORBIDDEN';
  end if;
  select * into v_sp from public.student_plans where id = p_student_plan_id for update;
  if not found then
    raise exception 'El plan de la alumna no existe' using hint = 'STUDENT_PLAN_NOT_FOUND';
  end if;
  if v_sp.status <> 'active' or v_sp.expires_on < (now() at time zone 'America/Bogota')::date then
    raise exception 'Solo se congelan planes vigentes' using hint = 'PLAN_EXPIRED';
  end if;
  if v_sp.frozen_at is not null then
    raise exception 'El plan ya está congelado' using hint = 'ALREADY_FROZEN';
  end if;

  update public.student_plans set frozen_at = now() where id = p_student_plan_id
  returning * into v_sp;
  insert into public.student_plan_freezes (student_plan_id, reason, created_by)
  values (p_student_plan_id, nullif(btrim(p_reason), ''), (select auth.uid()));
  return v_sp;
end;
$$;

create function public.unfreeze_plan(p_student_plan_id uuid)
returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_sp public.student_plans;
  v_days int;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede descongelar planes' using hint = 'FORBIDDEN';
  end if;
  select * into v_sp from public.student_plans where id = p_student_plan_id for update;
  if not found then
    raise exception 'El plan de la alumna no existe' using hint = 'STUDENT_PLAN_NOT_FOUND';
  end if;
  if v_sp.frozen_at is null then
    raise exception 'El plan no está congelado' using hint = 'NOT_FROZEN';
  end if;

  v_days := greatest(
    (now() at time zone 'America/Bogota')::date - (v_sp.frozen_at at time zone 'America/Bogota')::date, 0
  );
  update public.student_plans
     set frozen_at = null, frozen_days = frozen_days + v_days,
         expires_on = expires_on + v_days
   where id = p_student_plan_id
   returning * into v_sp;
  update public.student_plan_freezes set ended_at = now()
   where student_plan_id = p_student_plan_id and ended_at is null;
  return v_sp;
end;
$$;

-- ---------------------------------------------------------------- save_plan (+ cupos por categoría y vigencia)
drop function public.save_plan(uuid, text, text, public.plan_type, integer, integer, integer, numeric, boolean, boolean, uuid[]);
create function public.save_plan(
  p_plan_id uuid,
  p_name text,
  p_description text,
  p_type public.plan_type,
  p_class_count integer,
  p_weekly_limit integer,
  p_duration_days integer,
  p_price numeric,
  p_is_private boolean,
  p_active boolean,
  p_class_type_ids uuid[],
  p_category_quotas jsonb default null,
  p_validity public.plan_validity default null
) returns public.plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_plan public.plans;
  q jsonb;
  v_cat uuid;
  v_max int;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede guardar planes' using hint = 'FORBIDDEN';
  end if;
  if coalesce(array_length(p_class_type_ids, 1), 0) = 0 then
    raise exception 'Elige al menos un estilo para el plan' using hint = 'CLASS_TYPES_REQUIRED';
  end if;
  if p_category_quotas is not null and jsonb_typeof(p_category_quotas) <> 'array' then
    raise exception 'Los cupos por categoría deben ser una lista' using hint = 'INVALID_QUOTA';
  end if;

  if p_plan_id is null then
    insert into public.plans (name, description, type, class_count, weekly_limit, duration_days, price, is_private, active, validity)
    values (p_name, p_description, p_type, p_class_count, p_weekly_limit, p_duration_days, p_price, p_is_private, p_active,
            coalesce(p_validity, 'calendar_month'))
    returning * into v_plan;
  else
    update public.plans
       set name = p_name, description = p_description, type = p_type, class_count = p_class_count,
           weekly_limit = p_weekly_limit, duration_days = p_duration_days, price = p_price,
           is_private = p_is_private, active = p_active, validity = coalesce(p_validity, validity)
     where id = p_plan_id and deleted_at is null
     returning * into v_plan;
    if not found then
      raise exception 'El plan no existe' using hint = 'PLAN_NOT_FOUND';
    end if;
  end if;

  delete from public.plan_class_types
   where plan_id = v_plan.id and class_type_id <> all (p_class_type_ids);
  insert into public.plan_class_types (plan_id, class_type_id)
  select v_plan.id, unnest(p_class_type_ids)
  on conflict do nothing;

  if p_category_quotas is not null then
    delete from public.plan_category_quotas where plan_id = v_plan.id;
    for q in select * from jsonb_array_elements(p_category_quotas) loop
      begin
        v_cat := (q ->> 'category_id')::uuid;
        v_max := (q ->> 'max_classes')::int;
      exception when others then
        raise exception 'Cupo por categoría inválido' using hint = 'INVALID_QUOTA';
      end;
      if v_cat is null or v_max is null or v_max <= 0 then
        raise exception 'Cupo por categoría inválido' using hint = 'INVALID_QUOTA';
      end if;
      if not exists (select 1 from public.class_categories where id = v_cat) then
        raise exception 'La categoría no existe' using hint = 'CATEGORY_NOT_FOUND';
      end if;
      insert into public.plan_category_quotas (plan_id, category_id, max_classes)
      values (v_plan.id, v_cat, v_max)
      on conflict (plan_id, category_id) do update set max_classes = excluded.max_classes;
    end loop;
  end if;
  return v_plan;
end;
$$;

-- ---------------------------------------------------------------- planificación mensual
create function public._generate_sessions_range(p_from date, p_to date)
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_n int;
begin
  insert into public.class_sessions (
    schedule_id, class_type_id, teacher_id, room_id, kind, description, starts_at, ends_at, capacity
  )
  select s.id, s.class_type_id, s.teacher_id, s.room_id, 'group', s.description,
         (g.d::date + s.start_time) at time zone 'America/Bogota',
         (g.d::date + s.end_time) at time zone 'America/Bogota',
         s.capacity
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

create or replace function public._generate_sessions(p_from date, p_weeks int)
returns int
language sql security definer set search_path = ''
as $$ select public._generate_sessions_range(p_from, p_from + (p_weeks * 7 - 1)); $$;

create function public.generate_month_sessions(p_month date)
returns int
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede generar clases' using hint = 'FORBIDDEN';
  end if;
  if p_month is null then
    raise exception 'Indica el mes' using hint = 'INVALID_MONTH';
  end if;
  return public._generate_sessions_range(public._month_start(p_month), public._month_end(p_month));
end;
$$;

-- ---------------------------------------------------------------- permisos
revoke execute on function public._assign_plan_core(uuid, uuid, date, date, text, numeric, uuid) from public, anon, authenticated;
revoke execute on function public._generate_sessions_range(date, date) from public, anon, authenticated;
revoke execute on function public._generate_sessions(date, int) from public, anon, authenticated;
revoke execute on function public.expire_student_plans() from public, anon, authenticated;

revoke execute on function public.assign_plan(uuid, uuid, date, text, date, numeric) from public, anon;
revoke execute on function public.renew_plan(uuid, numeric) from public, anon;
revoke execute on function public.renew_plans_bulk(uuid[], date) from public, anon;
revoke execute on function public.freeze_plan(uuid, text) from public, anon;
revoke execute on function public.unfreeze_plan(uuid) from public, anon;
revoke execute on function public.save_plan(uuid, text, text, public.plan_type, integer, integer, integer, numeric, boolean, boolean, uuid[], jsonb, public.plan_validity) from public, anon;
revoke execute on function public.generate_month_sessions(date) from public, anon;
grant execute on function public.assign_plan(uuid, uuid, date, text, date, numeric) to authenticated;
grant execute on function public.renew_plan(uuid, numeric) to authenticated;
grant execute on function public.renew_plans_bulk(uuid[], date) to authenticated;
grant execute on function public.freeze_plan(uuid, text) to authenticated;
grant execute on function public.unfreeze_plan(uuid) to authenticated;
grant execute on function public.save_plan(uuid, text, text, public.plan_type, integer, integer, integer, numeric, boolean, boolean, uuid[], jsonb, public.plan_validity) to authenticated;
grant execute on function public.generate_month_sessions(date) to authenticated;
