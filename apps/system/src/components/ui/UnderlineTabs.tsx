import { Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface UnderlineTabOption {
  /** `undefined` = "todas". */
  id: string | undefined
  label: string
  /** Hex del estilo: punto y línea activa. Sin él usa el rosa de marca. */
  color?: string
  /** Fuera del plan: atenuada y con candado. */
  locked?: boolean
}

interface UnderlineTabsProps {
  label: string
  options: UnderlineTabOption[]
  value: string | undefined
  onChange: (id: string | undefined) => void
  className?: string
}

const tabBase =
  'relative inline-flex min-h-11 shrink-0 items-center gap-2 px-3 font-display text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--tab)] after:transition-transform motion-reduce:after:transition-none aria-pressed:after:scale-x-100'

/** Filtro como pestañas con línea de color: una sola lectura horizontal, sin píldoras que compitan con la agenda. */
export function UnderlineTabs({ label, options, value, onChange, className }: UnderlineTabsProps) {
  return (
    <div role="group" aria-label={label} className={cn('hide-scrollbar -mx-4 flex overflow-x-auto border-b border-line px-1 sm:mx-0 sm:px-0', className)}>
      {options.map((option) => {
        const selected = option.id === value
        return (
          <button
            key={option.id ?? 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? undefined : option.id)}
            style={{ ['--tab' as string]: option.color ?? 'var(--color-rosa)' }}
            className={cn(tabBase, selected ? 'text-fg' : 'text-fg-muted hover:text-fg', option.locked && !selected && 'opacity-55')}
          >
            {option.color && <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: option.color }} />}
            {option.label}
            {option.locked && <Lock className="size-3 text-fg-subtle" aria-label="No incluido en tu plan" />}
          </button>
        )
      })}
    </div>
  )
}
