import type { ComponentProps, ReactNode } from 'react'
import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  label: ReactNode
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <label htmlFor={inputId} className={cn('flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg', className)}>
      <span className="relative inline-flex size-5 shrink-0">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-md border border-line-strong bg-surface-2 transition-colors checked:border-rosa checked:bg-rosa disabled:opacity-50"
          {...props}
        />
        <Check aria-hidden strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 peer-checked:opacity-100" />
      </span>
      {label}
    </label>
  )
}
