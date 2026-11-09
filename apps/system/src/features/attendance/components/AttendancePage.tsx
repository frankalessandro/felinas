import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { Dialog, PageHeader } from '@/components/ui'
import { sessionsQuery } from '@/features/schedule/queries'
import { formatters, fromDateKey } from '@/lib/dates'
import { getDayRange, getTodayKey } from '../day'
import { DaySessionList } from './DaySessionList'
import { SessionRoster } from './SessionRoster'

const route = getRouteApi('/_app/admin/attendance')

export function AttendancePage() {
  const { session: sessionId } = route.useSearch()
  const navigate = route.useNavigate()
  const today = getTodayKey()
  const sessions = useQuery(sessionsQuery(getDayRange(today)))
  const selected = sessions.data?.find((s) => s.id === sessionId)

  function selectSession(id: string | undefined) {
    void navigate({ search: { session: id }, replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Pasar lista"
        eyebrow={formatters.fullDate(fromDateKey(today))}
        description="Estas son las clases de hoy. Toca una para ver sus reservas y marcar la asistencia: solo «Asistió» descuenta una clase del plan."
      />
      <DaySessionList
        sessions={sessions.data}
        isLoading={sessions.isLoading}
        error={sessions.error}
        onRetry={() => void sessions.refetch()}
        selectedId={sessionId}
        onSelect={selectSession}
      />
      {selected && (
        <Dialog
          open
          onOpenChange={(open) => !open && selectSession(undefined)}
          title={selected.title ?? selected.class_type?.name ?? 'Clase'}
          description={[formatters.timeRange(selected.starts_at, selected.ends_at), selected.teacher?.full_name, selected.room?.name].filter(Boolean).join(' · ')}
          className="md:max-w-2xl"
        >
          <SessionRoster key={selected.id} session={selected} />
        </Dialog>
      )}
    </div>
  )
}
