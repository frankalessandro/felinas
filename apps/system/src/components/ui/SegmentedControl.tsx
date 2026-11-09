import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  'aria-label'?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  label: string
  className?: string
}

export function SegmentedControl<T extends string>({ options, value, onValueChange, label, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-xl border border-line bg-surface p-1', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option['aria-label']}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'inline-flex min-h-9 min-w-11 items-center justify-center gap-1.5 rounded-lg px-3 font-display text-sm font-bold transition-colors active:scale-[.98]',
              selected ? 'bg-rosa text-white shadow-glow' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
