# felinas-system

## Git
- Antes de hacer cualquier commit, consúltame y espera mi confirmación explícita.
- Los commits SOLO se hacen con el usuario/correo que está configurado en git (`git config user.email`). No cambies esa configuración ni uses otra identidad.
- Prohibido incluir a Claude en los commits: nada de `Co-Authored-By: Claude`, ni "Generated with Claude Code", ni ninguna mención o coautoría de Claude en mensajes de commit o PRs.

# CLAUDE.md — Felinas System

Sistema de agendamiento, control y seguimiento de clases, estudiantes y profesores para una academia profesional de baile (Academia Felinas / Pantera Felinas, Palmira, Colombia).

Este archivo combina tres líneas de guía: senior fullstack, diseño frontend con identidad propia y clean code pragmático. Léelo completo antes de escribir código.

---

## 1. Contexto del producto

**Qué es:** herramienta interna de gestión para la academia. Reemplaza el manejo manual (Google Sheets `BD_FELINAS` + Google Forms) por un sistema propio.

**Quiénes lo usan:**

| Rol | Qué necesita |
|---|---|
| **Admin / dirección** | Ver todo: agenda, ocupación, pagos, asistencia, reportes. Crear y editar clases, profesores y estudiantes. |
| **Profesor** | Ver su agenda, cuántas y quiénes reservaron cada clase, dejar notas de seguimiento. (No marca asistencia: ver sección 4.) |
| **Estudiante** | Ver clases disponibles, reservar/cancelar cupo, ver su historial y estado de plan. |

**Categorías de clase actuales:** Twerk Recreativo, Hip Hop, Breaking, Flex/Yoga, Twerk Avanzado. Deben ser datos en base de datos, no constantes en el código: la academia va a crear más.

**Profesores actuales:** Mae, Angélica, Jahn Evels, Andrea Altamirano. Son datos de ejemplo para seed, nunca valores fijos en el código.

**Módulos:**
1. Agenda y clases (horarios recurrentes, sesiones concretas, salones, cupos).
2. Estudiantes (perfil, plan/paquete, estado).
3. Profesores (perfil, disponibilidad, clases asignadas).
4. Reservas y asistencia (reservar, cancelar, lista de espera, check-in).
5. Seguimiento (historial por estudiante, notas, progreso, alertas de inactividad).
6. Pagos y planes (paquetes de clases, vencimientos). **Alcance por confirmar con el cliente antes de construir.**
7. Reportes (ocupación por clase, asistencia por profesor, retención).

**Funcionalidades extra aprobadas (2026-09-28):**
- Alerta a la alumna cuando su plan está por vencer o le quedan ≤2 clases.
- Alerta al admin de alumnas inactivas (>14 días sin asistir).
- Reporte de ocupación por clase y por profesor (qué horarios se llenan y cuáles no).
- Cancelar una sesión con aviso a las alumnas reservadas (no descuenta clases).
- Botón de WhatsApp directo a la alumna desde el panel admin.

---

## 2. Regla de oro: preguntar antes de asumir

La lógica de negocio de una academia tiene muchas excepciones. **Si una regla no está escrita aquí, pregunta. No la inventes.** Casos típicos donde debes preguntar:

- ¿Una reserva cancelada tarde consume la clase del paquete?
- ¿Cuánto tiempo antes se puede cancelar sin penalización?
- ¿Los paquetes vencen? ¿Las clases se pueden congelar?
- ¿Hay clase de prueba gratis? ¿Cuántas por persona?
- ¿Se cobra por clase suelta, por mensualidad o por paquete?
- ¿Un profesor puede reemplazar a otro? ¿Cómo se registra?
- ¿Un estudiante menor de edad necesita acudiente registrado?
- ¿Qué pasa cuando un profesor cancela una clase?

Cuando el usuario responda, deja la regla documentada en la sección 4 de este archivo.

---

## 3. Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Edge Functions, Realtime cuando aporte valor)
- **Gestor de paquetes:** pnpm
- **Validación:** Zod para formularios y para todo dato que entra por Edge Functions
- **Datos en cliente:** TanStack Query para caché y estados de carga/error
- **Fechas:** `date-fns` + `@date-fns/tz` con zona horaria **America/Bogota**
- **Router:** TanStack Router (rutas tipadas, search params validados con Zod, guards por rol en `beforeLoad`)
- **Estado cliente:** Zustand solo para UI global mínima. Datos del servidor → TanStack Query. Filtros → URL.
- **UI:** componentes propios con Tailwind. Radix **sin estilo** solo para primitivos con accesibilidad compleja (Dialog, Popover, Select, DropdownMenu).
- **Calendario:** propio con `date-fns`. Sin FullCalendar ni librerías de calendario. Vista **mensual por defecto** y semanal como segunda vista (estado en la URL: `?view=month|week&date=yyyy-MM-dd`, ver `features/schedule/calendarSearch.ts`). Debe escalar a varias clases por día aunque hoy casi siempre haya una.
- **Toasts:** `sileo`

> Supuesto: es una app autenticada aparte del sitio público `felinas-web` (Astro). Si se decide integrarla en ese repo, avisar antes de cambiar la estructura.

---

## 4. Reglas de negocio confirmadas

- 2026-09-28: **Planes** de dos tipos, ambos creados por el admin: paquete de N clases con vencimiento, y mensualidad con límite de clases por semana.
- 2026-09-28: **Acceso por plan:** cada plan define qué categorías/estilos puede reservar la alumna. Las clases personalizadas usan su propio plan, aparte del grupal.
- 2026-09-28: **Consumo:** una clase solo se descuenta del plan cuando el admin marca asistencia (`asistio`). Faltar o cancelar no descuenta.
- 2026-09-28: **Asistencia:** la marca **solo el admin**. El profesor ve quién reservó, no marca asistencia.
- 2026-09-28: **Reservas:** reservar y cancelar libremente hasta el inicio de la clase. Con cupo lleno, la alumna entra en lista de espera y sube automáticamente cuando alguien cancela.
- 2026-09-28: **Personalizadas:** las agenda el admin (asigna alumna(s), profe y hora). No se reservan desde la vista de alumna.
- 2026-09-28: **Alta de usuarios:** registro libre con Google OAuth. La cuenta queda `pendiente` hasta que el admin la aprueba y le asigna rol (y plan si es alumna).
- 2026-09-28: **Roles:** admin (Mae y el desarrollador), teacher, student.
- 2026-09-29: **El desarrollador** (`frank.alessandro.roldan@gmail.com`, `profiles.is_developer`) puede entrar a los tres módulos (admin, profe, alumna) con un selector de vista. En vista profe elige qué profe "suplantar" (solo lectura de datos que admin ya puede ver).
- 2026-09-29: **Mes calendario:** Mae organiza todo al inicio de cada mes. Los planes se asignan por mes calendario (vencen el último día del mes); los horarios cambian cada mes. Clases sobrantes al final del mes **se pierden** (no se acumulan). _Supuesto: si se asigna a mitad de mes, recibe el plan completo y vence igual a fin de mes; confirmar si se prorratea._
- 2026-09-29: **Catálogo real (de felinas-web):** categorías Twerk y Urbano (Hip Hop/Breaking). Planes combo con cupo por categoría: Despierta 4 clases (3 Twerk + 1 Urbano) $120.000 · Instinto 6 (3+3) $165.000 · Alfa 8 (libre) $210.000 · Ruge y Fluye 12 (libre) $260.000. Twerk: Tic Toc 6 grupales $135.000 · Shake personalizado individual $200.000 · Jiggle personalizado intensivo $360.000. Urbano: Base 4 $130.000 · Intermedio 6 $180.000 · Plus 8 $225.000. Clase suelta: Twerk $30.000 · Urbano $35.000. Grupos de **máximo 6** personas.
- 2026-09-29: **Congelar plan** es opcional: mientras está congelado no se puede reservar y, al descongelar, el vencimiento se corre los días congelados.
- 2026-09-29: **Pagos:** se registran manualmente (efectivo, Nequi, transferencia…) con comprobante opcional. Cada plan asignado tiene un valor a pagar; saldo = valor − pagos.
- 2026-09-29: **Registro de primer ingreso:** nombre, celular, fecha de cumpleaños, aceptación obligatoria de tratamiento de datos (Ley 1581) y autorización opcional de uso de imagen.

<!-- Ejemplo:
- 2026-10-01: la cancelación sin penalización es hasta 2 horas antes de la clase.
-->

---

## 5. Arquitectura

### Modelo de datos (borrador; confirmar antes de migrar)

- `profiles` — usuario base ligado a `auth.users`, con `role` (`admin`, `teacher`, `student`).
- `students` — datos del estudiante, acudiente si es menor, estado (`activo`, `inactivo`, `congelado`).
- `teachers` — datos del profesor, estilos que dicta, estado.
- `class_types` — categoría/estilo (Hip Hop, Breaking…), nivel, descripción.
- `class_schedules` — plantilla recurrente: tipo, profesor, salón, día, hora inicio/fin, cupo máximo.
- `class_sessions` — **instancia concreta** de una clase en una fecha. Se genera desde `class_schedules`; puede cancelarse o reemplazar profesor sin tocar la plantilla.
- `rooms` — salones y capacidad.
- `bookings` — reserva de un estudiante a una `class_session` (`reservada`, `cancelada`, `lista_espera`).
- `attendance` — asistencia real (`asistio`, `falto`, `justificada`), registrada por el profesor.
- `plans` y `student_plans` — paquetes y su saldo/vencimiento.
- `payments` — pagos registrados (solo si el módulo de pagos entra en alcance).
- `progress_notes` — notas de seguimiento por estudiante, escritas por profesores.

### Principios de datos

- **Plantilla vs. sesión:** nunca calcules la agenda al vuelo desde la plantilla. Genera `class_sessions` y trabaja sobre ellas.
- **Fechas en `timestamptz`**, guardadas en UTC, mostradas en America/Bogota.
- **Cupos y reservas se validan en la base de datos** (función RPC o constraint), no solo en el cliente. Dos estudiantes reservando el último cupo a la vez no debe romper nada.
- **Borrado lógico** (`deleted_at` o `status`) para estudiantes, profesores y clases con historial.
- **El saldo de clases de un plan se deriva o se actualiza con una función transaccional**, nunca desde el cliente.

### Seguridad (desde el día uno)

- **RLS activado en todas las tablas.** Ninguna tabla queda sin política.
- Estudiante: solo lee y modifica lo suyo.
- Profesor: solo ve sus clases y los estudiantes inscritos en ellas.
- Admin: acceso total.
- Nunca usar la `service_role` key en el cliente. Solo en Edge Functions.
- Datos de menores: mínimo necesario, sin exponerlos a otros estudiantes.
- Validar rol en el servidor, no confiar en lo que diga el frontend.

### Estructura de carpetas sugerida

```
src/
  features/
    schedule/      # agenda y sesiones
    students/
    teachers/
    bookings/
    attendance/
    progress/
    reports/
  components/      # UI compartida
  lib/             # supabase client, utils, fechas
  hooks/
  types/           # tipos generados de Supabase
supabase/
  migrations/
  functions/
```

Organiza por **feature**, no por tipo de archivo.

---

## 6. Código: clean code pragmático

- Funciones pequeñas que hacen una sola cosa (SRP).
- Nombres que revelan intención: `getAvailableSpots`, no `calc2`.
- **Guard clauses** y retornos tempranos en lugar de `if` anidados.
- DRY con criterio: no abstraer hasta tener tres repeticiones reales.
- KISS y YAGNI: no construir lo que nadie pidió. Sin sistemas de plugins ni capas "por si acaso".
- TypeScript estricto: sin `any`. Usar los tipos generados por Supabase.
- Sin números ni strings mágicos: estados y roles como uniones de tipos o enums.
- Manejo explícito de estados `loading`, `error` y `empty` en cada pantalla.
- Comentarios solo para explicar el **porqué**, no el qué.
- Textos de interfaz en español, código y nombres técnicos en inglés.

**Antipatrones a evitar:** lógica de negocio dentro de componentes de UI, consultas a Supabase regadas por todo el código, fechas manipuladas con strings, permisos controlados solo ocultando botones.

---

## 7. Diseño e interfaz

**Identidad:** hereda el universo Pantera Felinas (oscuro, felino, energía urbana, motivo de garras/rasguños). No un dashboard SaaS genérico blanco con acentos azules ni degradados morados.

**Reglas de UI:**

- **Modo oscuro por defecto**, con un acento de marca fuerte. Definir colores como variables CSS/Tailwind, no valores sueltos.
- **Tipografía con carácter:** una display para títulos y una legible para datos. Evitar Inter/Roboto/Arial como identidad.
- **Agenda como pieza central:** vista semanal tipo calendario para admin y profesor; vista de lista de próximas clases para estudiante.
- **Densidad de información útil en la agenda:** de un vistazo ver categoría, profesor, salón, cupos ocupados/totales y estado.
- Cupos con indicador visual claro (disponible, casi lleno, lleno).
- **Móvil primero para estudiantes y profesores** (reservan y toman asistencia desde el celular). El panel admin prioriza escritorio pero debe funcionar en tablet.
- Tomar asistencia debe ser rápido: máximo dos toques por estudiante.
- Animaciones con propósito (transiciones de estado, confirmaciones), no decorativas. Respetar `prefers-reduced-motion`.
- Contraste mínimo 4.5:1, objetivos táctiles de 44px, foco visible, etiquetas en todos los campos.
- Rendimiento y accesibilidad no son negociables.

---

## 8. Cómo trabajar en este repo (Claude Code)

- **No hacer commits ni operaciones de git** (commit, push, merge, rebase, reset) a menos que el usuario lo pida explícitamente. Puedes sugerir el mensaje de commit.
- Escribir el código directamente; explicar después y de forma breve.
- Ante un error, corregirlo primero y explicar luego.
- Si algo es ambiguo o afecta reglas de negocio, **preguntar** (ver sección 2).
- No instalar dependencias nuevas sin justificar por qué.
- Migraciones de Supabase siempre como archivos versionados en `supabase/migrations/`, nunca cambios manuales sin registrar.
- Regenerar los tipos de Supabase después de cada migración.
- Datos de prueba en un seed reproducible, sin datos reales de estudiantes.
- No exponer secretos: variables en `.env`, con `.env.example` sin valores reales.

---

## 9. Checklist antes de dar algo por terminado

**Funcional**
- [ ] Funciona en el flujo feliz y en los casos borde (cupo lleno, cancelación tardía, clase cancelada).
- [ ] Estados `loading`, `error` y `empty` cubiertos.
- [ ] Reglas de negocio implementadas coinciden con la sección 4.

**Datos y seguridad**
- [ ] La tabla nueva tiene RLS y políticas por rol.
- [ ] Ninguna validación crítica vive solo en el cliente.
- [ ] Fechas verificadas en zona America/Bogota.
- [ ] Tipos de Supabase regenerados.

**Código**
- [ ] Sin `any`, sin código muerto, sin `console.log`.
- [ ] Funciones cortas, nombres claros, lógica fuera de los componentes.

**UI**
- [ ] Coherente con la identidad Felinas, no parece plantilla.
- [ ] Probado en móvil y escritorio.
- [ ] Contraste, foco y navegación por teclado revisados.