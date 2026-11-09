import { ChevronDown, ScrollText } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import { DATA_POLICY_SECTIONS } from '../policy'

/** Resumen expandible de la política de datos, sin salir de la pantalla. */
export function DataPolicyPanel() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-1 text-sm font-semibold text-rosa-hover underline-offset-4 hover:underline"
      >
        <ScrollText className="size-4" aria-hidden />
        {open ? 'Ocultar política' : 'Leer política de datos'}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <div id={panelId} hidden={!open} className="rounded-2xl border border-line bg-bg/60 p-4">
        <h3 className="font-display text-sm font-bold">Política de tratamiento de datos personales</h3>
        <dl className="mt-3 flex flex-col gap-3">
          {DATA_POLICY_SECTIONS.map((section) => (
            <div key={section.title}>
              <dt className="text-xs font-semibold text-fg-muted">{section.title}</dt>
              <dd className="mt-0.5 text-sm text-fg">{section.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
