import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { BarChart3, CalendarCheck, CalendarClock, HeartCrack, Percent, UserX, UserRound, Users, Shapes } from 'lucide-react'
import { AsyncContent, Field, Input, PageHeader, StatCard, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { classCategoriesQuery, classTypesQuery } from '@/features/classes/queries'
import { buildInsights } from '../insights'
import { getBars, getCategoryBars, getHeatmapCells, getTotals } from '../occupancy'
import { atRiskStudentsQuery, inactiveStudentsQuery, occupancyReportQuery } from '../queries'
import { AtRiskList } from './AtRiskList'
import { InactiveStudentsList } from './InactiveStudentsList'
import { InsightsCard } from './InsightsCard'
import { OccupancyBars } from './OccupancyBars'
import { OccupancyHeatmap } from './OccupancyHeatmap'
import { RenewalSection } from './RenewalSection'
import { ReportPanel } from './ReportPanel'

const route = getRouteApi('/_app/admin/reports')

function DateRangeFilter({ from, to }: { from: string; to: string }) {
  const navigate = route.useNavigate()
  function update(next: { from?: string; to?: string }) {
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true })
  }
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Desde">
        <Input type="date" value={from} max={to} onChange={(e) => e.target.value && update({ from: e.target.value })} />
      </Field>
      <Field label="Hasta">
        <Input type="date" value={to} min={from} onChange={(e) => e.target.value && update({ to: e.target.value })} />
      </Field>
    </div>
  )
}

function OccupancyTab({ from, to }: { from: string; to: string }) {
  const report = useQuery(occupancyReportQuery({ from, to }))
  const classTypes = useQuery(classTypesQuery())
  const categories = useQuery(classCategoriesQuery())

  const rows = report.data ?? []
  const totals = getTotals(rows)
  const classTypeBars = getBars(rows, 'class_type')
  const categoryBars = getCategoryBars(rows, classTypes.data ?? [], categories.data ?? [])
  const cells = getHeatmapCells(rows)
  const insights = buildInsights({ weekdayHourCells: cells, classTypeBars, categoryBars, totals })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-start sm:justify-end">
        <DateRangeFilter from={from} to={to} />
      </div>
      <AsyncContent isLoading={report.isLoading} error={report.error} onRetry={() => void report.refetch()}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Clases grupales" value={totals.sessions} icon={CalendarCheck} tone="violeta" hint="No canceladas en el rango" />
            <StatCard
              label="Ocupación"
              value={`${totals.occupancyPct}%`}
              icon={Users}
              tone="rosa"
              hint={`${totals.booked} de ${totals.capacity} cupos`}
            />
            <StatCard
              label="Asistencia"
              value={totals.attendancePct === null ? '—' : `${totals.attendancePct}%`}
              icon={Percent}
              tone="ok"
              hint="Presentes sobre reservas de clases ya dadas"
            />
          </div>
          <InsightsCard insights={insights} />
          <OccupancyHeatmap cells={cells} />
          <div className="grid gap-4 lg:grid-cols-3">
            <OccupancyBars icon={Shapes} title="Por categoría" description="Twerk, Urbano… según la categoría de cada estilo." bars={categoryBars} />
            <OccupancyBars icon={CalendarClock} title="Por tipo de clase" description="Ordenado de más a menos llena." bars={classTypeBars} />
            <OccupancyBars icon={UserRound} title="Por profesor" description="Ocupación de las clases de cada profe." bars={getBars(rows, 'teacher')} />
          </div>
        </div>
      </AsyncContent>
    </div>
  )
}

function StudentsTab() {
  const atRisk = useQuery(atRiskStudentsQuery())
  const inactive = useQuery(inactiveStudentsQuery())
  // Quien ya está en riesgo no se repite: aquí quedan las que nunca tomaron el ritmo o llevan más tiempo lejos.
  const atRiskIds = new Set((atRisk.data ?? []).map((student) => student.student_id))
  const otherInactive = inactive.data?.filter((student) => !atRiskIds.has(student.student_id))

  return (
    <div className="grid items-start gap-6">
      <div className="flex flex-col gap-6">
        <ReportPanel
          icon={HeartCrack}
          tone="danger"
          title="Alumnas en riesgo"
          description="Venían con constancia, llevan 10 días o más sin asistir y no tienen clase reservada. Un mensaje a tiempo las trae de vuelta."
          className="border-danger/30"
        >
          <AtRiskList students={atRisk.data} isLoading={atRisk.isLoading} error={atRisk.error} onRetry={() => void atRisk.refetch()} />
        </ReportPanel>

        <ReportPanel
          icon={UserX}
          tone="warn"
          title="Otras alumnas sin actividad"
          description="Más de 14 días sin asistir y sin el patrón de las alumnas en riesgo (por ejemplo, las que aún no empiezan)."
        >
          <InactiveStudentsList
            students={otherInactive}
            isLoading={inactive.isLoading || atRisk.isLoading}
            error={inactive.error}
            onRetry={() => void inactive.refetch()}
          />
        </ReportPanel>
      </div>
    </div>
  )
}

export function ReportsPage() {
  const { from, to, tab } = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reportes" icon={BarChart3} iconTone="violeta" description="Qué se llena, quién se está alejando y cuántas renuevan." />

      <Tabs value={tab} onValueChange={(value) => void navigate({ search: (prev) => ({ ...prev, tab: parseTab(value) }), replace: true })}>
        <TabsList>
          <TabsTrigger value="occupancy">
            Ocupación
          </TabsTrigger>
          <TabsTrigger value="students">
            Alumnas
          </TabsTrigger>
          <TabsTrigger value="renewal">
            Renovación
          </TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="pt-6">
          <OccupancyTab from={from} to={to} />
        </TabsContent>
        <TabsContent value="students" className="pt-6">
          <StudentsTab />
        </TabsContent>
        <TabsContent value="renewal" className="pt-6">
          <RenewalSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function parseTab(value: string): 'occupancy' | 'students' | 'renewal' {
  if (value === 'students' || value === 'renewal') return value
  return 'occupancy'
}
