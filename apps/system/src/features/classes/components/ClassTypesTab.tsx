import { useQuery } from '@tanstack/react-query'
import { Archive, MoreVertical, Pencil, Plus, Power } from 'lucide-react'
import { useState } from 'react'
import {
  AsyncContent,
  Badge,
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import { LEVEL_LABELS } from '../constants'
import { useArchiveClassType, useToggleClassType } from '../hooks/useClassMutations'
import { classCategoriesQuery, classTypesQuery } from '../queries'
import type { ClassCategory, ClassType } from '../types'
import { ClassTypeFormDialog } from './ClassTypeFormDialog'
import { ClassStyleIcon } from './ClassStyleIcon'

type DialogState = { kind: 'form'; classType: ClassType | null } | null

interface ClassTypeCardProps {
  classType: ClassType
  category: ClassCategory | undefined
  onEdit: () => void
  onArchive: () => void
}

function ClassTypeCard({ classType, category, onEdit, onArchive }: ClassTypeCardProps) {
  const toggle = useToggleClassType()
  return (
    <article
      style={{ ['--style' as string]: classType.color }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition duration-200',
        'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--style)_55%,var(--color-line))] hover:shadow-[0_18px_40px_-22px_var(--style)] motion-reduce:hover:translate-y-0',
        !classType.active && 'opacity-70 saturate-50',
      )}
    >
      <header
        className="relative isolate flex flex-col gap-3 overflow-hidden p-4 text-white"
        style={{ backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${classType.color} 60%, #12070d), color-mix(in srgb, ${classType.color} 28%, #12070d))` }}
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 14px, #fff 14px 16px, transparent 16px 34px)' }}
        />
        <span aria-hidden className="absolute -right-10 -top-10 -z-10 size-40 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: classType.color }} />
        <div className="flex items-center gap-3 pr-10">
          <ClassStyleIcon name={classType.name} />
          <h3 className="truncate font-display text-xl font-black leading-tight tracking-tight">{classType.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {category && <Badge color={category.color}>{category.name}</Badge>}
          <Badge color={classType.color}>{LEVEL_LABELS[classType.level]}</Badge>
          {!classType.active && <Badge tone="warn">Inactivo</Badge>}
        </div>
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton aria-label={`Acciones de ${classType.name}`} className="text-white hover:bg-white/15">
                <MoreVertical className="size-5" aria-hidden />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="size-4" aria-hidden /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toggle.mutate({ id: classType.id, active: !classType.active })}>
                <Power className="size-4" aria-hidden /> {classType.active ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
              <DropdownMenuItem tone="danger" onSelect={onArchive}>
                <Archive className="size-4" aria-hidden /> Archivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <p className="line-clamp-3 flex-1 p-4 text-sm text-fg-muted">{classType.description ?? 'Sin descripción.'}</p>
    </article>
  )
}

export function ClassTypesTab() {
  const query = useQuery(classTypesQuery())
  const categories = useQuery(classCategoriesQuery())
  const categoryById = new Map((categories.data ?? []).map((category) => [category.id, category]))
  const archive = useArchiveClassType()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [archiving, setArchiving] = useState<ClassType | null>(null)

  const openCreate = () => setDialog({ kind: 'form', classType: null })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">Categorías de clase con su color de identidad.</p>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden /> Nuevo estilo
        </Button>
      </div>

      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => query.refetch()}
        empty={
          <EmptyState
            illustration="search"
            title="Aún no hay estilos"
            description="Crea el primero: Twerk, Hip Hop, Breaking…"
            action={<Button onClick={openCreate}>Crear estilo</Button>}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data?.map((classType) => (
            <ClassTypeCard
              key={classType.id}
              classType={classType}
              category={classType.category_id ? categoryById.get(classType.category_id) : undefined}
              onEdit={() => setDialog({ kind: 'form', classType })}
              onArchive={() => setArchiving(classType)}
            />
          ))}
        </div>
      </AsyncContent>

      {dialog && <ClassTypeFormDialog classType={dialog.classType} onClose={() => setDialog(null)} />}
      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && setArchiving(null)}
        title={`¿Archivar «${archiving?.name ?? ''}»?`}
        description="Dejará de aparecer en listas y planes nuevos. Las clases y reservas pasadas se conservan."
        confirmLabel="Archivar"
        tone="danger"
        onConfirm={() => (archiving ? archive.mutateAsync(archiving.id).then(() => undefined, () => undefined) : undefined)}
      />
    </div>
  )
}
