import { useState } from 'react'
import { Flame, Inbox, Plus, Settings, Users } from 'lucide-react'
import { CalendarView } from '@/components/calendar'
import type { CalendarEvent } from '@/components/calendar'
import { dateAtMinutes } from '@/components/calendar/lib'
import { academyNow, getMonthGridDays, getWeekDays, toDateKey, type CalendarViewMode } from '@/lib/dates'
import {
  AsyncContent,
  Avatar,
  Badge,
  Button,
  CapacityBar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  PageHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ProgressBar,
  Select,
  Skeleton,
  Spinner,
  StatCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
} from '@/components/ui'

interface EventSeed {
  day: number
  start: number
  duration: number
  title: string
  color: string
  teacher: string
  room: string
  booked: number
  capacity: number
  extra?: Partial<CalendarEvent>
}

const SEEDS: EventSeed[] = [
  { day: 0, start: 18 * 60, duration: 60, title: 'Twerk Recreativo', color: '#ea1a62', teacher: 'Mae', room: 'Salón A', booked: 8, capacity: 12 },
  { day: 0, start: 18 * 60 + 30, duration: 60, title: 'Hip Hop', color: '#ffd900', teacher: 'Jahn Evels', room: 'Salón B', booked: 12, capacity: 12, extra: { waitlist: 3 } },
  { day: 1, start: 9 * 60, duration: 90, title: 'Flex / Yoga', color: '#3ddc97', teacher: 'Angélica', room: 'Salón A', booked: 4, capacity: 15, extra: { badge: { label: 'Reservada', tone: 'ok' } } },
  { day: 1, start: 19 * 60, duration: 60, title: 'Breaking', color: '#8a3dff', teacher: 'Jahn Evels', room: 'Salón B', booked: 10, capacity: 14 },
  { day: 2, start: 18 * 60, duration: 60, title: 'Twerk Avanzado', color: '#e0359e', teacher: 'Andrea Altamirano', room: 'Salón A', booked: 6, capacity: 12, extra: { disabled: true, badge: { label: 'No incluida en tu plan', tone: 'neutral' } } },
  { day: 2, start: 20 * 60, duration: 60, title: 'Hip Hop', color: '#ffd900', teacher: 'Jahn Evels', room: 'Salón B', booked: 5, capacity: 12, extra: { status: 'cancelled' } },
  { day: 3, start: 17 * 60, duration: 60, title: 'Personalizada · Valeria', color: '#ffb020', teacher: 'Mae', room: 'Salón A', booked: 1, capacity: 1, extra: { kind: 'private' } },
  { day: 4, start: 18 * 60, duration: 60, title: 'Twerk Recreativo', color: '#ea1a62', teacher: 'Mae', room: 'Salón A', booked: 12, capacity: 12, extra: { badge: { label: 'En espera', tone: 'warn' } } },
  { day: 5, start: 10 * 60, duration: 90, title: 'Breaking', color: '#8a3dff', teacher: 'Jahn Evels', room: 'Salón B', booked: 3, capacity: 14 },
]

function buildWeekEvents(weekStart: Date): CalendarEvent[] {
  const days = getWeekDays(weekStart)
  const weekKey = toDateKey(weekStart)
  return SEEDS.flatMap((seed, index) => {
    const day = days[seed.day]
    if (!day) return []
    return [
      {
        id: `demo-${weekKey}-${index}`,
        title: seed.title,
        startsAt: dateAtMinutes(day, seed.start).toISOString(),
        endsAt: dateAtMinutes(day, seed.start + seed.duration).toISOString(),
        color: seed.color,
        teacherName: seed.teacher,
        roomName: seed.room,
        booked: seed.booked,
        capacity: seed.capacity,
        status: 'scheduled',
        kind: 'group',
        ...seed.extra,
      } satisfies CalendarEvent,
    ]
  })
}

/** Repite los eventos de ejemplo en cada semana visible del mes. */
function buildEvents(date: Date): CalendarEvent[] {
  const weekStarts = getMonthGridDays(date).filter((_, index) => index % 7 === 0)
  return weekStarts.flatMap(buildWeekEvents)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-fg-muted">{title}</h2>
      {children}
    </section>
  )
}

export function Showcase() {
  const [date, setDate] = useState<Date>(() => academyNow())
  const [view, setView] = useState<CalendarViewMode>('month')
  const [switchOn, setSwitchOn] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastClick, setLastClick] = useState('—')
  const events = buildEvents(date)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 bg-claws p-4 pb-24 sm:p-8">
      <PageHeader
        eyebrow="Academia Felinas"
        title="Sistema de diseño"
        description="Todos los componentes con datos de prueba."
        actions={
          <Button>
            <Plus className="size-4" aria-hidden /> Nueva clase
          </Button>
        }
      />

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Peligro</Button>
          <Button loading>Guardando</Button>
          <Button size="sm">Pequeño</Button>
          <Button size="lg">Grande</Button>
          <IconButton aria-label="Ajustes" variant="secondary">
            <Settings className="size-5" aria-hidden />
          </IconButton>
        </div>
      </Section>

      <Section title="Formularios">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" hint="Como aparece en tu documento" required>
            <Input placeholder="Valeria Gómez" />
          </Field>
          <Field label="Correo" error="Ingresa un correo válido">
            <Input type="email" defaultValue="valeria@" />
          </Field>
          <Field label="Categoría">
            <Select
              options={[
                { value: 'twerk', label: 'Twerk Recreativo' },
                { value: 'hiphop', label: 'Hip Hop' },
                { value: 'breaking', label: 'Breaking' },
              ]}
            />
          </Field>
          <Field label="Notas">
            <Textarea placeholder="Observaciones de la clase…" rows={3} />
          </Field>
          <Checkbox label="Acepto los términos" defaultChecked />
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="Recordatorios" />
            Recordatorios por WhatsApp
          </label>
        </div>
      </Section>

      <Section title="Tarjetas y datos">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Reservas hoy" value={42} hint="6 clases" icon={Users} tone="rosa" trend={{ label: '+12% vs. ayer', tone: 'ok' }} />
          <StatCard label="Ocupación" value="78%" icon={Flame} tone="warn" />
          <StatCard label="Inactivas" value={5} hint="Más de 14 días" tone="danger" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Plan mensual</CardTitle>
            <CardDescription>8 clases por mes, vence el 30 de octubre</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ProgressBar value={5} max={8} label="5 de 8 clases usadas" />
            <CapacityBar booked={8} capacity={12} />
            <CapacityBar booked={10} capacity={12} />
            <CapacityBar booked={12} capacity={12} />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="rosa">Rosa</Badge>
              <Badge tone="dorado">Dorado</Badge>
              <Badge tone="ok">Ok</Badge>
              <Badge tone="warn">Aviso</Badge>
              <Badge tone="danger">Peligro</Badge>
              <Badge color="#8a3dff">Breaking</Badge>
              <Avatar name="Mae Felina" size="sm" />
              <Avatar name="Jahn Evels" />
              <Avatar name="Angélica R" size="lg" />
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm">Renovar</Button>
            <Spinner size="sm" />
          </CardFooter>
        </Card>
      </Section>

      <Section title="Superposiciones y navegación">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Abrir diálogo
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Cancelar clase
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>Detalle rápido de la clase.</PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">Menú</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone="danger">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip content="Ajustes de la academia">
            <IconButton aria-label="Ajustes" variant="secondary">
              <Settings className="size-5" aria-hidden />
            </IconButton>
          </Tooltip>
        </div>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Próximas</TabsTrigger>
            <TabsTrigger value="b">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Contenido de próximas clases.</TabsContent>
          <TabsContent value="b">Contenido del historial.</TabsContent>
        </Tabs>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Nueva reserva"
          description="Confirma los datos de la clase."
          footer={<Button onClick={() => setDialogOpen(false)}>Listo</Button>}
        >
          <Field label="Alumna">
            <Input placeholder="Buscar alumna" />
          </Field>
        </Dialog>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="¿Cancelar esta clase?"
          description="Se avisará a las alumnas reservadas. No se descuenta ninguna clase."
          confirmLabel="Cancelar clase"
          tone="danger"
          onConfirm={() => new Promise((resolve) => window.setTimeout(resolve, 900))}
        />
      </Section>

      <Section title="Estados">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState icon={Inbox} title="Sin reservas" description="Cuando reserves una clase aparecerá aquí." action={<Button size="sm">Ver clases</Button>} />
          <ErrorState message="No pudimos cargar la agenda." onRetry={() => undefined} />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <AsyncContent isLoading={false} error={null} isEmpty>
            <p>Contenido</p>
          </AsyncContent>
        </div>
      </Section>

      <Section title="Calendario">
        <p className="text-xs text-fg-muted">Último clic: {lastClick}</p>
        <CalendarView
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          events={events}
          onEventClick={(event) => setLastClick(event.title)}
          onSlotClick={(date) => setLastClick(date.toISOString())}
          renderAction={(event) => (
            <Button size="sm" disabled={event.disabled || event.status === 'cancelled'}>
              Reservar
            </Button>
          )}
        />
      </Section>
    </div>
  )
}
