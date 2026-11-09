-- 1) Guardar un plan y sus estilos permitidos en una sola transacción.
--    Antes eran dos llamadas desde el cliente y un fallo a mitad dejaba el plan incompleto.
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
  p_class_type_ids uuid[]
) returns public.plans
language plpgsql security definer set search_path = ''
as $$
declare
  v_plan public.plans;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede guardar planes' using hint = 'FORBIDDEN';
  end if;
  if coalesce(array_length(p_class_type_ids, 1), 0) = 0 then
    raise exception 'Elige al menos un estilo para el plan' using hint = 'CLASS_TYPES_REQUIRED';
  end if;

  if p_plan_id is null then
    insert into public.plans (name, description, type, class_count, weekly_limit, duration_days, price, is_private, active)
    values (p_name, p_description, p_type, p_class_count, p_weekly_limit, p_duration_days, p_price, p_is_private, p_active)
    returning * into v_plan;
  else
    update public.plans
       set name = p_name, description = p_description, type = p_type, class_count = p_class_count,
           weekly_limit = p_weekly_limit, duration_days = p_duration_days, price = p_price,
           is_private = p_is_private, active = p_active
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

  return v_plan;
end;
$$;

revoke execute on function public.save_plan(uuid, text, text, public.plan_type, integer, integer, integer, numeric, boolean, boolean, uuid[]) from public, anon;
grant execute on function public.save_plan(uuid, text, text, public.plan_type, integer, integer, integer, numeric, boolean, boolean, uuid[]) to authenticated;

-- 2) Sin profes duplicadas (ignorando mayúsculas y espacios); las archivadas no cuentan.
create unique index teachers_full_name_unique
  on public.teachers (lower(btrim(full_name)))
  where deleted_at is null;
