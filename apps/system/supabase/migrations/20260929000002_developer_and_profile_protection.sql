-- Desarrollador multi-rol, protección de campos de perfil y helpers de fechas.

-- ---------------------------------------------------------------- helpers
-- Alumna o desarrollador (el desarrollador es admin pero puede actuar como alumna).
create function public.is_student_or_dev(p_profile_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_profile_id and p.deleted_at is null
      and (p.role = 'student' or p.is_developer)
  );
$$;

create function public._month_start(p_date date)
returns date
language sql immutable set search_path = ''
as $$ select date_trunc('month', p_date::timestamp)::date; $$;

create function public._month_end(p_date date)
returns date
language sql immutable set search_path = ''
as $$ select (date_trunc('month', p_date::timestamp) + interval '1 month - 1 day')::date; $$;

revoke execute on function public.is_student_or_dev(uuid) from public, anon;
grant execute on function public.is_student_or_dev(uuid) to authenticated;
revoke execute on function public._month_start(date) from public, anon, authenticated;
revoke execute on function public._month_end(date) from public, anon, authenticated;

-- ---------------------------------------------------------------- alta de usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_admin boolean;
  v_dev boolean;
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  select true, coalesce(bool_or(a.is_developer), false)
    into v_admin, v_dev
  from public.admin_emails a where lower(a.email) = lower(new.email)
  having count(*) > 0;
  v_admin := coalesce(v_admin, false);
  v_dev := coalesce(v_dev, false);

  insert into public.profiles (id, email, full_name, avatar_url, role, status, is_developer)
  values (
    new.id,
    new.email,
    coalesce(v_meta ->> 'full_name', v_meta ->> 'name'),
    coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture'),
    case when v_admin then 'admin'::public.user_role else 'student'::public.user_role end,
    case when v_admin then 'active'::public.profile_status else 'pending'::public.profile_status end,
    v_dev
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.promote_existing_admin()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles
     set role = 'admin', status = 'active',
         is_developer = is_developer or coalesce(new.is_developer, false)
   where lower(email) = lower(new.email);
  return new;
end;
$$;

-- is_developer en admin_emails solo lo cambia postgres (no admins vía API)
revoke insert, update on public.admin_emails from authenticated;
grant insert (email), update (email) on public.admin_emails to authenticated;

update public.admin_emails set is_developer = true
 where lower(email) = 'frank.alessandro.roldan@gmail.com';
update public.profiles set is_developer = true
 where lower(email) = 'frank.alessandro.roldan@gmail.com';

-- ---------------------------------------------------------------- protección de campos
-- onboarded_at / data_consent_at / image_consent(_at) solo cambian desde las RPC de onboarding,
-- que activan la bandera transaccional app.profile_rpc.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- auth.uid() nulo = llamada interna (postgres / service_role)
  if (select auth.uid()) is not null then
    if not public.is_admin() then
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
    if new.is_developer is distinct from old.is_developer then
      raise exception 'No puedes modificar este campo del perfil'
        using errcode = '42501', hint = 'FORBIDDEN_PROFILE_FIELDS';
    end if;
    if coalesce(current_setting('app.profile_rpc', true), '') <> 'on'
       and (new.onboarded_at is distinct from old.onboarded_at
            or new.data_consent_at is distinct from old.data_consent_at
            or new.image_consent is distinct from old.image_consent
            or new.image_consent_at is distinct from old.image_consent_at) then
      raise exception 'Usa el formulario de perfil para cambiar estos datos'
        using errcode = '42501', hint = 'FORBIDDEN_PROFILE_FIELDS';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- un insert por API (admin) no puede crear desarrolladores ni saltarse el onboarding
create function public.protect_profile_insert()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    new.is_developer := false;
    new.onboarded_at := null;
    new.data_consent_at := null;
    new.image_consent := null;
    new.image_consent_at := null;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_insert
  before insert on public.profiles
  for each row execute function public.protect_profile_insert();

revoke execute on function public.protect_profile_insert() from public, anon, authenticated;
