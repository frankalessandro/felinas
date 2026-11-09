import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type IllustrationName = 'calendar' | 'ticket' | 'people' | 'wallet' | 'bell' | 'chart' | 'search' | 'success' | 'dance'

interface IllustrationProps {
  name: IllustrationName
  className?: string
}

/**
 * Ilustraciones duotono de línea (rosa → violeta) para estados vacíos y momentos clave.
 * Todas comparten el mismo lenguaje: halo suave, trazos redondeados y un destello de marca.
 */
export function Illustration({ name, className }: IllustrationProps) {
  const id = useId()
  const stroke = `url(#${id}-stroke)`
  return (
    <svg viewBox="0 0 160 120" aria-hidden className={cn('h-28 w-auto', className)} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-rosa-hover)" />
          <stop offset="100%" stopColor="var(--color-violeta)" />
        </linearGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-rosa)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-rosa)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="62" rx="64" ry="50" fill={`url(#${id}-halo)`} />
      <g stroke={stroke} strokeWidth="3">{SHAPES[name]}</g>
      <Sparkle x={128} y={24} />
      <Sparkle x={30} y={92} small />
    </svg>
  )
}

function Sparkle({ x, y, small = false }: { x: number; y: number; small?: boolean }) {
  const s = small ? 3.5 : 5.5
  return (
    <path
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`}
      fill="var(--color-ambar)"
      opacity={small ? 0.6 : 0.9}
    />
  )
}

const SHAPES: Record<IllustrationName, ReactNode> = {
  calendar: (
    <>
      <rect x="44" y="30" width="72" height="64" rx="12" fill="var(--color-surface-2)" />
      <path d="M44 50h72M62 22v14M98 22v14" />
      <circle cx="64" cy="66" r="3" fill="var(--color-rosa-hover)" stroke="none" />
      <circle cx="80" cy="66" r="3" fill="var(--color-violeta)" stroke="none" opacity="0.7" />
      <circle cx="96" cy="66" r="3" fill="var(--color-violeta)" stroke="none" opacity="0.4" />
      <path d="M58 80h20" opacity="0.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M40 40h80a0 0 0 0 1 0 0v12a8 8 0 0 0 0 16v12H40V68a8 8 0 0 0 0-16Z" fill="var(--color-surface-2)" />
      <path d="M96 42v36" strokeDasharray="4 5" opacity="0.6" />
      <path d="M52 54h30M52 64h20" />
      <path d="M104 58l4 4 6-8" stroke="var(--color-ok)" />
    </>
  ),
  people: (
    <>
      <circle cx="66" cy="50" r="13" fill="var(--color-surface-2)" />
      <path d="M42 90c2-14 12-22 24-22s22 8 24 22" fill="var(--color-surface-2)" />
      <circle cx="100" cy="54" r="10" opacity="0.7" />
      <path d="M90 76c3-2 6-3 10-3 10 0 17 7 19 17" opacity="0.7" />
    </>
  ),
  wallet: (
    <>
      <rect x="40" y="38" width="80" height="54" rx="12" fill="var(--color-surface-2)" />
      <path d="M40 52h64a10 10 0 0 1 10 10v2a10 10 0 0 1-10 10H96" />
      <circle cx="100" cy="63" r="3" fill="var(--color-ambar)" stroke="none" />
      <path d="M54 30l30-8 8 16" opacity="0.6" />
    </>
  ),
  bell: (
    <>
      <path d="M58 76V62a22 22 0 0 1 44 0v14l6 8H52Z" fill="var(--color-surface-2)" />
      <path d="M72 90a8 8 0 0 0 16 0" />
      <path d="M80 34v6" />
    </>
  ),
  chart: (
    <>
      <rect x="40" y="28" width="80" height="66" rx="12" fill="var(--color-surface-2)" />
      <path d="M54 80V66M70 80V56M86 80V62M102 80V46" strokeWidth="6" />
      <path d="M52 50l16-8 16 6 20-12" opacity="0.5" />
    </>
  ),
  search: (
    <>
      <circle cx="72" cy="56" r="22" fill="var(--color-surface-2)" />
      <path d="M88 72l18 18" strokeWidth="5" />
      <path d="M64 56h16" opacity="0.5" />
    </>
  ),
  success: (
    <>
      <circle cx="80" cy="60" r="30" fill="var(--color-surface-2)" />
      <path d="M66 60l10 10 20-22" stroke="var(--color-ok)" strokeWidth="4" />
    </>
  ),
  dance: (
    <>
      {/* Tres zarpazos: el guiño a la marca Pantera. */}
      <path d="M58 30c10 18 10 42-2 62" strokeWidth="6" />
      <path d="M78 26c10 20 10 46-2 68" strokeWidth="6" opacity="0.8" />
      <path d="M98 30c10 18 10 42-2 62" strokeWidth="6" opacity="0.6" />
    </>
  ),
}
