import { useId } from 'react'
import { Switch } from '@/components/ui'

interface SwitchFieldProps {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** Fila con etiqueta + interruptor para valores booleanos de formularios. */
export function SwitchField({ label, description, checked, onCheckedChange }: SwitchFieldProps) {
  const uid = useId()
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 rounded-2xl border-2 border-line bg-surface-2 px-4 py-2.5 transition-colors has-[[data-state=checked]]:border-rosa/60 has-[[data-state=checked]]:bg-rosa-soft">
      <div className="flex flex-col">
        <span id={`${uid}-label`} className="font-display text-sm font-extrabold text-fg">
          {label}
        </span>
        {description && <span className="text-xs text-fg-muted">{description}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={`${uid}-label`} />
    </div>
  )
}
