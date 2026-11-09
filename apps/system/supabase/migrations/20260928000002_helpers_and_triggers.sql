-- Funciones auxiliares, triggers y bootstrap de administradores

-- admin_notes sale de profiles: un estudiante puede leer su propio perfil y no debe ver notas internas.
alter table public.profiles drop column admin_notes;

create table public.student_admin_notes (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  notes text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin' and p.status = 'active' and p.deleted_at is null
  );
$$;

create function public.is_active_user()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active' and p.deleted_at is null
  );
$$;

create function public.current_teacher_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select t.id from public.teachers t
  join public.profiles p on p.id = t.profile_id
  where t.profile_id = (select auth.uid())
    and t.deleted_at is null
    and p.status = 'active' and p.deleted_at is null
  limit 1;
$$;

create function public.teaches_session(p_session_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.class_sessions s
    where s.id = p_session_id and s.teacher_id = public.current_teacher_id()
  );
$$;

create function public.has_booking_in_teacher_session(p_student_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.bookings b
    join public.class_sessions s on s.id = b.session_id
    where b.student_id = p_student_id
      and b.status <> 'cancelled'
      and s.teacher_id = public.current_teacher_id()
  );
$$;

-- ---------------------------------------------------------------- nuevo usuario
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_admin boolean;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  v_admin := exists (
    select 1 from public.admin_emails a where lower(a.email) = lower(new.email)
  );
  insert into public.profiles (id, email, full_name, avatar_url, role, status)
  values (
    new.id,
    new.email,
    coalesce(v_meta ->> 'full_name', v_meta ->> 'name'),
    coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture'),
    case when v_admin then 'admin'::public.user_role else 'student'::public.user_role end,
    case when v_admin then 'active'::public.profile_status else 'pending'::public.profile_status end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Al agregar un email a admin_emails, si el usuario ya existe se promueve.
create function public.promote_existing_admin()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles
     set role = 'admin', status = 'active'
   where lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger admin_emails_promote
  after insert on public.admin_emails
  for each row execute function public.promote_existing_admin();

-- Perfiles para usuarios que ya existan en auth.users
insert into public.profiles (id, email, full_name, avatar_url, role, status)
select u.id, u.email,
       coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
       coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture'),
       'student', 'pending'
from auth.users u
on conflict (id) do nothing;

insert into public.admin_emails (email) values ('frank.alessandro.roldan@gmail.com')
on conflict (email) do nothing;

update public.profiles
   set role = 'admin', status = 'active'
 where lower(email) in (select lower(email) from public.admin_emails);

-- ---------------------------------------------------------------- proteccion de rol/estado
create function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- auth.uid() nulo = llamada interna (postgres / service_role)
  if (select auth.uid()) is not null and not public.is_admin() then
    if new.id is distinct from old.id
       or new.role is distinct from old.role
       or new.status is distinct from old.status
       or new.email is distinct from old.email
       or new.deleted_at is distinct from old.deleted_at
       or new.created_at is distinct from old.created_at then
      raise exception 'No puedes modificar rol, estado ni correo de tu perfil'
        using errcode = '42501', hint = 'FORBIDDEN_PROFILE_FIELDS';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------- contadores de sesion
create function public.sync_session_counts()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_ids uuid[];
  v_id uuid;
begin
  if tg_op = 'INSERT' then
    v_ids := array[new.session_id];
  elsif tg_op = 'DELETE' then
    v_ids := array[old.session_id];
  else
    v_ids := array[new.session_id, old.session_id];
  end if;

  for v_id in select distinct x from unnest(v_ids) as x loop
    update public.class_sessions s
       set booked_count = (select count(*) from public.bookings b
                            where b.session_id = v_id and b.status = 'booked'),
           waitlist_count = (select count(*) from public.bookings b
                              where b.session_id = v_id and b.status = 'waitlist')
     where s.id = v_id;
  end loop;
  return null;
end;
$$;

create trigger bookings_sync_counts
  after insert or update of status, session_id or delete on public.bookings
  for each row execute function public.sync_session_counts();

-- ---------------------------------------------------------------- student_plans
create function public.student_plans_defaults()
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
  return new;
end;
$$;

create trigger student_plans_set_defaults
  before insert on public.student_plans
  for each row execute function public.student_plans_defaults();

-- ---------------------------------------------------------------- permisos de ejecucion
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.promote_existing_admin() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.sync_session_counts() from public, anon, authenticated;
revoke execute on function public.student_plans_defaults() from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_active_user() from public, anon;
revoke execute on function public.current_teacher_id() from public, anon;
revoke execute on function public.teaches_session(uuid) from public, anon;
revoke execute on function public.has_booking_in_teacher_session(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.current_teacher_id() to authenticated;
grant execute on function public.teaches_session(uuid) to authenticated;
grant execute on function public.has_booking_in_teacher_session(uuid) to authenticated;
