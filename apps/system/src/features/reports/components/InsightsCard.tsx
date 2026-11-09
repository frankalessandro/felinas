import { Lightbulb, TrendingUp, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconTile } from '@/components/brand'
import type { Tone } from '@/components/brand'
import { EmptyState } from '@/components/ui'
import type { Insight, InsightTone } from '../types'

const TONE_STYLES: Record<InsightTone, { icon: LucideIcon; tone: Tone; label: string }> = {
  ok: { icon: TrendingUp, tone: 'ok', label: 'Buena noticia' },
  warn: { icon: TriangleAlert, tone: 'warn', label: 'Ojo' },
  info: { icon: Lightbulb, tone: 'violeta', label: 'Dato' },
}

/** Lo que dicen los números, en frases claras. El tono se anuncia con texto y con icono. */
export function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <section aria-label="Insights" className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <Lightbulb className="size-4 text-ambar" aria-hidden />
        <h3 className="font-display text-base font-bold">Lo que dicen los números</h3>
      </header>
      {insights.length === 0 ? (
        <EmptyState illustration="chart" title="Aún no hay datos suficientes" description="Se necesitan al menos 2 clases por franja para sacar conclusiones." className="py-8" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight, index) => {
            const { icon, tone, label } = TONE_STYLES[insight.tone]
            return (
              <li
                key={insight.id}
                className="animate-fade-up flex items-start gap-3 rounded-2xl border border-line bg-surface/80 p-4 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IconTile icon={icon} tone={tone} />
                <p className="text-sm leading-relaxed text-fg">
                  <span className="sr-only">{label}: </span>
                  {insight.text}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
