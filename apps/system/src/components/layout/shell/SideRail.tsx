import { Link } from '@tanstack/react-router'
import { Logo } from '../Logo'
import { groupBySection, NAV_SECTION_LABEL, type NavItem } from '../navigation'
import { NavLinkItem } from './NavLinkItem'
import { SignOutButton, UserBadge } from './UserBadge'

/** Barra lateral de escritorio: navegación agrupada por sección, con iconos. */
export function SideRail({ items }: { items: NavItem[] }) {
  const groups = groupBySection(items)
  const showSectionLabels = groups.length > 1

  return (
    <aside className="sticky top-0 z-20 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link to="/" aria-label="Inicio">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Principal" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.section} className="flex flex-col gap-1">
            {showSectionLabels && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                {NAV_SECTION_LABEL[group.section]}
              </p>
            )}
            {group.items.map((item) => (
              <NavLinkItem key={item.to} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="m-3 flex flex-col gap-1 rounded-2xl border border-line bg-surface-2/70 p-3">
        <UserBadge />
        <SignOutButton className="mt-1" />
      </div>
    </aside>
  )
}
