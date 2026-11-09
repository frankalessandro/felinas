-- Reemplaza la vista "próximos N días" por "quiénes cumplen en el mes calendario actual"
-- (incluye los que ya cumplieron este mes).
drop function if exists public.admin_upcoming_birthdays(int);

create function public.admin_month_birthdays()
returns table (
  profile_id uuid, full_name text, avatar_url text, phone text, role public.user_role,
  birth_date date, birthday_date date, days_until int
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_year int := extract(year from (now() at time zone 'America/Bogota'))::int;
  v_month int := extract(month from (now() at time zone 'America/Bogota'))::int;
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede ver este reporte' using hint = 'FORBIDDEN';
  end if;
  return query
  select p.id, p.full_name, p.avatar_url, p.phone, p.role, p.birth_date,
         b.d, (b.d - v_today)::int
  from public.profiles p
  cross join lateral (select public._birthday_in_year(p.birth_date, v_year) as d) b
  where p.status = 'active' and p.deleted_at is null
    and p.role in ('student', 'teacher') and p.birth_date is not null
    and extract(month from b.d)::int = v_month
  order by b.d, p.full_name;
end;
$$;

revoke execute on function public.admin_month_birthdays() from public, anon;
grant execute on function public.admin_month_birthdays() to authenticated;
