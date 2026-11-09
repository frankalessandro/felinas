import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/brand/IconTile'
import { Illustration, type IllustrationName } from '@/components/illustrations/Illustration'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  /** Ilustración SVG de marca; si se pasa, reemplaza al icono. */
  illustration?: IllustrationName
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-10 text-center', className)}>
      {illustration ? <Illustration name={illustration} /> : icon && <IconTile icon={icon} tone="rosa" size="lg" />}
      <h3 className="font-display text-base font-bold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
