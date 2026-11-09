import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface SwitchProps extends Omit<ComponentProps<'button'>, 'onChange' | 'role'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-50',
        checked ? 'border-rosa bg-rosa' : 'border-line-strong bg-surface-3',
        className,
      )}
      {...props}
    >
      {/* Área táctil ampliada sin alterar el tamaño visual. */}
      <span aria-hidden className="absolute -inset-2" />
      <span
        aria-hidden
        className={cn('size-5 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-[1.35rem]' : 'translate-x-1')}
      />
    </button>
  )
}
