import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { CalendarDays, CalendarPlus, RefreshCw } from 'lucide-react'
import { CalendarView, type CalendarEvent } from '@/components/calendar'
import { AsyncContent, Button, PageHeader } from '@/components/ui'
import { toCalendarEvent } from '@/features/schedule/mappers'
import { resolveCalendarSearch } from '@/features/schedule/calendarSearch'
import { useCalendarSessions } from '@/features/schedule/hooks/useCalendarSessions'
import type { SessionWithDetails } from '@/features/schedule/types'
import { toDateKey } from '@/lib/dates'
import { AgendaFilters } from './AgendaFilters'
import { GenerateWeeksDialog } from './GenerateWeeksDialog'
import { SessionDetailDialog } from './SessionDetailDialog'
import { SessionFormDialog } from './SessionFormDialog'

const route = getRouteApi('/_app/admin/agenda')

type FormState = { mode: 'create'; initialStart?: Date } | { mode: 'edit'; session: SessionWithDetails }

function toEvent(session: SessionWithDetails): CalendarEvent {
  return toCalendarEvent(session, session.kind === 'private' ? { badge: { label: 'Personalizada', tone: 'dorado' } } : {})
}

export function AgendaPage() {
  const search = route.useSearch()
  const { teacher, type, session: selectedId } = search
  const navigate = route.useNavigate()
  const [formState, setFormState] = useState<FormState | null>(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [promptAddFor, setPromptAddFor] = useState<string | null>(null)

  const { view, date } = resolveCalendarSearch(search)
  const sessions = useCalendarSessions(view, date, { teacherId: teacher, classTypeId: type })

  function updateSearch(next: Partial<typeof search>) {
    void navigate({ search: (prev) => ({ ...prev, ...next }), replace: true })
  }

  function handleSaved(saved: SessionWithDetails) {
    if (formState?.mode !== 'create') return
    // Una personalizada sin alumna no sirve: abrimos el detalle con el selector listo.
    if (saved.kind === 'private') setPromptAddFor(saved.id)
    updateSearch({ session: saved.id })
  }

  function closeDetail() {
    setPromptAddFor(null)
    updateSearch({ session: undefined })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={CalendarDays}
        title="Agenda"
        description="Toca una clase para ver su lista. En la vista semanal, toca un hueco vacío para crear una."
        actions={
          <>
            <Button variant="secondary" onClick={() => setGenerateOpen(true)}>
              <RefreshCw className="size-4" aria-hidden />
              Generar semanas
            </Button>
            <Button onClick={() => setFormState({ mode: 'create' })}>
              <CalendarPlus className="size-4" aria-hidden />
              Nueva clase
            </Button>
          </>
        }
      />

      <AgendaFilters teacherId={teacher} classTypeId={type} onChange={(next) => updateSearch({ teacher: next.teacherId, type: next.classTypeId })} />

      <AsyncContent isLoading={sessions.isLoading} error={sessions.error} onRetry={() => void sessions.refetch()}>
        <CalendarView
          view={view}
          onViewChange={(next) => updateSearch({ view: next })}
          date={date}
          onDateChange={(next) => updateSearch({ date: toDateKey(next), session: undefined })}
          events={(sessions.data ?? []).map(toEvent)}
          onEventClick={(event) => updateSearch({ session: event.id })}
          onSlotClick={(date) => setFormState({ mode: 'create', initialStart: date })}
        />
      </AsyncContent>

      {selectedId && (
        <SessionDetailDialog
          key={selectedId}
          sessionId={selectedId}
          promptAddStudent={promptAddFor === selectedId}
          onClose={closeDetail}
          onEdit={(session) => setFormState({ mode: 'edit', session })}
        />
      )}
      <SessionFormDialog
        open={formState !== null}
        onOpenChange={(open) => !open && setFormState(null)}
        session={formState?.mode === 'edit' ? formState.session : null}
        initialStart={formState?.mode === 'create' ? formState.initialStart : undefined}
        onSaved={handleSaved}
      />
      <GenerateWeeksDialog open={generateOpen} onOpenChange={setGenerateOpen} />
    </div>
  )
}
