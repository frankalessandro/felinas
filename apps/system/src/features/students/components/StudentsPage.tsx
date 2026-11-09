import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { AsyncContent, EmptyState, Input, PageHeader, SegmentedControl, Skeleton } from '@/components/ui'
import { studentsQuery } from '../queries'
import type { StudentListItem, StudentStatusFilter } from '../types'
import { StudentRow } from './StudentRow'
import { STUDENT_ROW_GRID } from './studentRowLayout'

interface StudentsPageProps {
  q: string
  status: StudentStatusFilter
  onSearchChange: (q: string) => void
  onStatusChange: (status: StudentStatusFilter) => void
}

const STATUS_OPTIONS: { value: StudentStatusFilter; label: string }[] = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
  { value: 'all', label: 'Todas' },
]

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function filterStudents(items: StudentListItem[], q: string, status: StudentStatusFilter): StudentListItem[] {
  const term = normalize(q.trim())
  return items.filter(({ profile }) => {
    if (status !== 'all' && profile.status !== status) return false
    if (!term) return true
    const haystack = normalize(`${profile.full_name ?? ''} ${profile.email ?? ''} ${profile.phone ?? ''}`)
    return haystack.includes(term)
  })
}

export function StudentsPage({ q, status, onSearchChange, onStatusChange }: StudentsPageProps) {
  const query = useQuery(studentsQuery())
  const students = filterStudents(query.data ?? [], q, status)
  const hasFilters = q.trim() !== '' || status === 'inactive'

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader icon={Users} title="Alumnas" description="Busca alumnas, revisa su plan y escríbeles por WhatsApp." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <Input
            type="search"
            aria-label="Buscar alumna"
            placeholder="Buscar por nombre, correo o teléfono…"
            value={q}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-11"
          />
        </div>
        <SegmentedControl label="Filtrar por estado" options={STATUS_OPTIONS} value={status} onValueChange={onStatusChange} />
      </div>

      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={students.length === 0}
        onRetry={() => query.refetch()}
        empty={
          <EmptyState
            illustration={hasFilters ? 'search' : 'people'}
            title={hasFilters ? 'Sin resultados' : 'Aún no hay alumnas'}
            description={hasFilters ? 'Prueba con otro nombre o cambia el filtro de estado.' : 'Las alumnas aparecen aquí al aprobar sus solicitudes.'}
          />
        }
        loading={
          <>
            {[0, 1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-24" />
            ))}
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <div aria-hidden className={`hidden px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle ${STUDENT_ROW_GRID}`}>
            <span>Alumna</span>
            <span>Teléfono</span>
            <span>Plan vigente</span>
            <span className="w-[6.75rem]" />
          </div>
          <ul className="flex flex-col gap-2">
            {students.map((item) => (
              <StudentRow key={item.profile.id} item={item} />
            ))}
          </ul>
          <p className="px-1 pt-2 text-sm text-fg-muted">
            <span className="font-semibold text-fg">{students.length}</span> {students.length === 1 ? 'alumna' : 'alumnas'} en la lista
          </p>
        </div>
      </AsyncContent>
    </div>
  )
}
