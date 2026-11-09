# Componentes UI de Felinas

Sistema de componentes propio (Tailwind v4 + Radix sin estilo). Importa siempre desde el índice:

```ts
import { Button, Card, Field, Input } from '@/components/ui'
import { CalendarView, type CalendarEvent } from '@/components/calendar'
```

## Catálogo

- **Acciones:** `Button` (primary, secondary, ghost, outline, danger; sm/md/lg/icon; `loading`), `IconButton` (exige `aria-label`), `buttonVariants()` para dar estilo de botón a enlaces.
- **Formularios:** `Field` (label + control + hint + error, conecta `aria-*`), `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Label`.
- **Contenedores:** `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`), `PageHeader`, `StatCard`.
- **Superposiciones:** `Dialog` (modal en escritorio, hoja inferior en móvil), `ConfirmDialog`, `Popover`, `DropdownMenu`, `Tooltip`.
- **Navegación:** `Tabs`, `SegmentedControl`.
- **Datos:** `Badge` (tonos o `color` hex), `Avatar`, `ProgressBar`, `CapacityBar`.
- **Estados:** `Spinner`, `Skeleton`, `EmptyState`, `ErrorState`, `AsyncContent` (loading / error / empty / contenido).

## Convenciones

- Solo tokens del tema (`bg-surface`, `text-fg-muted`, `border-line`, `rosa`, etc.); nada de hex sueltos salvo el color del tipo de clase.
- Un componente por archivo, props tipadas, `ref` como prop normal (React 19).
- Los componentes son presentacionales: sin fetching, sin lógica de negocio.
- Objetivos táctiles de 44px, foco visible, `aria-label` en controles de solo icono, textos en español.
- Fechas: siempre `@/lib/dates` (zona America/Bogota).
- Cupos: `CapacityBar` usa verde < 70 %, ámbar 70–99 %, rojo lleno.

## Calendario (`@/components/calendar`)

`CalendarView` compone `WeekNavigator` + `WeekGrid` (desde `md`) o `DayStrip` + `AgendaList` (móvil). Recibe `CalendarEvent[]` ya transformados: el mapeo desde la base de datos vive en cada feature. Las funciones puras de layout (`groupEventsByDay`, `layoutDayEvents`, `getVisibleRange`) están en `calendar/lib.ts`.

## Showcase

`__showcase__/Showcase.tsx` renderiza todo con datos falsos. Es temporal: no se monta en producción.
