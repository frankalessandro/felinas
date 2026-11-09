import { Link } from '@tanstack/react-router'
import { ChevronRight, UserCheck } from 'lucide-react'
import { IconTile } from '@/components/brand'

/** Aviso de cuentas nuevas por aprobar. No aparece si no hay ninguna. */
export function PendingApprovals({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <Link
      to="/admin/users"
      className="group flex min-h-14 items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 transition-colors hover:border-warn/60 active:scale-[.995]"
    >
      <IconTile icon={UserCheck} tone="warn" size="sm" />
      <span className="min-w-0 flex-1 text-sm">
        <span className="font-semibold text-fg">{count === 1 ? '1 cuenta espera aprobación' : `${count} cuentas esperan aprobación`}</span>
        <span className="block text-xs text-fg-muted">Asígnales rol y plan para que puedan reservar.</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-warn transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
    </Link>
  )
}
