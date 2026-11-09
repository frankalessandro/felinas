import type { ReactNode } from 'react'

export interface DonutSegment {
  key: string
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  /** Contenido al centro (ej. total). */
  children?: ReactNode
  size?: number
  thickness?: number
  label: string
}

const GAP = 1.5

/** Dona con leyenda: reparto por método de pago, por categoría, etc. */
export function DonutChart({ segments, children, size = 148, thickness = 16, label }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth={thickness} />
          {total > 0 &&
            segments.map((segment) => {
              const length = (segment.value / total) * circumference
              const dash = Math.max(length - GAP, 0)
              const element = (
                <circle
                  key={segment.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={thickness}
                  strokeLinecap="butt"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += length
              return element
            })}
        </svg>
        {children && <div className="absolute inset-0 grid place-items-center text-center">{children}</div>}
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-sm">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: segment.color }} />
            <span className="min-w-0 flex-1 truncate text-fg-muted">{segment.label}</span>
            <span className="font-semibold tabular-nums">{total > 0 ? Math.round((segment.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
