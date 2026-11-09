-- RPCs de negocio. Todas security definer con search_path vacio.
-- Los errores usan `hint` como codigo de maquina para que el frontend los mapee.

-- ---------------------------------------------------------------- internas
create function public._notify(
  p_profile_id uuid, p_type public.notification_type, p_title text, p_body text, p_session_id uuid default null
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.notifications (profile_id, type, title, body, session_id)
  values (p_profile_id, p_type, p_title, p_body, p_session_id);
$$;

create function public._session_label(p_session_id uuid)
returns text
language sql stable security definer set search_path = ''
as $$
  select coalesce(s.title, ct.name) || ' del '
         || to_char(s.starts_at at time zone 'America/Bogota', 'DD/MM/YYYY "a las" HH24:MI')
  from public.class_sessions s
  join public.class_types ct on ct.id = s.class_type_id
  where s.id = p_session_id;
$$;

-- Devuelve el student_plan valido (o null) para reservar una sesion.
create function public._find_valid_plan(
  p_student_id uuid, p_class_type_id uuid, p_starts_at timestamptz, p_private boolean
) returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_tz constant text := 'America/Bogota';
  v_date date := (p_starts_at at time zone v_tz)::date;
  v_today date := (now() at time zone v_tz)::date;
  v_week timestamp := date_trunc('week', p_starts_at at time zone v_tz);
  r record;
  v_n int;
begin
  for r in
    select sp.id, sp.classes_total, sp.classes_used, pl.type as plan_type, pl.weekly_limit
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
    if r.plan_type = 'package' then
      select count(*) into v_n
      from public.bookings b
      join public.class_sessions s on s.id = b.session_id
      where b.student_plan_id = r.id and b.status = 'booked'
        and s.status = 'scheduled' and s.starts_at > now()
        and not exists (select 1 from public.attendance a where a.booking_id = b.id and a.consumed);
      if coalesce(r.classes_total, 0) - r.classes_used - v_n > 0 then
        return r.id;
      end if;
    else
      select count(*) into v_n
      from public.bookings b
      join public.class_sessions s on s.id = b.session_id
      where b.student_plan_id = r.id and b.status = 'booked'
        and s.status = 'scheduled'
        and date_trunc('week', s.starts_at at time zone v_tz) = v_week;
      if v_n < r.weekly_limit then
        return r.id;
      end if;
    end if;
  end loop;
  return null;
end;
$$;

create function public._renumber_waitlist(p_session_id uuid)
returns void
language sql security definer set search_path = ''
as $$
  with r as (
    select id, row_number() over (order by waitlist_position nulls last, created_at) as rn
    from public.bookings
    where session_id = p_session_id and status = 'waitlist'
  )
  update public.bookings b set waitlist_position = r.rn
  from r
  where b.id = r.id and b.waitlist_position is distinct from r.rn;
$$;

-- Supone la sesion bloqueada por el llamador.
create function public._promote_waitlist(p_session_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_session public.class_sessions;
  v_booked int;
  v_promoted boolean;
  v_plan uuid;
  w record;
begin
  select * into v_session from public.class_sessions where id = p_session_id;
  if v_session.status = 'scheduled' and v_session.starts_at > now() then
    loop
      select count(*) into v_booked from public.bookings
      where session_id = p_session_id and status = 'booked';
      exit when v_booked >= v_session.capacity;

      v_promoted := false;
      for w in
        select * from public.bookings
        where session_id = p_session_id and status = 'waitlist'
        order by waitlist_position nulls last, created_at
        for update
      loop
        v_plan := public._find_valid_plan(
          w.student_id, v_session.class_type_id, v_session.starts_at, v_session.kind = 'private'
        );
        if v_plan is not null then
          update public.bookings
             set status = 'booked', waitlist_position = null,
                 student_plan_id = v_plan, promoted_at = now()
           where id = w.id;
          perform public._notify(
            w.student_id, 'booking_promoted', 'Ya tienes cupo',
            'Se liberó un cupo y quedaste reservada en ' || public._session_label(p_session_id) || '.',
            p_session_id
          );
          v_promoted := true;
          exit;
        end if;
      end loop;
      exit when not v_promoted;
    end loop;
  end if;
  perform public._renumber_waitlist(p_session_id);
end;
$$;

create function public._generate_sessions(p_from date, p_weeks int)
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
  from generate_series(p_from::timestamp, (p_from + (p_weeks * 7 - 1))::timestamp, interval '1 day') as g(d)
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

create function public.expire_student_plans()
returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_n int;
begin
  update public.student_plans
     set status = 'expired'
   where status = 'active'
     and expires_on < (now() at time zone 'America/Bogota')::date;
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- ---------------------------------------------------------------- book_session
create function public.book_session(p_session_id uuid)
returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session public.class_sessions;
  v_plan uuid;
  v_booked int;
  v_booking public.bookings;
  v_date date;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using hint = 'NOT_AUTHENTICATED';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = v_uid and role = 'student' and status = 'active' and deleted_at is null
  ) then
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

  v_plan := public._find_valid_plan(v_uid, v_session.class_type_id, v_session.starts_at, false);
  if v_plan is null then
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

-- ---------------------------------------------------------------- cancel_booking
create function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_admin boolean := public.is_admin();
  v_session_id uuid;
  v_session public.class_sessions;
  v_booking public.bookings;
  v_att public.attendance;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using hint = 'NOT_AUTHENTICATED';
  end if;

  select session_id into v_session_id from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'La reserva no existe' using hint = 'BOOKING_NOT_FOUND';
  end if;

  -- orden de bloqueo: sesion, luego reserva (igual que book_session)
  select * into v_session from public.class_sessions where id = v_session_id for update;
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if v_booking.status = 'cancelled' then
    raise exception 'La reserva ya estaba cancelada' using hint = 'ALREADY_CANCELLED';
  end if;
  if not v_admin then
    if v_booking.student_id <> v_uid then
      raise exception 'No puedes cancelar esta reserva' using hint = 'FORBIDDEN';
    end if;
    if v_session.starts_at <= now() then
      raise exception 'La clase ya comenzó' using hint = 'SESSION_STARTED';
    end if;
  end if;

  select * into v_att from public.attendance where booking_id = p_booking_id for update;
  if found then
    if v_att.consumed then
      update public.student_plans
         set classes_used = greatest(classes_used - 1, 0)
       where id = v_att.student_plan_id;
    end if;
    delete from public.attendance where id = v_att.id;
  end if;

  update public.bookings
     set status = 'cancelled', cancelled_at = now(), waitlist_position = null
   where id = p_booking_id
   returning * into v_booking;

  if v_session.status = 'scheduled' then
    perform public._promote_waitlist(v_session_id);
  end if;
  return v_booking;
end;
$$;

-- ---------------------------------------------------------------- admin_add_student_to_session
create function public.admin_add_student_to_session(
  p_session_id uuid, p_student_id uuid, p_student_plan_id uuid default null
) returns public.bookings
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session public.class_sessions;
  v_plan public.student_plans;
  v_plan_id uuid := p_student_plan_id;
  v_existing public.bookings;
  v_booking public.bookings;
  v_date date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede hacer esto' using hint = 'FORBIDDEN';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = p_student_id and role = 'student' and status = 'active' and deleted_at is null
  ) then
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
  else
    v_plan_id := public._find_valid_plan(
      p_student_id, v_session.class_type_id, v_session.starts_at, v_session.kind = 'private'
    );
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

-- ---------------------------------------------------------------- mark_attendance
create function public.mark_attendance(p_booking_id uuid, p_status public.attendance_status)
returns public.attendance
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_session_id uuid;
  v_session public.class_sessions;
  v_booking public.bookings;
  v_att public.attendance;
  v_plan public.student_plans;
  v_plan_id uuid;
  v_consumed boolean;
  v_date date;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede marcar asistencia' using hint = 'FORBIDDEN';
  end if;

  select session_id into v_session_id from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'La reserva no existe' using hint = 'BOOKING_NOT_FOUND';
  end if;
  select * into v_session from public.class_sessions where id = v_session_id for update;
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if v_booking.status <> 'booked' then
    raise exception 'Solo se marca asistencia de reservas confirmadas' using hint = 'BOOKING_NOT_BOOKED';
  end if;
  if v_session.status = 'cancelled' then
    raise exception 'La clase fue cancelada' using hint = 'SESSION_CANCELLED';
  end if;

  select * into v_att from public.attendance where booking_id = p_booking_id for update;
  v_plan_id := coalesce(v_att.student_plan_id, v_booking.student_plan_id);
  v_consumed := coalesce(v_att.consumed, false);

  if p_status = 'present' and not v_consumed then
    if v_plan_id is null then
      v_plan_id := public._find_valid_plan(
        v_booking.student_id, v_session.class_type_id, v_session.starts_at, v_session.kind = 'private'
      );
    end if;
    if v_plan_id is not null then
      select * into v_plan from public.student_plans where id = v_plan_id for update;
      v_date := (v_session.starts_at at time zone 'America/Bogota')::date;
      if v_plan.status = 'cancelled' then
        raise exception 'El plan está cancelado' using hint = 'PLAN_CANCELLED';
      end if;
      if v_date > v_plan.expires_on or v_date < v_plan.starts_on then
        raise exception 'El plan no estaba vigente en la fecha de la clase' using hint = 'PLAN_EXPIRED';
      end if;
      if v_plan.classes_total is not null and v_plan.classes_used >= v_plan.classes_total then
        raise exception 'El plan no tiene clases disponibles' using hint = 'PLAN_EXHAUSTED';
      end if;
      update public.student_plans set classes_used = classes_used + 1 where id = v_plan_id;
      v_consumed := true;
    end if;
  elsif p_status <> 'present' and v_consumed then
    update public.student_plans
       set classes_used = greatest(classes_used - 1, 0)
     where id = v_att.student_plan_id;
    v_consumed := false;
  end if;

  insert into public.attendance (booking_id, session_id, student_id, student_plan_id, status, consumed, marked_by)
  values (p_booking_id, v_session_id, v_booking.student_id, v_plan_id, p_status, v_consumed, v_uid)
  on conflict (booking_id) do update
    set status = excluded.status,
        student_plan_id = excluded.student_plan_id,
        consumed = excluded.consumed,
        marked_by = excluded.marked_by,
        marked_at = now()
  returning * into v_att;

  if v_booking.student_plan_id is null and v_plan_id is not null then
    update public.bookings set student_plan_id = v_plan_id where id = p_booking_id;
  end if;
  return v_att;
end;
$$;

-- ---------------------------------------------------------------- generate_sessions
create function public.generate_sessions(p_from date, p_weeks int default 4)
returns int
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede generar clases' using hint = 'FORBIDDEN';
  end if;
  if p_weeks is null or p_weeks < 1 or p_weeks > 26 then
    raise exception 'Las semanas deben estar entre 1 y 26' using hint = 'INVALID_WEEKS';
  end if;
  return public._generate_sessions(p_from, p_weeks);
end;
$$;

-- ---------------------------------------------------------------- cancel_session
create function public.cancel_session(p_session_id uuid, p_reason text)
returns public.class_sessions
language plpgsql security definer set search_path = ''
as $$
declare
  v_session public.class_sessions;
  v_label text;
  b record;
  v_att record;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede cancelar clases' using hint = 'FORBIDDEN';
  end if;
  if p_reason is null or length(btrim(p_reason)) = 0 then
    raise exception 'Indica el motivo de la cancelación' using hint = 'REASON_REQUIRED';
  end if;

  select * into v_session from public.class_sessions where id = p_session_id for update;
  if not found then
    raise exception 'La clase no existe' using hint = 'SESSION_NOT_FOUND';
  end if;
  if v_session.status = 'cancelled' then
    raise exception 'La clase ya estaba cancelada' using hint = 'ALREADY_CANCELLED';
  end if;

  v_label := public._session_label(p_session_id);

  -- si ya se habia marcado asistencia con consumo, se devuelve
  for v_att in
    select id, student_plan_id from public.attendance where session_id = p_session_id and consumed
  loop
    update public.student_plans set classes_used = greatest(classes_used - 1, 0)
     where id = v_att.student_plan_id;
  end loop;
  delete from public.attendance where session_id = p_session_id;

  for b in
    select id, student_id from public.bookings
    where session_id = p_session_id and status in ('booked', 'waitlist')
    for update
  loop
    update public.bookings
       set status = 'cancelled', cancelled_at = now(), waitlist_position = null
     where id = b.id;
    perform public._notify(
      b.student_id, 'session_cancelled', 'Clase cancelada',
      'Se canceló ' || v_label || '. Motivo: ' || btrim(p_reason) || '. No se descuenta de tu plan.',
      p_session_id
    );
  end loop;

  update public.class_sessions
     set status = 'cancelled', cancel_reason = btrim(p_reason), cancelled_at = now()
   where id = p_session_id
   returning * into v_session;
  return v_session;
end;
$$;

-- ---------------------------------------------------------------- approve_user
create function public.approve_user(
  p_profile_id uuid, p_role public.user_role, p_teacher_id uuid default null
) returns public.profiles
language plpgsql security definer set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_teacher public.teachers;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede aprobar usuarios' using hint = 'FORBIDDEN';
  end if;
  if p_profile_id = (select auth.uid()) and p_role <> 'admin' then
    raise exception 'No puedes quitarte el rol de administrador' using hint = 'CANNOT_DEMOTE_SELF';
  end if;
  select * into v_profile from public.profiles where id = p_profile_id for update;
  if not found then
    raise exception 'El usuario no existe' using hint = 'PROFILE_NOT_FOUND';
  end if;

  if p_role = 'teacher' then
    if p_teacher_id is null then
      raise exception 'Selecciona el profesor a vincular' using hint = 'TEACHER_REQUIRED';
    end if;
    select * into v_teacher from public.teachers where id = p_teacher_id and deleted_at is null for update;
    if not found then
      raise exception 'El profesor no existe' using hint = 'TEACHER_NOT_FOUND';
    end if;
    if v_teacher.profile_id is not null and v_teacher.profile_id <> p_profile_id then
      raise exception 'El profesor ya está vinculado a otra cuenta' using hint = 'TEACHER_ALREADY_LINKED';
    end if;
    update public.teachers set profile_id = null
     where profile_id = p_profile_id and id <> p_teacher_id;
    update public.teachers set profile_id = p_profile_id where id = p_teacher_id;
  else
    update public.teachers set profile_id = null where profile_id = p_profile_id;
  end if;

  update public.profiles
     set role = p_role, status = 'active', deleted_at = null
   where id = p_profile_id
   returning * into v_profile;

  if v_profile.status = 'active' then
    perform public._notify(
      p_profile_id, 'account_approved', 'Tu cuenta fue aprobada',
      'Ya puedes ingresar a Felinas System.', null
    );
  end if;
  return v_profile;
end;
$$;

-- ---------------------------------------------------------------- assign_plan
-- expires_on = starts_on + duration_days (ultimo dia valido).
create function public.assign_plan(
  p_student_id uuid, p_plan_id uuid, p_starts_on date default null, p_notes text default null
) returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_plan public.plans;
  v_start date := coalesce(p_starts_on, (now() at time zone 'America/Bogota')::date);
  v_row public.student_plans;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede asignar planes' using hint = 'FORBIDDEN';
  end if;
  if not exists (
    select 1 from public.profiles where id = p_student_id and role = 'student' and deleted_at is null
  ) then
    raise exception 'La alumna no existe' using hint = 'STUDENT_NOT_FOUND';
  end if;
  select * into v_plan from public.plans where id = p_plan_id and active and deleted_at is null;
  if not found then
    raise exception 'El plan no existe o está inactivo' using hint = 'PLAN_NOT_FOUND';
  end if;

  insert into public.student_plans (student_id, plan_id, starts_on, expires_on, classes_total, notes, created_by)
  values (
    p_student_id, p_plan_id, v_start, v_start + v_plan.duration_days,
    case when v_plan.type = 'package' then v_plan.class_count end,
    p_notes, (select auth.uid())
  )
  returning * into v_row;
  return v_row;
end;
$$;

-- ---------------------------------------------------------------- pg_cron
create extension if not exists pg_cron;
select cron.schedule('expire-student-plans', '5 5 * * *', 'select public.expire_student_plans()');

-- ---------------------------------------------------------------- permisos
revoke execute on function public._notify(uuid, public.notification_type, text, text, uuid) from public, anon, authenticated;
revoke execute on function public._session_label(uuid) from public, anon, authenticated;
revoke execute on function public._find_valid_plan(uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke execute on function public._renumber_waitlist(uuid) from public, anon, authenticated;
revoke execute on function public._promote_waitlist(uuid) from public, anon, authenticated;
revoke execute on function public._generate_sessions(date, int) from public, anon, authenticated;
revoke execute on function public.expire_student_plans() from public, anon, authenticated;

revoke execute on function public.book_session(uuid) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
revoke execute on function public.admin_add_student_to_session(uuid, uuid, uuid) from public, anon;
revoke execute on function public.mark_attendance(uuid, public.attendance_status) from public, anon;
revoke execute on function public.generate_sessions(date, int) from public, anon;
revoke execute on function public.cancel_session(uuid, text) from public, anon;
revoke execute on function public.approve_user(uuid, public.user_role, uuid) from public, anon;
revoke execute on function public.assign_plan(uuid, uuid, date, text) from public, anon;
grant execute on function public.book_session(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.admin_add_student_to_session(uuid, uuid, uuid) to authenticated;
grant execute on function public.mark_attendance(uuid, public.attendance_status) to authenticated;
grant execute on function public.generate_sessions(date, int) to authenticated;
grant execute on function public.cancel_session(uuid, text) to authenticated;
grant execute on function public.approve_user(uuid, public.user_role, uuid) to authenticated;
grant execute on function public.assign_plan(uuid, uuid, date, text) to authenticated;
