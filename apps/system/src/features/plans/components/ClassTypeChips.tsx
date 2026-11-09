import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ClassType } from '@/features/classes/types'

interface ClassTypeChipsProps {
  classTypes: ClassType[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  id?: string
  'aria-describedby'?: string
}

/** Multi-selección de estilos como chips tintados con el color de cada estilo. */
export function ClassTypeChips({ classTypes, selectedIds, onChange, id, ...aria }: ClassTypeChipsProps) {
  function toggle(classTypeId: string) {
    onChange(selectedIds.includes(classTypeId) ? selectedIds.filter((current) => current !== classTypeId) : [...selectedIds, classTypeId])
  }

  return (
    <div id={id} role="group" aria-label="Estilos permitidos" className="flex flex-wrap gap-2" {...aria}>
      {classTypes.map((classType) => {
        const selected = selectedIds.includes(classType.id)
        return (
          <button
            key={classType.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(classType.id)}
            style={selected ? { borderColor: classType.color, backgroundColor: `color-mix(in srgb, ${classType.color} 22%, transparent)` } : undefined}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors active:scale-[.98]',
              selected ? 'text-fg' : 'border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            <span aria-hidden className="flex size-4 items-center justify-center rounded-full" style={{ backgroundColor: classType.color }}>
              {selected && <Check className="size-3 text-black/80" strokeWidth={4} />}
            </span>
            {classType.name}
          </button>
        )
      })}
    </div>
  )
}
