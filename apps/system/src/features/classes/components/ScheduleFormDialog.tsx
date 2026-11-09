import { useQuery } from '@tanstack/react-query'
import { SwitchField } from '@/components/form/SwitchField'
import { Button, Dialog, Field, Input, Select, Textarea } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { teachersQuery } from '@/features/teachers/queries'
import { toDateKey } from '@/lib/dates'
import { toTimeInput } from '@/lib/formFields'
import { NO_ROOM, WEEKDAY_OPTIONS } from '../constants'
import { useSaveSchedule } from '../hooks/useClassMutations'
import { classTypesQuery, roomsQuery } from '../queries'
import { scheduleFormSchema } from '../schemas'
import type { ScheduleFormValues } from '../schemas'
import type { ScheduleWithDetails } from '../types'

interface ScheduleFormDialogProps {
  schedule: ScheduleWithDetails | null
  defaultWeekday?: number
  onClose: () => void
}

const FORM_ID = 'schedule-form'
const DEFAULT_MIN_BOOKINGS = 3

function toFormValues(schedule: ScheduleWithDetails | null, defaultWeekday: number): ScheduleFormValues {
  if (!schedule) {
    return {
      class_type_id: '',
      teacher_id: '',
      room_id: NO_ROOM,
      weekday: String(defaultWeekday),
      start_time: '18:00',
      end_time: '19:00',
      capacity: '',
      min_bookings: String(DEFAULT_MIN_BOOKINGS),
      description: '',
      valid_from: toDateKey(new Date()),
      valid_until: '',
      active: true,
    }
  }
  return {
    class_type_id: schedule.class_type_id,
    teacher_id: schedule.teacher_id,
    room_id: schedule.room_id ?? NO_ROOM,
    weekday: String(schedule.weekday),
    start_time: toTimeInput(schedule.start_time),
    end_time: toTimeInput(schedule.end_time),
    capacity: String(schedule.capacity),
    min_bookings: String(schedule.min_bookings),
    description: schedule.description ?? '',
    valid_from: schedule.valid_from,
    valid_until: schedule.valid_until ?? '',
    active: schedule.active,
  }
}

interface Selectable {
  id: string
  active: boolean
}

/** Solo ofrece elementos activos, pero conserva el actual para no romper la edición. */
function toOptions<T extends Selectable>(items: T[] | undefined, currentId: string, getLabel: (item: T) => string): SelectOption[] {
  return (items ?? []).filter((item) => item.active || item.id === currentId).map((item) => ({ value: item.id, label: getLabel(item) }))
}

export function ScheduleFormDialog({ schedule, defaultWeekday = 1, onClose }: ScheduleFormDialogProps) {
  const mutation = useSaveSchedule(schedule?.id)
  const form = useZodForm(scheduleFormSchema, toFormValues(schedule, defaultWeekday))
  const { values, errors, setValue } = form
  const { data: classTypes } = useQuery(classTypesQuery())
  const { data: teachers } = useQuery(teachersQuery())
  const { data: rooms } = useQuery(roomsQuery())

  const classTypeOptions = toOptions(classTypes, values.class_type_id, (type) => type.name)
  const teacherOptions = toOptions(teachers, values.teacher_id, (teacher) => teacher.full_name)
  const roomOptions: SelectOption[] = [
    { value: NO_ROOM, label: 'Sin salón asignado' },
    ...toOptions(rooms, values.room_id, (room) => `${room.name} (${room.capacity})`),
  ]

  function handleRoomChange(roomId: string) {
    setValue('room_id', roomId)
    const room = rooms?.find((item) => item.id === roomId)
    if (room && values.capacity === '') setValue('capacity', String(room.capacity))
  }

  const save = form.submit((data) => mutation.mutateAsync(data).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={schedule ? 'Editar horario' : 'Nuevo horario'}
      description="Plantilla que se repite cada semana. Las sesiones se generan desde Agenda."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <Field label="Estilo" error={errors.class_type_id} required>
          <Select options={classTypeOptions} value={values.class_type_id} onValueChange={(v) => setValue('class_type_id', v)} placeholder="Elige el estilo" />
        </Field>
        <Field label="Profe" error={errors.teacher_id} required>
          <Select options={teacherOptions} value={values.teacher_id} onValueChange={(v) => setValue('teacher_id', v)} placeholder="Elige la profe" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Día" error={errors.weekday} required>
            <Select options={WEEKDAY_OPTIONS} value={values.weekday} onValueChange={(v) => setValue('weekday', v)} />
          </Field>
          <Field label="Salón" error={errors.room_id}>
            <Select options={roomOptions} value={values.room_id} onValueChange={handleRoomChange} />
          </Field>
          <Field label="Inicia" error={errors.start_time} required>
            <Input type="time" value={values.start_time} onChange={(e) => setValue('start_time', e.target.value)} />
          </Field>
          <Field label="Termina" error={errors.end_time} required>
            <Input type="time" value={values.end_time} onChange={(e) => setValue('end_time', e.target.value)} />
          </Field>
          <Field label="Cupo máximo" error={errors.capacity} required>
            <Input inputMode="numeric" value={values.capacity} onChange={(e) => setValue('capacity', e.target.value)} placeholder="20" />
          </Field>
          <Field label="Mínimo de reservas" error={errors.min_bookings} hint="Si una clase no llega a este mínimo, el tablero la marca para cancelar." required>
            <Input inputMode="numeric" value={values.min_bookings} onChange={(e) => setValue('min_bookings', e.target.value)} placeholder="3" />
          </Field>
        </div>
        <Field label="Descripción" error={errors.description} hint="Opcional. Se muestra a las alumnas al reservar.">
          <Textarea rows={2} value={values.description} onChange={(e) => setValue('description', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vigente desde" error={errors.valid_from} required>
            <Input type="date" value={values.valid_from} onChange={(e) => setValue('valid_from', e.target.value)} />
          </Field>
          <Field label="Vigente hasta" error={errors.valid_until} hint="Vacío = sin fecha de fin.">
            <Input type="date" value={values.valid_until} onChange={(e) => setValue('valid_until', e.target.value)} />
          </Field>
        </div>
        <SwitchField
          label="Activo"
          description="Los horarios pausados no generan sesiones nuevas."
          checked={values.active}
          onCheckedChange={(active) => setValue('active', active)}
        />
      </form>
    </Dialog>
  )
}
