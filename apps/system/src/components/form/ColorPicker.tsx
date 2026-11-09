import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from '@/components/ui'

/** Paleta pensada para verse viva sobre fondo oscuro. */
const COLOR_PALETTE = [
  '#ff2e7e',
  '#f43f5e',
  '#ff6a00',
  '#ffd400',
  '#84cc16',
  '#39ff88',
  '#14b8a6',
  '#00e5ff',
  '#3b82f6',
  '#a855f7',
  '#e879f9',
  '#f5f5f4',
] as const

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export function ColorPicker({ value, onChange, id, ...aria }: ColorPickerProps) {
  const normalized = value.toLowerCase()
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Paleta de colores" className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((color) => {
          const selected = normalized === color
          return (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              aria-pressed={selected}
              onClick={() => onChange(color)}
              style={{ backgroundColor: color, color }}
              className={cn(
                'relative flex size-11 items-center justify-center rounded-full border-2 transition-transform active:scale-95',
                selected ? 'scale-110 border-white shadow-[0_0_0_3px_var(--color-surface),0_0_18px_2px_currentColor]' : 'border-transparent hover:scale-105',
              )}
            >
              {selected && <Check className="size-5 text-black/80" strokeWidth={3} aria-hidden />}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label="Elegir color personalizado"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ff2e7e'}
          onChange={(event) => onChange(event.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-full border border-line-strong bg-surface-2 p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#ff2e7e"
          maxLength={7}
          spellCheck={false}
          className="font-mono uppercase"
          {...aria}
        />
      </div>
    </div>
  )
}
