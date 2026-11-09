import { cn } from '@/lib/cn'

export interface ColumnDatum {
  key: string
  label: string
  value: number
  /** Texto del valor para tooltip y lectura (ej. "$1.250.000" o "82%"). */
  display: string
  /** Resalta la columna (ej. el mes actual). */
  highlight?: boolean
}

interface ColumnChartProps {
  data: ColumnDatum[]
  /** Descripción para lectores de pantalla (la tabla oculta repite los datos). */
  label: string
  color?: string
  height?: number
  className?: string
}

/**
 * Columnas verticales con eje de etiquetas. Hecho con divs (no SVG) para que el texto sea real
 * y escale bien; incluye una tabla oculta como alternativa accesible.
 */
export function ColumnChart({ data, label, color = 'var(--color-rosa)', height = 160, className }: ColumnChartProps) {
  const max = Math.max(...data.map((datum) => datum.value), 1)
  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      <div aria-hidden className="flex items-end gap-2 border-b border-line" style={{ height }}>
        {data.map((datum) => (
          <div key={datum.key} className="group relative flex h-full flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">
              {datum.display}
            </span>
            <div
              className="w-full rounded-t-lg transition-[height,opacity] duration-500 group-hover:opacity-100"
              style={{
                height: `${Math.max((datum.value / max) * 100, datum.value > 0 ? 3 : 0)}%`,
                background: datum.highlight ? color : `color-mix(in srgb, ${color} 40%, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="flex gap-2">
        {data.map((datum) => (
          <span key={datum.key} className={cn('flex-1 truncate text-center text-[11px] text-fg-subtle', datum.highlight && 'font-semibold text-fg')}>
            {datum.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.key}>
              <th scope="row">{datum.label}</th>
              <td>{datum.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
