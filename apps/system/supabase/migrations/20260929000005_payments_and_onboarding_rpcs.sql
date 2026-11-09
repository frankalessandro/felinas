-- RPCs de pagos y onboarding / perfil propio.

-- ---------------------------------------------------------------- pagos
create function public.register_payment(
  p_student_id uuid,
  p_amount numeric,
  p_method public.payment_method,
  p_student_plan_id uuid default null,
  p_paid_on date default null,
  p_reference text default null,
  p_notes text default null,
  p_receipt_path text default null
) returns public.payments
language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.payments;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede registrar pagos' using hint = 'FORBIDDEN';
  end if;
  if not exists (select 1 from public.profiles where id = p_student_id and deleted_at is null) then
    raise exception 'La alumna no existe' using hint = 'STUDENT_NOT_FOUND';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'El valor del pago debe ser mayor a cero' using hint = 'INVALID_AMOUNT';
  end if;
  if p_student_plan_id is not null and not exists (
    select 1 from public.student_plans where id = p_student_plan_id and student_id = p_student_id
  ) then
    raise exception 'El plan no pertenece a la alumna' using hint = 'PLAN_NOT_FOUND';
  end if;
  if p_receipt_path is not null and p_receipt_path not like p_student_id::text || '/%' then
    raise exception 'La ruta del comprobante debe empezar por el id de la alumna' using hint = 'INVALID_RECEIPT_PATH';
  end if;

  insert into public.payments (
    student_id, student_plan_id, amount, method, paid_on, reference, notes, receipt_path, created_by
  ) values (
    p_student_id, p_student_plan_id, p_amount, p_method,
    coalesce(p_paid_on, (now() at time zone 'America/Bogota')::date),
    nullif(btrim(p_reference), ''), nullif(btrim(p_notes), ''), p_receipt_path, (select auth.uid())
  )
  returning * into v_row;
  return v_row;
end;
$$;

create function public.void_payment(p_payment_id uuid, p_reason text)
returns public.payments
language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.payments;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede anular pagos' using hint = 'FORBIDDEN';
  end if;
  if p_reason is null or length(btrim(p_reason)) = 0 then
    raise exception 'Indica el motivo de la anulación' using hint = 'REASON_REQUIRED';
  end if;
  select * into v_row from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'El pago no existe' using hint = 'PAYMENT_NOT_FOUND';
  end if;
  if v_row.voided_at is not null then
    raise exception 'El pago ya estaba anulado' using hint = 'ALREADY_VOIDED';
  end if;
  update public.payments
     set voided_at = now(), void_reason = btrim(p_reason)
   where id = p_payment_id
   returning * into v_row;
  return v_row;
end;
$$;

create function public.set_plan_price(
  p_student_plan_id uuid, p_price numeric, p_discount_note text default null
) returns public.student_plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.student_plans;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede cambiar el valor de un plan' using hint = 'FORBIDDEN';
  end if;
  if p_price is not null and p_price < 0 then
    raise exception 'El valor no puede ser negativo' using hint = 'INVALID_PRICE';
  end if;
  update public.student_plans
     set price = p_price, discount_note = nullif(btrim(p_discount_note), '')
   where id = p_student_plan_id
   returning * into v_row;
  if not found then
    raise exception 'El plan de la alumna no existe' using hint = 'STUDENT_PLAN_NOT_FOUND';
  end if;
  return v_row;
end;
$$;

-- ---------------------------------------------------------------- validaciones de perfil
-- Celular colombiano: 10 dígitos que empiezan por 3 (quita +57, 57, 0057, espacios, guiones). null si inválido.
create function public._normalize_phone(p_phone text)
returns text
language plpgsql immutable set search_path = ''
as $$
declare
  v text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if v like '0057%' then
    v := substr(v, 5);
  elsif length(v) = 12 and v like '57%' then
    v := substr(v, 3);
  end if;
  if v ~ '^3[0-9]{9}$' then
    return v;
  end if;
  return null;
end;
$$;

-- Valida y devuelve (nombre, celular) normalizados; lanza el hint correspondiente si algo falla.
create function public._validate_profile_input(
  p_full_name text, p_phone text, p_birth_date date,
  out o_name text, out o_phone text
)
language plpgsql stable set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_age int;
begin
  o_name := regexp_replace(btrim(coalesce(p_full_name, '')), '\s+', ' ', 'g');
  if length(o_name) < 2 or length(o_name) > 80 then
    raise exception 'El nombre debe tener entre 2 y 80 caracteres' using hint = 'INVALID_NAME';
  end if;
  o_phone := public._normalize_phone(p_phone);
  if o_phone is null then
    raise exception 'Ingresa un celular colombiano válido (10 dígitos, empieza por 3)' using hint = 'INVALID_PHONE';
  end if;
  if p_birth_date is null or p_birth_date > v_today then
    raise exception 'La fecha de nacimiento no es válida' using hint = 'INVALID_BIRTH_DATE';
  end if;
  v_age := extract(year from age(v_today, p_birth_date))::int;
  if v_age < 5 or v_age > 100 then
    raise exception 'La fecha de nacimiento no es válida' using hint = 'INVALID_BIRTH_DATE';
  end if;
end;
$$;

-- ---------------------------------------------------------------- onboarding
create function public.complete_onboarding(
  p_full_name text, p_phone text, p_birth_date date,
  p_accept_data_policy boolean, p_image_consent boolean
) returns public.profiles
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_name text;
  v_phone text;
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using hint = 'NOT_AUTHENTICATED';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid and deleted_at is null) then
    raise exception 'El perfil no existe' using hint = 'PROFILE_NOT_FOUND';
  end if;
  select v.o_name, v.o_phone into v_name, v_phone
  from public._validate_profile_input(p_full_name, p_phone, p_birth_date) v;
  if p_accept_data_policy is distinct from true then
    raise exception 'Debes aceptar el tratamiento de datos personales' using hint = 'DATA_POLICY_REQUIRED';
  end if;

  perform set_config('app.profile_rpc', 'on', true);
  update public.profiles
     set full_name = v_name, phone = v_phone, birth_date = p_birth_date,
         onboarded_at = coalesce(onboarded_at, now()),
         data_consent_at = coalesce(data_consent_at, now()),
         image_consent = coalesce(p_image_consent, false),
         image_consent_at = now()
   where id = v_uid
   returning * into v_row;
  perform set_config('app.profile_rpc', 'off', true);
  return v_row;
end;
$$;

create function public.update_my_profile(
  p_full_name text, p_phone text, p_birth_date date, p_image_consent boolean default null
) returns public.profiles
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_name text;
  v_phone text;
  v_old public.profiles;
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using hint = 'NOT_AUTHENTICATED';
  end if;
  select * into v_old from public.profiles where id = v_uid and deleted_at is null;
  if not found then
    raise exception 'El perfil no existe' using hint = 'PROFILE_NOT_FOUND';
  end if;
  select v.o_name, v.o_phone into v_name, v_phone
  from public._validate_profile_input(p_full_name, p_phone, p_birth_date) v;

  perform set_config('app.profile_rpc', 'on', true);
  update public.profiles
     set full_name = v_name, phone = v_phone, birth_date = p_birth_date,
         image_consent = coalesce(p_image_consent, v_old.image_consent),
         image_consent_at = case
           when p_image_consent is not null and p_image_consent is distinct from v_old.image_consent
           then now() else v_old.image_consent_at end
   where id = v_uid
   returning * into v_row;
  perform set_config('app.profile_rpc', 'off', true);
  return v_row;
end;
$$;

-- ---------------------------------------------------------------- permisos
revoke execute on function public._normalize_phone(text) from public, anon, authenticated;
revoke execute on function public._validate_profile_input(text, text, date) from public, anon, authenticated;
revoke execute on function public.register_payment(uuid, numeric, public.payment_method, uuid, date, text, text, text) from public, anon;
revoke execute on function public.void_payment(uuid, text) from public, anon;
revoke execute on function public.set_plan_price(uuid, numeric, text) from public, anon;
revoke execute on function public.complete_onboarding(text, text, date, boolean, boolean) from public, anon;
revoke execute on function public.update_my_profile(text, text, date, boolean) from public, anon;
grant execute on function public.register_payment(uuid, numeric, public.payment_method, uuid, date, text, text, text) to authenticated;
grant execute on function public.void_payment(uuid, text) to authenticated;
grant execute on function public.set_plan_price(uuid, numeric, text) to authenticated;
grant execute on function public.complete_onboarding(text, text, date, boolean, boolean) to authenticated;
grant execute on function public.update_my_profile(text, text, date, boolean) to authenticated;
