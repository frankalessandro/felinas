import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/brand'
import type { Tone } from '@/components/brand'
import { cn } from '@/lib/cn'

interface ReportPanelProps {
  title: string
  description?: string
  icon: LucideIcon
  tone?: Tone
  children: ReactNode
  className?: string
}

/** Marco común de los bloques de Reportes: icono, título, descripción corta y contenido. */
export function ReportPanel({ title, description, icon, tone = 'rosa', children, className }: ReportPanelProps) {
  return (
    <section aria-label={title} className={cn('flex flex-col gap-5 rounded-2xl border border-line bg-surface/80 p-5 shadow-card', className)}>
      <header className="flex items-start gap-3">
        <IconTile icon={icon} tone={tone} size="sm" className="mt-0.5" />
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold leading-tight">{title}</h3>
          {description && <p className="mt-0.5 max-w-2xl text-xs text-fg-muted sm:text-sm">{description}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}
