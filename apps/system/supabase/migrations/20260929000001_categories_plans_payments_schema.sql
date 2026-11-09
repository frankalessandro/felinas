-- Fase 2 (2026-09-29): categorías, cupos por categoría, planes por mes calendario,
-- congelación, pagos, onboarding y desarrollador. Solo esquema (tablas, columnas, enums).

create type public.plan_validity as enum ('calendar_month', 'days');
create type public.payment_method as enum ('cash', 'nequi', 'daviplata', 'transfer', 'card', 'other');

-- ---------------------------------------------------------------- categorías
create table public.class_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  color text not null default '#ea1a62' check (color ~* '^#[0-9a-f]{6}$'),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.class_categories (name, slug, color, sort_order) values
  ('Twerk', 'twerk', '#ea1a62', 1),
  ('Urbano', 'urbano', '#8a3dff', 2)
on conflict (slug) do nothing;

alter table public.class_types
  add column category_id uuid references public.class_categories (id);
create index class_types_category_idx on public.class_types (category_id);

-- ---------------------------------------------------------------- planes
alter table public.plans
  add column validity public.plan_validity not null default 'calendar_month';

create table public.plan_category_quotas (
  plan_id uuid not null references public.plans (id) on delete cascade,
  category_id uuid not null references public.class_categories (id) on delete cascade,
  max_classes int not null check (max_classes > 0),
  primary key (plan_id, category_id)
);
create index plan_category_quotas_category_idx on public.plan_category_quotas (category_id);

-- ---------------------------------------------------------------- student_plans
alter table public.student_plans
  add column frozen_at timestamptz,
  add column frozen_days int not null default 0 check (frozen_days >= 0),
  add column price numeric(12, 2) check (price is null or price >= 0),
  add column discount_note text;

create table public.student_plan_freezes (
  id uuid primary key default gen_random_uuid(),
  student_plan_id uuid not null references public.student_plans (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  reason text,
  created_by uuid references public.profiles (id) on delete set null
);
create index student_plan_freezes_plan_idx on public.student_plan_freezes (student_plan_id);
create index student_plan_freezes_created_by_idx on public.student_plan_freezes (created_by);
create unique index student_plan_freezes_one_open on public.student_plan_freezes (student_plan_id)
  where ended_at is null;

-- ---------------------------------------------------------------- pagos
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_plan_id uuid references public.student_plans (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  method public.payment_method not null,
  paid_on date not null default ((now() at time zone 'America/Bogota')::date),
  reference text,
  receipt_path text,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  void_reason text
);
create index payments_student_idx on public.payments (student_id, paid_on desc);
create index payments_student_plan_idx on public.payments (student_plan_id);
create index payments_created_by_idx on public.payments (created_by);
create index payments_paid_on_idx on public.payments (paid_on);

-- ---------------------------------------------------------------- perfiles
alter table public.profiles
  add column onboarded_at timestamptz,
  add column data_consent_at timestamptz,
  add column image_consent boolean,
  add column image_consent_at timestamptz,
  add column is_developer boolean not null default false;

alter table public.admin_emails
  add column is_developer boolean default false;

-- ---------------------------------------------------------------- cupo por defecto = 6
alter table public.class_schedules alter column capacity set default 6;
alter table public.class_sessions alter column capacity set default 6;
