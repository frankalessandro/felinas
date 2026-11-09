export interface BarListItem {
  key: string
  label: string
  value: number
  display: string
  color?: string
}

interface BarListProps {
  items: BarListItem[]
  color?: string
  className?: string
}

/** Ranking horizontal (ocupación por clase, ingresos por plan). El texto es real, la barra decorativa. */
export function BarList({ items, color = 'var(--color-rosa)', className }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className={className ?? 'flex flex-col gap-3'}>
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-fg-muted">{item.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{item.display}</span>
          </div>
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color ?? color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
