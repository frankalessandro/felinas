import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Info, MoreVertical, Pause, Pencil, Play, Plus } from 'lucide-react'
import { useState } from 'react'
import {
  AsyncContent,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import { WEEKDAYS } from '../constants'
import { formatTime, formatTimeRange } from '../format'
import { useToggleSchedule } from '../hooks/useClassMutations'
import { schedulesQuery } from '../queries'
import type { ScheduleWithDetails } from '../types'
import { ScheduleFormDialog } from './ScheduleFormDialog'

/** Domingo primero, como los calendarios. */
const CALENDAR_ORDER = [...WEEKDAYS.filter((day) => day.value === 7), ...WEEKDAYS.filter((day) => day.value !== 7)]

interface DialogState {
  schedule: ScheduleWithDetails | null
  weekday: number
}

function groupByWeekday(schedules: ScheduleWithDetails[]): Map<number, ScheduleWithDetails[]> {
  const groups = new Map<number, ScheduleWithDetails[]>()
  for (const schedule of schedules) {
    groups.set(schedule.weekday, [...(groups.get(schedule.weekday) ?? []), schedule])
  }
  return groups
}

function ScheduleRow({ schedule, onEdit }: { schedule: ScheduleWithDetails; onEdit: () => void }) {
  const toggle = useToggleSchedule()
  const color = schedule.class_type?.color ?? '#8a7a90'
  return (
    <li
      style={{ ['--style' as string]: color }}
      className={cn('relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-[linear-gradient(100deg,color-mix(in_srgb,var(--style)_12%,transparent),transparent_55%)] bg-surface-2/60 py-3 pl-5 pr-2 transition hover:border-[color-mix(in_srgb,var(--style)_45%,var(--color-line))]', !schedule.active && 'opacity-60')}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />
      <p className="w-16 shrink-0 font-display text-sm font-bold leading-tight tabular-nums">{formatTime(schedule.start_time)}</p>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm font-bold">{schedule.class_type?.name ?? 'Estilo eliminado'}</span>
          {!schedule.active && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warn">
              <Pause className="size-3" aria-hidden />
              Pausado
            </span>
          )}
        </div>
        <p className="text-xs text-fg-muted">
          {formatTimeRange(schedule.start_time, schedule.end_time)} · {schedule.teacher?.full_name ?? 'Sin profe'}
        </p>
        <p className="text-xs text-fg-subtle">
          {schedule.room?.name ?? 'Sin salón'} · cupo {schedule.capacity}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton aria-label="Acciones del horario">
            <MoreVertical className="size-5" aria-hidden />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" aria-hidden /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toggle.mutate({ id: schedule.id, active: !schedule.active })}>
            {schedule.active ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {schedule.active ? 'Pausar' : 'Reactivar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

export function SchedulesTab() {
  const query = useQuery(schedulesQuery())
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const groups = groupByWeekday(query.data ?? [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-2xl border border-ambar/30 bg-ambar-soft p-4 text-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-ambar" aria-hidden />
        <p className="text-fg-muted">
          Los horarios son <strong className="text-fg">plantillas semanales</strong>. Después de crear o editar uno, genera las sesiones con «Generar
          semanas» en{' '}
          <Link to="/admin/agenda" className="font-semibold text-rosa-hover underline underline-offset-2">
            Agenda
          </Link>
          .
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">Resumen semanal de la programación recurrente.</p>
        <Button onClick={() => setDialog({ schedule: null, weekday: 1 })}>
          <Plus className="size-4" aria-hidden /> Nuevo horario
        </Button>
      </div>

      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => query.refetch()}
        empty={
          <EmptyState
            illustration="calendar"
            title="Sin horarios todavía"
            description="Crea una plantilla semanal para poder generar las sesiones de la agenda."
            action={<Button onClick={() => setDialog({ schedule: null, weekday: 1 })}>Crear horario</Button>}
          />
        }
      >
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {CALENDAR_ORDER.map((day) => {
            const items = groups.get(day.value) ?? []
            if (items.length === 0 && day.value === 7) return null
            return (
              <section key={day.value} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{day.label}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setDialog({ schedule: null, weekday: day.value })} aria-label={`Agregar horario el ${day.label}`}>
                    <Plus className="size-4" aria-hidden /> Agregar
                  </Button>
                </div>
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-fg-subtle">Sin clases este día</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {items.map((schedule) => (
                      <ScheduleRow key={schedule.id} schedule={schedule} onEdit={() => setDialog({ schedule, weekday: schedule.weekday })} />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      </AsyncContent>

      {dialog && <ScheduleFormDialog schedule={dialog.schedule} defaultWeekday={dialog.weekday} onClose={() => setDialog(null)} />}
    </div>
  )
}
