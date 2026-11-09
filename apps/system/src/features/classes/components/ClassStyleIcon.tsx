import type { LucideIcon } from 'lucide-react'
import { Flame, Headphones, Flower2, PawPrint, RefreshCw, Star } from 'lucide-react'

/** Primer patrón que coincide gana; los estilos nuevos que creen caen en la garra de la marca. */
const ICON_BY_KEYWORD: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /personaliz/i, icon: Star },
  { pattern: /twerk/i, icon: Flame },
  { pattern: /hip\s?hop/i, icon: Headphones },
  { pattern: /break/i, icon: RefreshCw },
  { pattern: /flex|yoga|gimnas/i, icon: Flower2 },
]

export function getClassStyleIcon(name: string): LucideIcon {
  return ICON_BY_KEYWORD.find((entry) => entry.pattern.test(name))?.icon ?? PawPrint
}

/** Icono SVG del estilo, en una baldosa de vidrio para acompañar el título. */
export function ClassStyleIcon({ name }: { name: string }) {
  const Icon = getClassStyleIcon(name)
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
      <Icon className="size-5" strokeWidth={2.25} />
    </span>
  )
}
