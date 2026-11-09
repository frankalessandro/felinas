import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type Tone = 'rosa' | 'violeta' | 'ambar' | 'cian' | 'ok' | 'warn' | 'danger' | 'neutral'

const toneTile: Record<Tone, string> = {
  rosa: 'bg-rosa-soft text-rosa-hover ring-rosa/20',
  violeta: 'bg-violeta-soft text-violeta ring-violeta/20',
  ambar: 'bg-ambar-soft text-ambar ring-ambar/20',
  cian: 'bg-cian-soft text-cian ring-cian/20',
  ok: 'bg-ok-soft text-ok ring-ok/20',
  warn: 'bg-warn-soft text-warn ring-warn/20',
  danger: 'bg-danger-soft text-danger ring-danger/20',
  neutral: 'bg-surface-3 text-fg-muted ring-line-strong/60',
}

const sizes = {
  sm: 'size-8 rounded-lg [&_svg]:size-4',
  md: 'size-10 rounded-xl [&_svg]:size-5',
  lg: 'size-12 rounded-2xl [&_svg]:size-6',
} as const

interface IconTileProps {
  icon: LucideIcon
  tone?: Tone
  size?: keyof typeof sizes
  className?: string
}

/** Icono dentro de un contenedor tintado: la forma estándar de acompañar datos y secciones. */
export function IconTile({ icon: Icon, tone = 'rosa', size = 'md', className }: IconTileProps) {
  return (
    <span aria-hidden className={cn('grid shrink-0 place-items-center ring-1 ring-inset', toneTile[tone], sizes[size], className)}>
      <Icon strokeWidth={2} />
    </span>
  )
}
