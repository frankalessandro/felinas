import { useQuery } from '@tanstack/react-query'
import { Cake } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { monthBirthdaysQuery } from '../queries'
import { BirthdayList } from './BirthdayList'

/** Tarjeta ámbar: el ámbar es de los eventos y las celebraciones. */
export function BirthdaysCard() {
  const query = useQuery(monthBirthdaysQuery())
  const count = query.data?.length
  return (
    <section
      aria-labelledby="month-birthdays"
      className="relative isolate overflow-hidden rounded-2xl border border-ambar/25 bg-surface/80 p-5 shadow-card"
    >
      <span aria-hidden className="pointer-events-none absolute -right-12 -top-16 -z-10 size-48 rounded-full bg-ambar/15 blur-3xl" />
      <header className="mb-4 flex items-center gap-3">
        <IconTile icon={Cake} tone="ambar" />
        <div className="min-w-0 flex-1">
          <h2 id="month-birthdays" className="font-display text-base font-bold leading-tight">
            Felinas que cumplen este mes
          </h2>
          <p className="text-xs text-fg-muted">Una felicitación a tiempo fideliza.</p>
        </div>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-ambar-soft px-2.5 py-1 text-xs font-bold tabular-nums text-ambar">{count}</span>
        )}
      </header>
      <BirthdayList
        birthdays={query.data}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    </section>
  )
}
