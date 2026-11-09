import { cn } from '@/lib/cn'

const sizes = { sm: 'size-4 border-2', md: 'size-6 border-2', lg: 'size-10 border-[3px]' } as const

interface SpinnerProps {
  size?: keyof typeof sizes
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label = 'Cargando', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-block animate-spin rounded-full border-current border-t-transparent', sizes[size], className)}
    />
  )
}
