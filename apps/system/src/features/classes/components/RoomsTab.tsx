import { useQuery } from '@tanstack/react-query'
import { DoorOpen, Pencil, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { IconTile } from '@/components/brand'
import { AsyncContent, Button, EmptyState, IconButton, Switch } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useToggleRoom } from '../hooks/useClassMutations'
import { roomsQuery } from '../queries'
import type { Room } from '../types'
import { RoomFormDialog } from './RoomFormDialog'

function RoomCard({ room, onEdit }: { room: Room; onEdit: () => void }) {
  const toggle = useToggleRoom()
  return (
    <div className={cn('flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card', !room.active && 'opacity-60')}>
      <IconTile icon={DoorOpen} tone="violeta" size="lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate font-display text-base font-bold">{room.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-fg-muted">
          <Users className="size-4" aria-hidden /> Capacidad {room.capacity}
          {!room.active && <span className="text-[11px] font-semibold text-warn">Inactivo</span>}
        </p>
      </div>
      <IconButton aria-label={`Editar ${room.name}`} onClick={onEdit}>
        <Pencil className="size-5" aria-hidden />
      </IconButton>
      <Switch
        aria-label={room.active ? `Desactivar ${room.name}` : `Activar ${room.name}`}
        checked={room.active}
        disabled={toggle.isPending}
        onCheckedChange={(active) => toggle.mutate({ id: room.id, active })}
      />
    </div>
  )
}

export function RoomsTab() {
  const query = useQuery(roomsQuery())
  const [editing, setEditing] = useState<{ room: Room | null } | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">Espacios donde se dictan las clases.</p>
        <Button onClick={() => setEditing({ room: null })}>
          <Plus className="size-4" aria-hidden /> Nuevo salón
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
            title="Sin salones"
            description="Agrega los salones de la academia con su capacidad."
            action={<Button onClick={() => setEditing({ room: null })}>Crear salón</Button>}
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {query.data?.map((room) => (
            <RoomCard key={room.id} room={room} onEdit={() => setEditing({ room })} />
          ))}
        </div>
      </AsyncContent>

      {editing && <RoomFormDialog room={editing.room} onClose={() => setEditing(null)} />}
    </div>
  )
}
