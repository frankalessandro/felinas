import { Check, ShieldCheck, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { AttendanceStatus } from '../types'

interface StatusOption {
  value: AttendanceStatus
  label: string
  icon: LucideIcon
  active: string
  idle: string
}

const OPTIONS: StatusOption[] = [
  { value: 'present', label: 'Asistió', icon: Check, active: 'border-ok bg-ok text-bg shadow-[0_0_20px_-4px_var(--color-ok)]', idle: 'hover:border-ok hover:text-ok' },
  { value: 'absent', label: 'Faltó', icon: X, active: 'border-danger bg-danger text-bg shadow-[0_0_20px_-4px_var(--color-danger)]', idle: 'hover:border-danger hover:text-danger' },
  { value: 'excused', label: 'Justificada', icon: ShieldCheck, active: 'border-warn bg-warn text-bg shadow-[0_0_20px_-4px_var(--color-warn)]', idle: 'hover:border-warn hover:text-warn' },
]

interface AttendanceButtonsProps {
  studentName: string
  value: AttendanceStatus | null
  onChange: (status: AttendanceStatus) => void
  disabled?: boolean
}

/** Tres píldoras grandes: una marca = un toque. */
export function AttendanceButtons({ studentName, value, onChange, disabled }: AttendanceButtonsProps) {
  return (
    <div role="radiogroup" aria-label={`Asistencia de ${studentName}`} className="grid grid-cols-3 gap-1.5 rounded-2xl bg-bg/50 p-1.5">
      {OPTIONS.map(({ value: option, label, icon: Icon, active, idle }) => {
        const selected = value === option
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(option)}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 font-display text-xs font-bold transition-[transform,background-color,color,box-shadow] active:scale-95 disabled:opacity-50 sm:flex-row sm:gap-1.5 sm:text-sm',
              selected ? active : cn('border-line bg-surface-2 text-fg-muted', idle),
            )}
          >
            <Icon className="size-5 shrink-0 sm:size-4" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
