# Backend Supabase — Felinas System

Zona horaria de negocio: `America/Bogota`. Todos los timestamps son `timestamptz` (UTC). Migraciones en `migrations/` (ya aplicadas al proyecto), datos de ejemplo en `seed.sql`, tipos en `src/types/database.ts` (regenerar tras cada migración).

## Migraciones

| Archivo | Contenido |
|---|---|
| `20260928000001_enums_and_tables` | enums, tablas, índices (incluye todas las FK) |
| `20260928000002_helpers_and_triggers` | helpers de rol, trigger de alta de usuario, bootstrap admin, protección de rol/estado, contadores de sesión |
| `20260928000003_rls_policies` | RLS en todas las tablas |
| `20260928000004_rpcs` | RPCs de negocio + `pg_cron` |
| `20260928000005_views_and_reports` | `student_plan_summary`, reportes admin |
| `20260928000006_bogota_date_defaults` | defaults de fecha con la fecha de Bogotá (no UTC) |
| `20260928000007_save_plan_and_unique_teachers` | `save_plan` y unicidad de profes |
| `20260929000001_categories_plans_payments_schema` | categorías, cupos por categoría, `plans.validity`, congelación, pagos, columnas de onboarding/desarrollador, cupo por defecto 6 |
| `20260929000002_developer_and_profile_protection` | `is_student_or_dev`, desarrollador, trigger de protección ampliado, helpers `_month_start/_month_end` |
| `20260929000003_rls_storage_views` | RLS de tablas nuevas, bucket `payment-receipts`, vistas `student_plan_summary` (+`is_frozen`) y `student_plan_balances` |
| `20260929000004_plan_logic_rpcs` | cupos por categoría, mes calendario, renovar, congelar, `save_plan` ampliado, `generate_month_sessions` |
| `20260929000005_payments_and_onboarding_rpcs` | pagos, `set_plan_price`, `complete_onboarding`, `update_my_profile` |
| `20260929000006_admin_analytics` | RPCs de analítica admin |
| `20260929000007_real_catalog_seed` | reemplaza la demo por el catálogo real (categorías, tipos, planes, horario de ejemplo) |

## Fase 2 (2026-09-29): resumen

Tablas nuevas: `class_categories`, `plan_category_quotas`, `student_plan_freezes`, `payments`. Columnas nuevas: `class_types.category_id`; `plans.validity` (`calendar_month` por defecto | `days`); `student_plans.frozen_at, frozen_days, price, discount_note`; `profiles.onboarded_at, data_consent_at, image_consent, image_consent_at, is_developer`; `admin_emails.is_developer`. Enums: `plan_validity`, `payment_method` (`cash|nequi|daviplata|transfer|card|other`). Cupo por defecto de horarios/sesiones = 6.

Reglas:
- **Mes calendario:** `assign_plan` fija `expires_on` = último día del mes (`starts_on` = hoy, o el día 1 de un mes futuro con `p_month`). `duration_days` solo se usa en planes `days`. Se identifica el "mes" de un plan por el mes de `starts_on` (la congelación puede empujar `expires_on` al mes siguiente).
- **Cupo por categoría:** si el plan tiene filas en `plan_category_quotas`, se cuentan reservas `booked` futuras + asistencias consumidas de esa categoría en esa instancia de plan. Sin filas, solo aplica el total.
- **Congelar:** `freeze_plan` bloquea nuevas reservas con ese plan (`PLAN_FROZEN`); las reservas futuras ya existentes se conservan. `unfreeze_plan` suma los días calendario congelados a `expires_on` y a `frozen_days`. El cron de vencimiento no vence planes congelados.
- **Pagos:** `payments` se vincula opcionalmente a un `student_plan`; solo los pagos no anulados y vinculados cuentan en `student_plan_balances`. `payments.notes` lo puede leer la alumna (es su fila): no poner notas internas ahí.
- **Desarrollador:** `profiles.is_developer` solo lo cambia `postgres` (el trigger lo impide incluso a admins; `admin_emails.is_developer` tiene el `INSERT/UPDATE` de columna revocado). Mantiene `role=admin` pero `is_student_or_dev(uuid)` le permite actuar como alumna (reservar, recibir planes/pagos, aparecer en `admin_subscriptions_overview` si tiene plan ese mes).
- **Onboarding:** `onboarded_at`, `data_consent_at`, `image_consent`, `image_consent_at` solo cambian vía `complete_onboarding` / `update_my_profile` (bandera `app.profile_rpc`). El resto de campos del perfil siguen editables por la dueña.

### RPCs nuevas / cambiadas (fase 2)

| RPC | Quién | Notas | Hints |
|---|---|---|---|
| `assign_plan(p_student_id, p_plan_id, p_starts_on default null, p_notes default null, p_month default null, p_price default null) → student_plans` | admin | **cambió**: se agregaron `p_month` y `p_price`. Plan `calendar_month`: vence fin de mes. `p_month` en el mes actual → empieza hoy; futuro → día 1; pasado → error. `price` = `p_price` o `plans.price` | `STUDENT_NOT_FOUND`, `PLAN_NOT_FOUND`, `INVALID_MONTH`, `INVALID_PRICE` |
| `renew_plan(p_student_plan_id, p_price default null) → student_plans` | admin | mismo plan para el mes siguiente al mes de `starts_on` (si ya pasó, el mes actual) | `STUDENT_PLAN_NOT_FOUND`, `PLAN_NOT_RENEWABLE`, `ALREADY_RENEWED`, `PLAN_NOT_FOUND`, `INVALID_PRICE` |
| `renew_plans_bulk(p_student_plan_ids uuid[], p_month date) → int` | admin | renueva para `p_month` (null = mes actual); omite ya renovados o no disponibles; devuelve cuántos creó | `INVALID_MONTH` |
| `freeze_plan(p_student_plan_id, p_reason default null) → student_plans` / `unfreeze_plan(p_student_plan_id) → student_plans` | admin | ver reglas | `STUDENT_PLAN_NOT_FOUND`, `PLAN_EXPIRED`, `ALREADY_FROZEN`, `NOT_FROZEN` |
| `save_plan(..., p_class_type_ids, p_category_quotas jsonb default null, p_validity plan_validity default null) → plans` | admin | **cambió**: `p_category_quotas` = `[{"category_id","max_classes"}]` (null = no tocar, `[]` = borrar). `p_validity` null = `calendar_month` al crear / sin cambio al editar | `INVALID_QUOTA`, `CATEGORY_NOT_FOUND` |
| `book_session(p_session_id)` | alumna activa **o desarrollador** | **cambió**: nuevos hints | `PLAN_FROZEN`, `CATEGORY_QUOTA_REACHED` (además de los anteriores) |
| `admin_add_student_to_session(p_session_id, p_student_id, p_student_plan_id default null, p_force default false)` | admin | **cambió**: `p_force` (default false) permite saltarse congelación y cupos por categoría; sin `p_force` lanza los hints nuevos | `PLAN_FROZEN`, `CATEGORY_QUOTA_REACHED` |
| `generate_month_sessions(p_month date) → int` | admin | sesiones de todo el mes desde horarios activos/vigentes (incluye días pasados del mes); idempotente | `INVALID_MONTH` |
| `register_payment(p_student_id, p_amount, p_method, p_student_plan_id default null, p_paid_on default null, p_reference default null, p_notes default null, p_receipt_path default null) → payments` | admin | `p_receipt_path` debe empezar por `<student_id>/` | `STUDENT_NOT_FOUND`, `INVALID_AMOUNT`, `PLAN_NOT_FOUND`, `INVALID_RECEIPT_PATH` |
| `void_payment(p_payment_id, p_reason) → payments` | admin | | `REASON_REQUIRED`, `PAYMENT_NOT_FOUND`, `ALREADY_VOIDED` |
| `set_plan_price(p_student_plan_id, p_price, p_discount_note default null) → student_plans` | admin | null o 0 = gratis | `INVALID_PRICE`, `STUDENT_PLAN_NOT_FOUND` |
| `complete_onboarding(p_full_name, p_phone, p_birth_date, p_accept_data_policy, p_image_consent) → profiles` | cualquier usuario autenticado (incluye `pending`) | nombre 2–80, celular colombiano normalizado a 10 dígitos que empiezan por 3, edad 5–100 | `INVALID_NAME`, `INVALID_PHONE`, `INVALID_BIRTH_DATE`, `DATA_POLICY_REQUIRED` |
| `update_my_profile(p_full_name, p_phone, p_birth_date, p_image_consent default null) → profiles` | autenticado | misma validación; `p_image_consent` null = sin cambio | `INVALID_NAME`, `INVALID_PHONE`, `INVALID_BIRTH_DATE` |

Analítica (solo admin, `FORBIDDEN` si no):
- `admin_subscriptions_overview(p_month date default null)`: una fila por alumna activa (desarrollador solo si tiene plan ese mes). Plan del mes = instancia no cancelada que se traslapa con el mes (prioriza no privados, luego la más reciente). `bucket` = `expired_not_renewed` > `balance_due` > `expiring_soon` (≤5 días o ≤1 clase, activo y no congelado) > `no_plan` > `ok`.
- `admin_revenue_report(p_from, p_to)` → `(dimension month|method|plan, key, label, amount, payments_count)`; `admin_outstanding_balance() → (total, students)`.
- `admin_renewal_report(p_months default 6)` → `(dimension month|plan, key, label, ended, renewed, renewal_rate)` sobre meses **completos** anteriores al actual; "renovado" = la alumna tiene otro plan no cancelado con `starts_on` en el mes siguiente.
- `admin_at_risk_students(p_days default 10)`, `admin_upcoming_birthdays(p_days default 7)` (maneja cambio de año y 29-feb → 28-feb).

Internas nuevas: `_plan_reason`, `_plan_lookup`, `_assign_plan_core`, `_generate_sessions_range`, `_normalize_phone`, `_validate_profile_input`, `_birthday_in_year`, `_month_start`, `_month_end`.

### Storage

Bucket privado `payment-receipts` (5 MB; jpeg/png/webp/pdf). Ruta `<student_id>/<uuid>.<ext>`. Políticas en `storage.objects`: solo admin puede `select`, `insert` y `delete`. Nadie más (ni la alumna) accede; usar URLs firmadas desde el cliente admin.

### Catálogo real

`seed.sql` (idempotente) y la migración `...0007` crean categorías Twerk/Urbano, tipos (Twerk Recreativo, Twerk Avanzado, Hip Hop, Breaking, Flex/Yoga/Gimnasia, Personalizada Twerk), los 12 planes del catálogo con cupos (Despierta 3+1, Instinto 3+3) y un horario de ejemplo (cupo 6). Supuestos: Flex/Yoga/Gimnasia es Urbano; Shake = 4 sesiones y Jiggle = 8 sesiones; Hip Hop con Jahn Evels y Twerk Recreativo del viernes con Angélica.

## Tablas

`profiles`, `admin_emails`, `student_admin_notes`, `teachers`, `class_types`, `rooms`, `class_schedules` (plantilla recurrente), `class_sessions` (instancias; `booked_count`/`waitlist_count` los mantiene un trigger), `plans`, `plan_class_types`, `student_plans`, `bookings`, `attendance`, `progress_notes`, `notifications`.

Notas de diseño:
- `admin_notes` **no** está en `profiles` (la alumna lee su propio perfil). Las notas internas viven en `student_admin_notes` (solo admin).
- Borrado lógico: `deleted_at` (profiles, teachers, class_types, plans) y `active` (rooms, schedules).
- `student_plans.expires_on = starts_on + duration_days` (último día válido).
- Un profesor (rol `teacher`) ve el perfil completo (incl. teléfono, acudiente, fecha de nacimiento) de las alumnas reservadas en sus clases: RLS es por fila, no por columna.
- Las alumnas sin asistencias en `admin_inactive_students` se cuentan desde su `created_at`.

## Admin bootstrap

1. La tabla `admin_emails` contiene `frank.alessandro.roldan@gmail.com`.
2. Al registrarse (trigger en `auth.users`), un email de `admin_emails` (sin distinguir mayúsculas) obtiene `role=admin, status=active`. Cualquier otro queda `student / pending`.
3. Insertar un email en `admin_emails` promueve de inmediato a esa persona si ya tiene cuenta.
4. Mae: agregar su correo con `insert into public.admin_emails (email) values ('correo@...');` (SQL editor) o desde la app como admin.
5. Un no-admin no puede cambiar su `role`, `status`, `email` ni `deleted_at` (trigger `BEFORE UPDATE`, error hint `FORBIDDEN_PROFILE_FIELDS`).

## RPCs

Todas `security definer`, `search_path=''`, `execute` solo para `authenticated`. Los errores son `raise exception` con mensaje en español y `hint` = código de máquina (en supabase-js: `error.hint` del PostgrestError). Errores comunes: `NOT_AUTHENTICATED`, `FORBIDDEN`.

| RPC | Quién | Qué valida | Códigos de error (hint) |
|---|---|---|---|
| `book_session(p_session_id uuid) → bookings` | alumna activa | sesión existe, `scheduled`, `group`, no iniciada; sin reserva activa; plan válido (activo, vigente en la fecha de la clase, no privado, cubre el tipo; paquete: `total - usados - reservas futuras > 0`; mensual: reservas en la semana ISO Bogotá `< weekly_limit`). Bloquea la sesión `FOR UPDATE`. Si hay cupo `booked`, si no `waitlist` con posición | `NOT_ACTIVE_STUDENT`, `SESSION_NOT_FOUND`, `SESSION_CANCELLED`, `SESSION_PRIVATE`, `SESSION_STARTED`, `ALREADY_BOOKED`, `NO_ACTIVE_PLAN`, `CLASS_TYPE_NOT_COVERED`, `PLAN_LIMIT_REACHED` |
| `cancel_booking(p_booking_id uuid) → bookings` | dueña (antes del inicio) o admin (siempre) | reserva existe y no cancelada. Si era `booked` promueve al primero de la lista de espera con plan válido, renumera y notifica (`booking_promoted`). Admin: si había asistencia consumida, la devuelve | `BOOKING_NOT_FOUND`, `ALREADY_CANCELLED`, `FORBIDDEN`, `SESSION_STARTED` |
| `admin_add_student_to_session(p_session_id, p_student_id, p_student_plan_id default null) → bookings` | admin | alumna activa; sesión programada; plan (dado o autodetectado) pertenece a la alumna y está vigente. Puede superar el cupo. Si estaba en lista de espera la pasa a `booked`. Notifica (`booking_added`) | `STUDENT_NOT_ACTIVE`, `SESSION_NOT_FOUND`, `SESSION_CANCELLED`, `PLAN_NOT_FOUND`, `PLAN_CANCELLED`, `PLAN_EXPIRED`, `ALREADY_BOOKED` |
| `mark_attendance(p_booking_id uuid, p_status attendance_status) → attendance` | solo admin | reserva `booked`, sesión no cancelada. `present` consume 1 clase (`classes_used+1`, `consumed=true`); salir de `present` la devuelve. Idempotente. Bloqueos de fila | `BOOKING_NOT_FOUND`, `BOOKING_NOT_BOOKED`, `SESSION_CANCELLED`, `PLAN_CANCELLED`, `PLAN_EXPIRED`, `PLAN_EXHAUSTED` |
| `generate_sessions(p_from date, p_weeks int default 4) → int` | admin | crea sesiones desde plantillas activas/vigentes (hora local → UTC), `on conflict do nothing`; devuelve cuántas creó. 1–26 semanas | `INVALID_WEEKS` |
| `cancel_session(p_session_id uuid, p_reason text) → class_sessions` | admin | motivo obligatorio; cancela reservas `booked` y `waitlist` sin consumo y notifica (`session_cancelled`) | `REASON_REQUIRED`, `SESSION_NOT_FOUND`, `ALREADY_CANCELLED` |
| `approve_user(p_profile_id uuid, p_role user_role, p_teacher_id uuid default null) → profiles` | admin | deja `status=active` con el rol. Si es `teacher` vincula `teachers.profile_id`. No permite quitarse admin a sí mismo | `PROFILE_NOT_FOUND`, `TEACHER_REQUIRED`, `TEACHER_NOT_FOUND`, `TEACHER_ALREADY_LINKED`, `CANNOT_DEMOTE_SELF` |
| `assign_plan(p_student_id uuid, p_plan_id uuid, p_starts_on date default hoy Bogotá, p_notes text default null) → student_plans` | admin | alumna y plan existen y están activos; calcula `expires_on` y `classes_total` | `STUDENT_NOT_FOUND`, `PLAN_NOT_FOUND` |
| `admin_inactive_students(p_days int default 14)` | admin | alumnas activas sin `present` en N días (`last_attended_at`, `phone`, `days_inactive`) | `FORBIDDEN` |
| `admin_occupancy_report(p_from date, p_to date)` | admin | filas por `dimension` = `class_type` \| `teacher` \| `weekday_hour` (weekday ISO, hour local): sesiones, capacidad, reservas, `occupancy_rate`, presentes, `attendance_rate` (clases grupales no canceladas) | `FORBIDDEN` |

Vista `student_plan_summary` (`security_invoker`): por plan de alumna, `classes_remaining`, `days_to_expire`, `booked_this_week`, `effective_status` y `is_expiring` (≤7 días o ≤2 clases). La alumna ve sus filas; admin todas.

Internas (sin acceso desde la API): `_find_valid_plan`, `_promote_waitlist`, `_renumber_waitlist`, `_notify`, `_session_label`, `_generate_sessions` (sin chequeo de admin; usada por el seed), `expire_student_plans`.

Los planes vencidos: `pg_cron` ejecuta `expire_student_plans()` a diario (`05:05 UTC` = 00:05 Bogotá); además las RPCs ya tratan `expires_on < hoy` como vencido.

## Otras reglas

- Las clases personalizadas (`kind='private'`) las crea el admin (insert directo en `class_sessions`, RLS admin) y asigna alumnas con `admin_add_student_to_session`. Usan planes con `is_private=true`.
- Las alumnas no escriben `bookings`/`attendance` directamente; solo por RPC. `notifications`: la usuaria solo puede actualizar `read_at`.
- `progress_notes`: admin y profesores (de alumnas reservadas en sus clases) escriben; la alumna lee las suyas; el profesor lee las que él escribió.

## Seed

`seed.sql` es idempotente y se ejecuta como `postgres` (SQL editor). Inserta el catálogo real (ver "Catálogo real"), salones, profesores (sin cuenta) y genera sesiones del mes actual y el siguiente.
