import { History } from 'lucide-react'
import { AsyncContent, EmptyState, PageHeader, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ProgressNotesList } from '@/features/progress-notes/components/ProgressNotesList'
import { useMyProgressNotes } from '@/features/progress-notes/hooks/useMyProgressNotes'
import { groupByMonth, getHistoryStats } from '../history'
import { useClassTypes, useMyAttendanceHistory } from '../hooks/useBookingQueries'
import { useMinuteClock } from '../hooks/useMinuteClock'
import type { HistorySearch } from '../searchSchema'
import { ClassTypeTabs } from './ClassTypeTabs'
import { HistoryList } from './HistoryList'
import { HistoryStatsRow } from './HistoryStatsRow'

interface HistoryScreenProps {
  search: HistorySearch
  onSearchChange: (patch: Partial<HistorySearch>) => void
}

function ListSkeleton() {
  return (
    <>
      <Skeleton className="h-24" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
    </>
  )
}

function ClassesTab({ typeFilter, onTypeChange }: { typeFilter: string | undefined; onTypeChange: (type: string | undefined) => void }) {
  const now = useMinuteClock()
  const historyQuery = useMyAttendanceHistory()
  const typesQuery = useClassTypes()

  const history = historyQuery.data ?? []
  const filtered = typeFilter ? history.filter((booking) => booking.session.class_type_id === typeFilter) : history

  return (
    <div className="flex flex-col gap-5">
      <AsyncContent
        isLoading={historyQuery.isPending}
        error={historyQuery.error}
        onRetry={() => void historyQuery.refetch()}
        isEmpty={history.length === 0}
        loading={<ListSkeleton />}
        empty={<EmptyState illustration="calendar" title="Todavía no tienes clases en tu historial" description="Cuando pase tu primera clase reservada, aparecerá aquí con su asistencia." />}
      >
        <HistoryStatsRow stats={getHistoryStats(history, now)} />
        <ClassTypeTabs types={typesQuery.data ?? []} value={typeFilter} onChange={onTypeChange} />
        {filtered.length === 0 ? (
          <EmptyState illustration="search" title="Sin clases de este estilo" description="Prueba con otro estilo o quita el filtro." />
        ) : (
          <HistoryList groups={groupByMonth(filtered)} />
        )}
      </AsyncContent>
    </div>
  )
}

function NotesTab() {
  const notesQuery = useMyProgressNotes()
  return (
    <AsyncContent isLoading={notesQuery.isPending} error={notesQuery.error} onRetry={() => void notesQuery.refetch()} loading={<ListSkeleton />}>
      <ProgressNotesList notes={notesQuery.data ?? []} />
    </AsyncContent>
  )
}

export function HistoryScreen({ search, onSearchChange }: HistoryScreenProps) {
  const tab = search.tab ?? 'classes'

  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <PageHeader icon={History} iconTone="violeta" title="Tu historial" description="Tus clases pasadas, tu asistencia y lo que tus profes dicen de tu progreso." />
      <Tabs value={tab} onValueChange={(next) => onSearchChange({ tab: next === 'notes' ? 'notes' : 'classes' })}>
        <TabsList>
          <TabsTrigger value="classes">Mis clases</TabsTrigger>
          <TabsTrigger value="notes">Notas del profe</TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <ClassesTab typeFilter={search.type} onTypeChange={(type) => onSearchChange({ type })} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
