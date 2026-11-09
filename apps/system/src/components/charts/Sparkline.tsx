import { useId } from 'react'

interface SparklineProps {
  values: number[]
  /** Color CSS del trazo (ej. `var(--color-rosa)`). */
  color?: string
  /** Descripción accesible, ej. "Ingresos de los últimos 6 meses, en alza". */
  label: string
  className?: string
}

const WIDTH = 100
const HEIGHT = 32
const PADDING = 2

function toPoints(values: number[]): [number, number][] {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0
  return values.map((value, index) => [index * step, HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2)])
}

/** Línea de tendencia mínima con relleno degradado. Escala al ancho del contenedor. */
export function Sparkline({ values, color = 'var(--color-rosa)', label, className }: SparklineProps) {
  const gradientId = useId()
  if (values.length < 2) return null
  const points = toPoints(values)
  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const last = points[points.length - 1] ?? [0, 0]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={label} className={className ?? 'h-full w-full overflow-visible'}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
