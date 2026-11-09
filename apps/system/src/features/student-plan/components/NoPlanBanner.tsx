import { TicketX } from 'lucide-react'
import { IconTile } from '@/components/brand'

interface NoPlanBannerProps {
  /** Texto corto de lo que no puede hacer sin plan. */
  consequence?: string
}

export function NoPlanBanner({ consequence = 'Sin un plan activo no puedes reservar clases.' }: NoPlanBannerProps) {
  return (
    <div role="status" className="flex items-center gap-4 rounded-2xl border border-warn/30 bg-warn-soft p-4">
      <IconTile icon={TicketX} tone="warn" />
      <div className="flex flex-col gap-0.5">
        <p className="font-display text-sm font-bold text-warn">Aún no tienes un plan activo</p>
        <p className="text-sm text-fg-muted">{consequence} Habla con la academia para que te asignen un plan.</p>
      </div>
    </div>
  )
}
