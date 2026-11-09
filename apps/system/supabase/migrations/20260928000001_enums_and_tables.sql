-- Enums y tablas base de Felinas System

create type public.user_role as enum ('admin', 'teacher', 'student');
create type public.profile_status as enum ('pending', 'active', 'inactive');
create type public.class_level as enum ('all', 'beginner', 'intermediate', 'advanced');
create type public.session_kind as enum ('group', 'private');
create type public.session_status as enum ('scheduled', 'cancelled');
create type public.booking_status as enum ('booked', 'waitlist', 'cancelled');
create type public.attendance_status as enum ('present', 'absent', 'excused');
create type public.plan_type as enum ('package', 'monthly');
create type public.student_plan_status as enum ('active', 'expired', 'cancelled');
create type public.notification_type as enum (
  'booking_promoted', 'session_cancelled', 'booking_added', 'plan_expiring',
  'account_approved', 'general'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  admin_notes text,
  role public.user_role not null default 'student',
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.admin_emails (
  email text primary key
);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  full_name text not null,
  bio text,
  photo_url text,
  phone text,
  instagram text,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.class_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  level public.class_level not null default 'all',
  color text not null default '#ff2e7e' check (color ~* '^#[0-9a-f]{6}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity int not null check (capacity > 0),
  active boolean not null default true
);

create table public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_type_id uuid not null references public.class_types (id),
  teacher_id uuid not null references public.teachers (id),
  room_id uuid references public.rooms (id),
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  capacity int not null check (capacity > 0),
  description text,
  valid_from date not null default current_date,
  valid_until date,
  active boolean not null default true,
  check (end_time > start_time),
  check (valid_until is null or valid_until >= valid_from)
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.class_schedules (id) on delete set null,
  class_type_id uuid not null references public.class_types (id),
  teacher_id uuid not null references public.teachers (id),
  room_id uuid references public.rooms (id),
  kind public.session_kind not null default 'group',
  title text,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null check (capacity > 0),
  status public.session_status not null default 'scheduled',
  cancel_reason text,
  cancelled_at timestamptz,
  booked_count int not null default 0 check (booked_count >= 0),
  waitlist_count int not null default 0 check (waitlist_count >= 0),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (schedule_id, starts_at)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type public.plan_type not null,
  class_count int,
  weekly_limit int,
  duration_days int not null check (duration_days > 0),
  price numeric(12, 2) check (price is null or price >= 0),
  is_private boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint plans_type_fields check (
    (type = 'package' and class_count is not null and class_count > 0 and weekly_limit is null)
    or (type = 'monthly' and weekly_limit is not null and weekly_limit > 0 and class_count is null)
  )
);

create table public.plan_class_types (
  plan_id uuid not null references public.plans (id) on delete cascade,
  class_type_id uuid not null references public.class_types (id) on delete cascade,
  primary key (plan_id, class_type_id)
);

create table public.student_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  starts_on date not null default current_date,
  expires_on date not null,
  classes_total int,
  classes_used int not null default 0 check (classes_used >= 0),
  status public.student_plan_status not null default 'active',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_on >= starts_on)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_plan_id uuid references public.student_plans (id) on delete set null,
  status public.booking_status not null,
  waitlist_position int,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  promoted_at timestamptz
);
create unique index bookings_active_unique on public.bookings (session_id, student_id)
  where status <> 'cancelled';

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  session_id uuid not null references public.class_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  student_plan_id uuid references public.student_plans (id) on delete set null,
  status public.attendance_status not null,
  consumed boolean not null default false,
  marked_by uuid references public.profiles (id) on delete set null,
  marked_at timestamptz not null default now()
);

create table public.progress_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.class_sessions (id) on delete set null,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null default 'general',
  title text not null,
  body text,
  session_id uuid references public.class_sessions (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indices (incluye todas las llaves foraneas)
create index profiles_role_status_idx on public.profiles (role, status);
create index class_schedules_class_type_idx on public.class_schedules (class_type_id);
create index class_schedules_teacher_idx on public.class_schedules (teacher_id);
create index class_schedules_room_idx on public.class_schedules (room_id);
create index class_sessions_class_type_idx on public.class_sessions (class_type_id);
create index class_sessions_teacher_idx on public.class_sessions (teacher_id);
create index class_sessions_room_idx on public.class_sessions (room_id);
create index class_sessions_starts_at_idx on public.class_sessions (starts_at);
create index plan_class_types_class_type_idx on public.plan_class_types (class_type_id);
create index student_plans_student_idx on public.student_plans (student_id, status);
create index student_plans_plan_idx on public.student_plans (plan_id);
create index student_plans_created_by_idx on public.student_plans (created_by);
create index bookings_session_idx on public.bookings (session_id, status);
create index bookings_student_idx on public.bookings (student_id);
create index bookings_student_plan_idx on public.bookings (student_plan_id);
create index bookings_created_by_idx on public.bookings (created_by);
create index attendance_session_idx on public.attendance (session_id);
create index attendance_student_idx on public.attendance (student_id, marked_at desc);
create index attendance_student_plan_idx on public.attendance (student_plan_id);
create index attendance_marked_by_idx on public.attendance (marked_by);
create index progress_notes_student_idx on public.progress_notes (student_id);
create index progress_notes_author_idx on public.progress_notes (author_id);
create index progress_notes_session_idx on public.progress_notes (session_id);
create index notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index notifications_session_idx on public.notifications (session_id);
