import { useQuery } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { Eyebrow } from '@/components/brand'
import { AsyncContent, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, Field, Textarea } from '@/components/ui'
import { formatters } from '@/lib/dates'
import { useSaveAdminNotes } from '../hooks/useStudentMutations'
import { adminNotesQuery, progressNotesQuery } from '../queries'
import { useState } from 'react'

/** Editor con estado propio: se monta cuando las notas ya cargaron, así parte del valor guardado. */
function AdminNotesEditor({ studentId, initialValue }: { studentId: string; initialValue: string }) {
  const mutation = useSaveAdminNotes(studentId)
  const [value, setValue] = useState(initialValue)
  const isDirty = value.trim() !== initialValue.trim()

  return (
    <div className="flex flex-col gap-3">
      <Field label="Notas internas" hint="Solo las ve el equipo administrador. La alumna y las profes no tienen acceso.">
        <Textarea rows={5} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Acuerdos de pago, lesiones, observaciones…" maxLength={2000} />
      </Field>
      <div className="flex justify-end">
        <Button disabled={!isDirty} loading={mutation.isPending} onClick={() => mutation.mutate(value)}>
          Guardar notas
        </Button>
      </div>
    </div>
  )
}

function AdminNotes({ studentId }: { studentId: string }) {
  const query = useQuery(adminNotesQuery(studentId))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-4 text-rosa-hover" aria-hidden /> Notas privadas
        </CardTitle>
        <CardDescription>Visibles solo para administración.</CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncContent isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
          <AdminNotesEditor studentId={studentId} initialValue={query.data ?? ''} />
        </AsyncContent>
      </CardContent>
    </Card>
  )
}

function ProgressNotes({ studentId }: { studentId: string }) {
  const query = useQuery(progressNotesQuery(studentId))
  return (
    <section className="flex flex-col gap-3">
      <Eyebrow>Seguimiento de las profes</Eyebrow>
      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => query.refetch()}
        empty={<EmptyState illustration="search" title="Sin notas de seguimiento" description="Las profes las escriben desde su panel." />}
      >
        <ul className="flex flex-col gap-2">
          {query.data?.map((note) => (
            <li key={note.id} className="relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-rosa" />
              <p className="whitespace-pre-wrap text-sm text-fg">{note.body}</p>
              <p className="text-xs text-fg-subtle">
                {note.author?.full_name ?? 'Equipo'} · {formatters.shortDate(note.created_at)}
                {note.session?.class_type && ` · ${note.session.class_type.name}`}
              </p>
            </li>
          ))}
        </ul>
      </AsyncContent>
    </section>
  )
}

export function StudentNotesTab({ studentId }: { studentId: string }) {
  return (
    <div className="flex flex-col gap-6">
      <AdminNotes studentId={studentId} />
      <ProgressNotes studentId={studentId} />
    </div>
  )
}
