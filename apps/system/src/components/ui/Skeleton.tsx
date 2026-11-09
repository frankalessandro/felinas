import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-xl bg-[linear-gradient(90deg,var(--color-surface-2)_25%,var(--color-surface-3)_50%,var(--color-surface-2)_75%)] bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  )
}
