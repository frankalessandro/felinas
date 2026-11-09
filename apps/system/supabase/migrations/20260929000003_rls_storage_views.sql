-- RLS de las tablas nuevas, bucket de comprobantes y vistas.

alter table public.class_categories enable row level security;
alter table public.plan_category_quotas enable row level security;
alter table public.student_plan_freezes enable row level security;
alter table public.payments enable row level security;

revoke all on public.class_categories, public.plan_category_quotas,
  public.student_plan_freezes, public.payments from anon;

-- ---------------------------------------------------------------- catálogo (activos leen, admin escribe)
create policy class_categories_select on public.class_categories for select to authenticated
using ((select public.is_active_user()));
create policy class_categories_insert on public.class_categories for insert to authenticated
with check ((select public.is_admin()));
create policy class_categories_update on public.class_categories for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy class_categories_delete on public.class_categories for delete to authenticated
using ((select public.is_admin()));

create policy plan_category_quotas_select on public.plan_category_quotas for select to authenticated
using ((select public.is_active_user()));
create policy plan_category_quotas_insert on public.plan_category_quotas for insert to authenticated
with check ((select public.is_admin()));
create policy plan_category_quotas_update on public.plan_category_quotas for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy plan_category_quotas_delete on public.plan_category_quotas for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- congelaciones
create policy student_plan_freezes_select on public.student_plan_freezes for select to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1 from public.student_plans sp
    where sp.id = student_plan_freezes.student_plan_id and sp.student_id = (select auth.uid())
  )
);
create policy student_plan_freezes_insert on public.student_plan_freezes for insert to authenticated
with check ((select public.is_admin()));
create policy student_plan_freezes_update on public.student_plan_freezes for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy student_plan_freezes_delete on public.student_plan_freezes for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- pagos
create policy payments_select on public.payments for select to authenticated
using (student_id = (select auth.uid()) or (select public.is_admin()));
create policy payments_insert on public.payments for insert to authenticated
with check ((select public.is_admin()));
create policy payments_update on public.payments for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy payments_delete on public.payments for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- storage: comprobantes (privado, solo admin)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-receipts', 'payment-receipts', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy payment_receipts_select on storage.objects for select to authenticated
using (bucket_id = 'payment-receipts' and (select public.is_admin()));
create policy payment_receipts_insert on storage.objects for insert to authenticated
with check (bucket_id = 'payment-receipts' and (select public.is_admin()));
create policy payment_receipts_delete on storage.objects for delete to authenticated
using (bucket_id = 'payment-receipts' and (select public.is_admin()));

-- ---------------------------------------------------------------- vistas
-- Columnas nuevas al final (is_frozen, frozen_days). Congelada no se considera "por vencer" ni vencida.
create or replace view public.student_plan_summary
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
  case when sp.status = 'active' and sp.frozen_at is null
            and sp.expires_on < (now() at time zone 'America/Bogota')::date
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
    and sp.frozen_at is null
    and sp.expires_on >= (now() at time zone 'America/Bogota')::date
    and (
      (sp.expires_on - (now() at time zone 'America/Bogota')::date) <= 7
      or (sp.classes_total is not null and sp.classes_total - sp.classes_used <= 2)
    )
  ) as is_expiring,
  (sp.frozen_at is not null) as is_frozen,
  sp.frozen_days
from public.student_plans sp
join public.plans pl on pl.id = sp.plan_id;

-- Saldo por plan asignado. Solo cuentan pagos no anulados vinculados al plan.
create view public.student_plan_balances
with (security_invoker = true) as
select
  sp.id as student_plan_id,
  sp.student_id,
  sp.plan_id,
  pl.name as plan_name,
  sp.status as plan_status,
  sp.starts_on,
  sp.expires_on,
  sp.price,
  sp.discount_note,
  coalesce(pay.paid, 0)::numeric(12, 2) as paid,
  (coalesce(sp.price, 0) - coalesce(pay.paid, 0))::numeric(12, 2) as balance,
  case
    when coalesce(sp.price, 0) = 0 then 'free'
    when coalesce(pay.paid, 0) >= sp.price then 'paid'
    when coalesce(pay.paid, 0) > 0 then 'partial'
    else 'pending'
  end as payment_status
from public.student_plans sp
join public.plans pl on pl.id = sp.plan_id
left join lateral (
  select sum(p.amount) as paid
  from public.payments p
  where p.student_plan_id = sp.id and p.voided_at is null
) pay on true;

revoke all on public.student_plan_summary, public.student_plan_balances from anon;
grant select on public.student_plan_summary, public.student_plan_balances to authenticated;
