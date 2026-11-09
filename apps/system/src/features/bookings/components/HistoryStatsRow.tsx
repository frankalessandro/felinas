import { CalendarCheck, Flame, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/ui'
import type { HistoryStats } from '../history'

export function HistoryStatsRow({ stats }: { stats: HistoryStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard
        icon={CalendarCheck}
        tone="rosa"
        label="Asistidas este mes"
        value={stats.attendedThisMonth}
      />
      <StatCard
        icon={Flame}
        tone="dorado"
        label={stats.weeklyStreak === 1 ? 'Semana de racha' : 'Semanas de racha'}
        value={stats.weeklyStreak > 0 ? stats.weeklyStreak : '—'}
      />
      <StatCard
        icon={Sparkles}
        tone="violeta"
        label="Tu estilo favorito"
        value={stats.favoriteStyle ?? '—'}
        className="col-span-2 sm:col-span-1 [&_p.font-display]:truncate [&_p.font-display]:text-2xl"
      />
    </div>
  )
}
