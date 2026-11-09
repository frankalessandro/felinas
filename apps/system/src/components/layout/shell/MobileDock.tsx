import { Link } from '@tanstack/react-router'
import { getDockItems, type NavItem } from '../navigation'

function DockLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <li className="flex-1">
      <Link
        to={item.to}
        activeOptions={{ exact: item.exact ?? false }}
        className="group flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-fg-subtle transition-colors data-[status=active]:font-semibold data-[status=active]:text-fg"
      >
        <Icon className="size-5 transition-transform group-data-[status=active]:text-rosa-hover" aria-hidden />
        <span>{item.label}</span>
      </Link>
    </li>
  )
}

/**
 * Dock flotante de móvil: píldora de vidrio con la acción estrella del rol elevada al centro
 * (Reservar para la alumna, Asistencia para el admin, Mi agenda para el profe).
 */
export function MobileDock({ items }: { items: NavItem[] }) {
  const { left, primary, right } = getDockItems(items)
  const PrimaryIcon = primary?.icon

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center rounded-2xl border border-line bg-surface/90 px-2 shadow-[0_16px_40px_-12px_#000] backdrop-blur-xl">
        {left.map((item) => (
          <DockLink key={item.to} item={item} />
        ))}
        {primary && PrimaryIcon && (
          <li className="flex-1">
            <Link
              to={primary.to}
              activeOptions={{ exact: primary.exact ?? false }}
              aria-label={primary.label}
              className="group mx-auto -mt-6 grid size-14 place-items-center rounded-2xl bg-gradient-felinas text-white shadow-[0_10px_24px_-8px_#ea1a62] ring-4 ring-bg transition-transform active:scale-95"
            >
              <PrimaryIcon className="size-6" aria-hidden />
            </Link>
          </li>
        )}
        {right.map((item) => (
          <DockLink key={item.to} item={item} />
        ))}
      </ul>
    </nav>
  )
}
