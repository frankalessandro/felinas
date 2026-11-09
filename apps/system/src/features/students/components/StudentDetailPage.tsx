import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import { Stamp } from '@/components/brand'
import { AsyncContent, Avatar, Badge, Button, ConfirmDialog, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { formatters } from '@/lib/dates'
import { useSetStudentStatus } from '../hooks/useStudentMutations'
import { studentQuery } from '../queries'
import { StudentHistoryTab } from './StudentHistoryTab'
import { StudentNotesTab } from './StudentNotesTab'
import { StudentPlansTab } from './StudentPlansTab'
import { StudentProfileForm } from './StudentProfileForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export type StudentDetailTab = 'profile' | 'plans' | 'history' | 'notes'

const TABS: { value: StudentDetailTab; label: string }[] = [
  { value: 'profile', label: 'Perfil' },
  { value: 'plans', label: 'Planes' },
  { value: 'history', label: 'Historial' },
  { value: 'notes', label: 'Notas' },
]

interface StudentDetailPageProps {
  studentId: string
  tab: StudentDetailTab
  onTabChange: (tab: StudentDetailTab) => void
}

export function StudentDetailPage({ studentId, tab, onTabChange }: StudentDetailPageProps) {
  const query = useQuery(studentQuery(studentId))
  const setStatus = useSetStudentStatus(studentId)
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false)

  const student = query.data
  const name = student?.full_name ?? student?.email ?? 'Alumna'
  const isActive = student?.status === 'active'

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <Link
        to="/admin/students"
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl pr-3 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Alumnas
      </Link>

      <AsyncContent isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        {student && (
          <>
            <header className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
              <span aria-hidden className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-rosa/15 blur-3xl" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar name={name} src={student.avatar_url} size="xl" className="ring-4 ring-rosa/30" />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h1 className="break-words font-display text-2xl font-extrabold leading-tight">{name}</h1>
                    <p className="truncate text-sm text-fg-muted">{student.email}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Stamp tone={isActive ? 'ok' : 'muted'}>{isActive ? 'Activa' : 'Inactiva'}</Stamp>
                      <Badge>Desde {formatters.shortDate(student.created_at)}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <WhatsAppButton phone={student.phone} name={name} size="md" />
                  {isActive ? (
                    <Button variant="danger" onClick={() => setConfirmingDeactivate(true)}>
                      <UserX className="size-4" aria-hidden /> Desactivar
                    </Button>
                  ) : (
                    <Button variant="outline" loading={setStatus.isPending} onClick={() => setStatus.mutate('active')}>
                      <UserCheck className="size-4" aria-hidden /> Reactivar
                    </Button>
                  )}
                </div>
              </div>
            </header>

            <Tabs value={tab} onValueChange={(value) => onTabChange(value as StudentDetailTab)}>
              <TabsList aria-label="Secciones de la alumna">
                {TABS.map(({ value, label }) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="profile">
                <StudentProfileForm key={student.updated_at} profile={student} />
              </TabsContent>
              <TabsContent value="plans">
                <StudentPlansTab studentId={student.id} studentName={name} />
              </TabsContent>
              <TabsContent value="history">
                <StudentHistoryTab studentId={student.id} />
              </TabsContent>
              <TabsContent value="notes">
                <StudentNotesTab studentId={student.id} />
              </TabsContent>
            </Tabs>

            <ConfirmDialog
              open={confirmingDeactivate}
              onOpenChange={setConfirmingDeactivate}
              title={`¿Desactivar a ${name}?`}
              description="No podrá reservar clases mientras esté inactiva. Su historial y planes se conservan y puedes reactivarla cuando quieras."
              confirmLabel="Desactivar"
              tone="danger"
              onConfirm={() => setStatus.mutateAsync('inactive').then(() => undefined, () => undefined)}
            />
          </>
        )}
      </AsyncContent>
    </div>
  )
}
