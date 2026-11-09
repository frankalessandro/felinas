import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { groupBySection, NAV_SECTION_LABEL, type NavItem } from '../navigation'
import { NavLinkItem } from './NavLinkItem'
import { SignOutButton, UserBadge } from './UserBadge'

/** Menú móvil completo: panel lateral con todas las secciones del rol. */
export function FullMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const groups = groupBySection(items)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="Abrir menú"
        className="grid size-11 place-items-center rounded-xl text-fg-muted transition hover:bg-surface-2 hover:text-fg"
      >
        <Menu className="size-5" aria-hidden />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-[70] flex w-[min(20rem,86vw)] flex-col border-l border-line bg-surface pb-[max(1rem,env(safe-area-inset-bottom))] shadow-card data-[state=open]:animate-fade-up">
          <div className="flex items-center justify-between gap-3 border-b border-line p-4">
            <DialogPrimitive.Title className="sr-only">Menú</DialogPrimitive.Title>
            <UserBadge />
            <DialogPrimitive.Close
              aria-label="Cerrar menú"
              className="grid size-11 shrink-0 place-items-center rounded-xl text-fg-muted hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Menú completo" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
            {groups.map((group) => (
              <div key={group.section} className="flex flex-col gap-1">
                {groups.length > 1 && (
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                    {NAV_SECTION_LABEL[group.section]}
                  </p>
                )}
                {group.items.map((item) => (
                  <NavLinkItem key={item.to} item={item} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            ))}
          </nav>
          <SignOutButton className="mx-3" />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
