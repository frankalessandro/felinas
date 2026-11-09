import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AsyncContent, Button, Dialog, Field, Input, Select } from '@/components/ui'
import type { SessionKind, SessionWithDetails } from '@/features/schedule/types'
import { cn } from '@/lib/cn'
import { academyToday, toDateKey } from '@/lib/dates'
import { addMinutesToTime, timeToMinutes, toTimeInput } from '../dateInputs'
import { useSaveSession } from '../hooks/useSessionMutations'
import { sessionFormOptionsQuery } from '../queries'
import { validateSessionForm, type SessionFormErrors, type SessionFormState } from '../schemas'
import type { SessionFormOptions } from '../types'

const NO_ROOM = 'none'
const DEFAULT_START = '18:00'
const DEFAULT_DURATION_MINUTES = 60
const DEFAULT_GROUP_CAPACITY = 15
const PRIVATE_CAPACITY = 1

const KIND_OPTIONS: { value: SessionKind; label: string }[] = [
  { value: 'group', label: 'Grupal' },
  { value: 'private', label: 'Personalizada' },
]

function buildDefaults(session: SessionWithDetails | null | undefined, initialStart: Date | undefined): SessionFormState {
  if (session) {
    return {
      kind: session.kind,
      classTypeId: session.class_type_id,
      teacherId: session.teacher_id,
      roomId: session.room_id ?? '',
      date: toDateKey(session.starts_at),
      startTime: toTimeInput(session.starts_at),
      endTime: toTimeInput(session.ends_at),
      capacity: String(session.capacity),
      title: session.title ?? '',
    }
  }
  const start = initialStart ? toTimeInput(initialStart.toISOString()) : DEFAULT_START
  return {
    kind: 'group',
    classTypeId: '',
    teacherId: '',
    roomId: '',
    date: toDateKey(initialStart ?? academyToday()),
    startTime: start,
    endTime: addMinutesToTime(start, DEFAULT_DURATION_MINUTES),
    capacity: String(DEFAULT_GROUP_CAPACITY),
    title: '',
  }
}

interface SessionFormProps {
  options: SessionFormOptions
  defaults: SessionFormState
  /** Presente al editar. */
  session: SessionWithDetails | null | undefined
  onSaved: (session: SessionWithDetails) => void
  onCancel: () => void
}

function SessionForm({ options, defaults, session, onSaved, onCancel }: SessionFormProps) {
  const [state, setState] = useState(defaults)
  const [errors, setErrors] = useState<SessionFormErrors>({})
  const save = useSaveSession()
  const isEdit = Boolean(session)

  function patch(next: Partial<SessionFormState>) {
    setState((prev) => ({ ...prev, ...next }))
  }

  function changeKind(kind: SessionKind) {
    patch({ kind, capacity: String(kind === 'private' ? PRIVATE_CAPACITY : DEFAULT_GROUP_CAPACITY) })
  }

  function changeRoom(value: string) {
    const roomId = value === NO_ROOM ? '' : value
    const room = options.rooms.find((r) => r.id === roomId)
    // En grupales el salón sugiere el cupo; en personalizadas se respeta el 1.
    patch({ roomId, ...(room && state.kind === 'group' && !isEdit ? { capacity: String(room.capacity) } : {}) })
  }

  /** Mover la hora de inicio arrastra la de fin para conservar la duración. */
  function changeStart(startTime: string) {
    const duration = Math.max(timeToMinutes(state.endTime) - timeToMinutes(state.startTime), DEFAULT_DURATION_MINUTES / 2)
    patch({ startTime, endTime: addMinutesToTime(startTime, duration) })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateSessionForm(state, session?.booked_count ?? 1)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    try {
      const saved = await save.mutateAsync({ id: session?.id, values: result.values })
      onSaved(saved)
    } catch {
      // El toast de error ya lo muestra el hook; el formulario queda abierto para corregir.
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4" noValidate>
      {!isEdit && (
        <div role="radiogroup" aria-label="Tipo de sesión" className="grid grid-cols-2 gap-3">
          {KIND_OPTIONS.map((option) => {
            const selected = state.kind === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => changeKind(option.value)}
                className={cn(
                  'flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[.98]',
                  selected ? 'border-rosa bg-rosa-soft ring-1 ring-rosa/40' : 'border-line bg-surface-2 hover:border-line-strong',
                )}
              >
                <span className="font-display text-sm font-bold">{option.label}</span>
                <span className="text-xs text-fg-muted">{option.value === 'group' ? 'Varias alumnas, reservan solas' : 'Tú asignas alumna y hora'}</span>
              </button>
            )
          })}
        </div>
      )}
      <Field label="Estilo" error={errors.classTypeId} required>
        <Select
          value={state.classTypeId}
          onValueChange={(classTypeId) => patch({ classTypeId })}
          options={options.classTypes.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="Elige el estilo"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Profesor" error={errors.teacherId} required hint={isEdit ? 'Cámbialo para registrar un reemplazo.' : undefined}>
          <Select
            value={state.teacherId}
            onValueChange={(teacherId) => patch({ teacherId })}
            options={options.teachers.map((t) => ({ value: t.id, label: t.full_name }))}
            placeholder="Elige el profesor"
          />
        </Field>
        <Field label="Salón" error={errors.roomId}>
          <Select
            value={state.roomId || NO_ROOM}
            onValueChange={changeRoom}
            options={[{ value: NO_ROOM, label: 'Sin salón' }, ...options.rooms.map((r) => ({ value: r.id, label: `${r.name} (${r.capacity})` }))]}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Fecha" error={errors.date} required>
          <Input type="date" value={state.date} onChange={(e) => patch({ date: e.target.value })} />
        </Field>
        <Field label="Inicio" error={errors.startTime} required>
          <Input type="time" value={state.startTime} onChange={(e) => changeStart(e.target.value)} />
        </Field>
        <Field label="Fin" error={errors.endTime} required>
          <Input type="time" value={state.endTime} onChange={(e) => patch({ endTime: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cupos" error={errors.capacity} required>
          <Input type="number" inputMode="numeric" min={1} value={state.capacity} onChange={(e) => patch({ capacity: e.target.value })} />
        </Field>
        <Field label="Título (opcional)" error={errors.title} hint="Si lo dejas vacío se usa el nombre del estilo.">
          <Input value={state.title} maxLength={80} onChange={(e) => patch({ title: e.target.value })} />
        </Field>
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={save.isPending}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          {isEdit ? 'Guardar cambios' : 'Crear clase'}
        </Button>
      </div>
    </form>
  )
}

interface SessionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sesión a editar; sin ella se crea una nueva. */
  session?: SessionWithDetails | null
  /** Fecha/hora del hueco clicado en el calendario. */
  initialStart?: Date
  onSaved?: (session: SessionWithDetails) => void
}

export function SessionFormDialog({ open, onOpenChange, session, initialStart, onSaved }: SessionFormDialogProps) {
  const options = useQuery({ ...sessionFormOptionsQuery(), enabled: open })

  function handleSaved(saved: SessionWithDetails) {
    onOpenChange(false)
    onSaved?.(saved)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={session ? 'Editar clase' : 'Nueva clase'}
      description={session ? 'Cambia profesor, salón, horario o cupo.' : 'Crea una clase única, grupal o personalizada.'}
    >
      <AsyncContent isLoading={options.isLoading} error={options.error} onRetry={() => void options.refetch()}>
        {options.data && (
          <SessionForm
            options={options.data}
            defaults={buildDefaults(session, initialStart)}
            session={session}
            onSaved={handleSaved}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </AsyncContent>
    </Dialog>
  )
}
