import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile, type Tone } from '@/components/brand/IconTile'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title: string
  eyebrow?: string
  /** Palabra final con el degradado de marca (ej. title="Hola," accent="Mae"). Úsalo con moderación. */
  accent?: string
  description?: string
  actions?: ReactNode
  icon?: LucideIcon
  iconTone?: Tone
  /** @deprecated Ya no se pintan palabras de fondo; se ignora. */
  ghost?: string | false
  className?: string
}

export function PageHeader({ title, eyebrow, accent, description, actions, icon, iconTone = 'rosa', className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-4">
        {icon && <IconTile icon={icon} tone={iconTone} size="lg" className="mt-0.5 hidden sm:grid" />}
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rosa-hover">{eyebrow}</p>}
          <h1 className="animate-fade-up font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[1.875rem]">
            {title}
            {accent && <span className="ml-2 text-gradient-felinas">{accent}</span>}
          </h1>
          {description && <p className="max-w-2xl text-sm text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
