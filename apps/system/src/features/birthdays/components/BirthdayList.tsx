import { PartyPopper } from 'lucide-react'
import { AsyncContent, EmptyState } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { cn } from '@/lib/cn'
import { formatters, fromDateKey } from '@/lib/dates'
import { birthdayMessage, describeDaysUntil, isBirthdayToday } from '../lib'
import type { MonthBirthday } from '../types'

interface BirthdayListProps {
  birthdays: MonthBirthday[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

/** Chispas discretas: solo se animan si la persona no pidió menos movimiento. */
function Confetti() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <span className="absolute -top-1 left-[12%] size-1.5 rounded-full bg-ambar motion-safe:animate-pulse" />
      <span className="absolute right-[18%] top-2 size-1 rounded-full bg-rosa-hover motion-safe:animate-pulse [animation-delay:400ms]" />
      <span className="absolute bottom-1 left-[45%] size-1 rounded-full bg-ambar/70 motion-safe:animate-pulse [animation-delay:800ms]" />
      <span className="absolute bottom-2 right-[6%] size-1.5 rounded-full bg-rosa motion-safe:animate-pulse [animation-delay:200ms]" />
    </span>
  )
}

function BirthdayRow({ birthday }: { birthday: MonthBirthday }) {
  const name = birthday.full_name ?? 'Felina'
  const today = isBirthdayToday(birthday)
  const date = fromDateKey(birthday.birthday_date)
  return (
    <li
      className={cn(
        'relative flex items-center gap-3 rounded-xl p-2.5',
        today ? 'border border-ambar/40 bg-ambar-soft' : 'bg-surface-2/60',
      )}
    >
      {today && <Confetti />}
      <div
        aria-hidden
        className={cn(
          'flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border font-display leading-none',
          today ? 'border-ambar bg-ambar text-bg' : 'border-line-strong text-fg-muted',
        )}
      >
        <span className="text-base font-bold tabular-nums">{formatters.dayNumber(date)}</span>
        <span className="text-[10px] font-semibold uppercase">{formatters.dayMonth(date).split(' de ')[1]?.slice(0, 3)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
          {today && <PartyPopper className="size-4 shrink-0 text-ambar" aria-hidden />}
          <span className="truncate">{name}</span>
        </p>
        <p className="text-xs text-fg-muted">
          {describeDaysUntil(birthday.days_until)}
          {birthday.role === 'teacher' && ' · Profe'}
        </p>
      </div>
      <WhatsAppButton phone={birthday.phone} name={name} message={birthdayMessage(birthday.full_name)} label="Felicitar" size="icon" />
    </li>
  )
}

export function BirthdayList({ birthdays, isLoading, error, onRetry }: BirthdayListProps) {
  return (
    <AsyncContent
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!birthdays || birthdays.length === 0}
      empty={<EmptyState illustration="calendar" title="Nadie este mes" description="Ninguna felina cumple años este mes." className="py-7" />}
    >
      <ul className="flex flex-col gap-2">
        {birthdays?.map((birthday) => (
          <BirthdayRow key={birthday.profile_id} birthday={birthday} />
        ))}
      </ul>
    </AsyncContent>
  )
}
