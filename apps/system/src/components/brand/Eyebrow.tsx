import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  className?: string
  tone?: 'rosa' | 'dorado' | 'muted'
}

const toneClass = {
  rosa: 'text-rosa-hover',
  dorado: 'text-ambar',
  muted: 'text-fg-muted',
} as const

/** Antetítulo pequeño sobre títulos y secciones. */
export function Eyebrow({ children, className, tone = 'rosa' }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase leading-tight tracking-[0.14em]',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </p>
  )
}
