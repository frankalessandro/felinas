import { SwitchField } from '@/components/form/SwitchField'
import { Button, Dialog, Field, Input } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { useSaveRoom } from '../hooks/useClassMutations'
import { roomFormSchema } from '../schemas'
import type { RoomFormValues } from '../schemas'
import type { Room } from '../types'

interface RoomFormDialogProps {
  room: Room | null
  onClose: () => void
}

const FORM_ID = 'room-form'

function toFormValues(room: Room | null): RoomFormValues {
  return { name: room?.name ?? '', capacity: room ? String(room.capacity) : '', active: room?.active ?? true }
}

export function RoomFormDialog({ room, onClose }: RoomFormDialogProps) {
  const mutation = useSaveRoom(room?.id)
  const form = useZodForm(roomFormSchema, toFormValues(room))
  const { values, errors, setValue } = form

  const save = form.submit((data) => mutation.mutateAsync(data).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={room ? 'Editar salón' : 'Nuevo salón'}
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
        <Field label="Nombre" error={errors.name} required>
          <Input value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder="Ej. Salón principal" maxLength={60} />
        </Field>
        <Field label="Capacidad" error={errors.capacity} required>
          <Input inputMode="numeric" value={values.capacity} onChange={(e) => setValue('capacity', e.target.value)} placeholder="20" />
        </Field>
        <SwitchField label="Activo" checked={values.active} onCheckedChange={(active) => setValue('active', active)} />
      </form>
    </Dialog>
  )
}
