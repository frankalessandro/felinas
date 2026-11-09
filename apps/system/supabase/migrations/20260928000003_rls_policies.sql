-- Row Level Security en todas las tablas
-- Una politica de SELECT por tabla (combinada) + politicas admin de escritura separadas.

alter table public.profiles enable row level security;
alter table public.admin_emails enable row level security;
alter table public.student_admin_notes enable row level security;
alter table public.teachers enable row level security;
alter table public.class_types enable row level security;
alter table public.rooms enable row level security;
alter table public.class_schedules enable row level security;
alter table public.class_sessions enable row level security;
alter table public.plans enable row level security;
alter table public.plan_class_types enable row level security;
alter table public.student_plans enable row level security;
alter table public.bookings enable row level security;
alter table public.attendance enable row level security;
alter table public.progress_notes enable row level security;
alter table public.notifications enable row level security;

-- anon no toca nada
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------- profiles
create policy profiles_select on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select public.is_admin())
  or (select public.has_booking_in_teacher_session(id))
);
create policy profiles_update on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select public.is_admin()))
with check (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_insert_admin on public.profiles for insert to authenticated
with check ((select public.is_admin()));
create policy profiles_delete_admin on public.profiles for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- admin only
create policy admin_emails_select on public.admin_emails for select to authenticated
using ((select public.is_admin()));
create policy admin_emails_insert on public.admin_emails for insert to authenticated
with check ((select public.is_admin()));
create policy admin_emails_update on public.admin_emails for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_emails_delete on public.admin_emails for delete to authenticated
using ((select public.is_admin()));

create policy student_admin_notes_select on public.student_admin_notes for select to authenticated
using ((select public.is_admin()));
create policy student_admin_notes_insert on public.student_admin_notes for insert to authenticated
with check ((select public.is_admin()));
create policy student_admin_notes_update on public.student_admin_notes for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy student_admin_notes_delete on public.student_admin_notes for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- catalogo (activos leen, admin escribe)
create policy teachers_select on public.teachers for select to authenticated
using ((select public.is_active_user()));
create policy teachers_insert on public.teachers for insert to authenticated
with check ((select public.is_admin()));
create policy teachers_update on public.teachers for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy teachers_delete on public.teachers for delete to authenticated
using ((select public.is_admin()));

create policy class_types_select on public.class_types for select to authenticated
using ((select public.is_active_user()));
create policy class_types_insert on public.class_types for insert to authenticated
with check ((select public.is_admin()));
create policy class_types_update on public.class_types for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy class_types_delete on public.class_types for delete to authenticated
using ((select public.is_admin()));

create policy rooms_select on public.rooms for select to authenticated
using ((select public.is_active_user()));
create policy rooms_insert on public.rooms for insert to authenticated
with check ((select public.is_admin()));
create policy rooms_update on public.rooms for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy rooms_delete on public.rooms for delete to authenticated
using ((select public.is_admin()));

create policy plans_select on public.plans for select to authenticated
using ((select public.is_active_user()));
create policy plans_insert on public.plans for insert to authenticated
with check ((select public.is_admin()));
create policy plans_update on public.plans for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy plans_delete on public.plans for delete to authenticated
using ((select public.is_admin()));

create policy plan_class_types_select on public.plan_class_types for select to authenticated
using ((select public.is_active_user()));
create policy plan_class_types_insert on public.plan_class_types for insert to authenticated
with check ((select public.is_admin()));
create policy plan_class_types_update on public.plan_class_types for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy plan_class_types_delete on public.plan_class_types for delete to authenticated
using ((select public.is_admin()));

create policy class_schedules_select on public.class_schedules for select to authenticated
using ((select public.is_active_user()));
create policy class_schedules_insert on public.class_schedules for insert to authenticated
with check ((select public.is_admin()));
create policy class_schedules_update on public.class_schedules for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy class_schedules_delete on public.class_schedules for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- sesiones
create policy class_sessions_select on public.class_sessions for select to authenticated
using (
  (select public.is_admin())
  or (
    (select public.is_active_user())
    and (
      kind = 'group'
      or teacher_id = (select public.current_teacher_id())
      or exists (
        select 1 from public.bookings b
        where b.session_id = class_sessions.id and b.student_id = (select auth.uid())
      )
    )
  )
);
create policy class_sessions_insert on public.class_sessions for insert to authenticated
with check ((select public.is_admin()));
create policy class_sessions_update on public.class_sessions for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy class_sessions_delete on public.class_sessions for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- planes, reservas, asistencia
create policy student_plans_select on public.student_plans for select to authenticated
using (student_id = (select auth.uid()) or (select public.is_admin()));
create policy student_plans_insert on public.student_plans for insert to authenticated
with check ((select public.is_admin()));
create policy student_plans_update on public.student_plans for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy student_plans_delete on public.student_plans for delete to authenticated
using ((select public.is_admin()));

create policy bookings_select on public.bookings for select to authenticated
using (
  student_id = (select auth.uid())
  or (select public.is_admin())
  or (select public.teaches_session(session_id))
);
create policy bookings_insert on public.bookings for insert to authenticated
with check ((select public.is_admin()));
create policy bookings_update on public.bookings for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy bookings_delete on public.bookings for delete to authenticated
using ((select public.is_admin()));

create policy attendance_select on public.attendance for select to authenticated
using (
  student_id = (select auth.uid())
  or (select public.is_admin())
  or (select public.teaches_session(session_id))
);
create policy attendance_insert on public.attendance for insert to authenticated
with check ((select public.is_admin()));
create policy attendance_update on public.attendance for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
create policy attendance_delete on public.attendance for delete to authenticated
using ((select public.is_admin()));

-- ---------------------------------------------------------------- notas de progreso
create policy progress_notes_select on public.progress_notes for select to authenticated
using (
  student_id = (select auth.uid())
  or author_id = (select auth.uid())
  or (select public.is_admin())
);
create policy progress_notes_insert on public.progress_notes for insert to authenticated
with check (
  (select public.is_admin())
  or (
    author_id = (select auth.uid())
    and (select public.current_teacher_id()) is not null
    and (select public.has_booking_in_teacher_session(student_id))
  )
);
create policy progress_notes_update on public.progress_notes for update to authenticated
using (author_id = (select auth.uid()) or (select public.is_admin()))
with check (author_id = (select auth.uid()) or (select public.is_admin()));
create policy progress_notes_delete on public.progress_notes for delete to authenticated
using (author_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------- notificaciones
create policy notifications_select on public.notifications for select to authenticated
using (profile_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated
using (profile_id = (select auth.uid()));
create policy notifications_insert_admin on public.notifications for insert to authenticated
with check ((select public.is_admin()));

-- el usuario solo puede marcar como leida (read_at); admin usa insert
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
