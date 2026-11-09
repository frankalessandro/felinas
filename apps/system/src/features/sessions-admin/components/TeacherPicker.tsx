import { Users } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'

interface TeacherOption {
  id: string
  full_name: string
}

interface TeacherPickerProps {
  teachers: TeacherOption[]
  /** `undefined` = todos. */
  value: string | undefined
  onChange: (teacherId: string | undefined) => void
}

const tileBase = 'group flex min-h-11 w-16 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 transition active:scale-95'

function ringClass(selected: boolean): string {
  return cn(
    'rounded-full p-0.5 ring-2 ring-offset-2 ring-offset-bg transition',
    selected ? 'ring-rosa shadow-glow' : 'ring-transparent group-hover:ring-line-strong',
  )
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

/** Profes como rostros seleccionables: se reconocen más rápido que un nombre en una pestaña. */
export function TeacherPicker({ teachers, value, onChange }: TeacherPickerProps) {
  return (
    <div role="group" aria-label="Filtrar por profe" className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-3 py-1 sm:mx-0 sm:px-0">
      <button type="button" aria-pressed={value === undefined} onClick={() => onChange(undefined)} className={tileBase}>
        <span className={ringClass(value === undefined)}>
          <span className="grid size-10 place-items-center rounded-full bg-surface-3 text-fg-muted">
            <Users className="size-5" aria-hidden />
          </span>
        </span>
        <span className={cn('max-w-full truncate text-[11px] font-semibold', value === undefined ? 'text-fg' : 'text-fg-muted')}>Todos</span>
      </button>
      {teachers.map((teacher) => {
        const selected = value === teacher.id
        return (
          <button
            key={teacher.id}
            type="button"
            aria-pressed={selected}
            aria-label={teacher.full_name}
            onClick={() => onChange(selected ? undefined : teacher.id)}
            className={tileBase}
          >
            <span className={ringClass(selected)}>
              <Avatar name={teacher.full_name} size="md" className={cn(!selected && 'opacity-80 group-hover:opacity-100')} />
            </span>
            <span className={cn('max-w-full truncate text-[11px] font-semibold', selected ? 'text-fg' : 'text-fg-muted')}>
              {firstName(teacher.full_name)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
