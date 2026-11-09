import { Link } from '@tanstack/react-router'
import type { NavItem } from '../navigation'

/** Ítem de navegación con icono; el activo lleva indicador rosa y fondo elevado. */
export function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.exact ?? false }}
      className="group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg data-[status=active]:bg-surface-3 data-[status=active]:font-semibold data-[status=active]:text-fg"
    >
      <span
        aria-hidden
        className="absolute inset-y-2.5 -left-3 w-1 rounded-r-full bg-rosa opacity-0 transition-opacity group-data-[status=active]:opacity-100"
      />
      <Icon className="size-[18px] shrink-0 transition-colors group-data-[status=active]:text-rosa-hover" aria-hidden />
      {item.label}
    </Link>
  )
}
