import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CalendarDays, ClipboardCheck, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconTile, type Tone } from '@/components/brand'
import { getTodayKey } from '@/features/attendance/day'

const TILE_CLASS =
  'group flex min-h-20 items-center gap-4 rounded-2xl border border-line bg-surface/80 p-4 shadow-card transition-[border-color,transform] hover:border-rosa/50 active:scale-[.99] motion-reduce:transition-none'

interface TileBodyProps {
  icon: LucideIcon
  tone: Tone
  title: string
  hint: string
}

function TileBody({ icon, tone, title, hint }: TileBodyProps) {
  return (
    <>
      <IconTile icon={icon} tone={tone} size="lg" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-bold leading-tight">{title}</span>
        <span className="mt-0.5 block text-xs text-fg-muted">{hint}</span>
      </span>
      <ArrowUpRight className="size-5 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rosa-hover motion-reduce:transition-none" aria-hidden />
    </>
  )
}

export function QuickLinks() {
  return (
    <nav aria-label="Accesos rápidos" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link to="/admin/subscriptions" className={TILE_CLASS}>
        <TileBody icon={Wallet} tone="ambar" title="Membresías" hint="Renovar, cobrar y organizar el mes" />
      </Link>
      <Link to="/admin/agenda" className={TILE_CLASS}>
        <TileBody icon={CalendarDays} tone="violeta" title="Agenda" hint="Programar y ajustar clases" />
      </Link>
      <Link to="/admin/attendance" search={{ day: getTodayKey() }} className={TILE_CLASS}>
        <TileBody icon={ClipboardCheck} tone="rosa" title="Asistencia" hint="Pasar lista de cualquier día" />
      </Link>
    </nav>
  )
}
