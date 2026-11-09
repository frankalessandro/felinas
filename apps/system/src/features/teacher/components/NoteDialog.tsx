import { useState } from 'react'
import type { FormEvent } from 'react'
import { z } from 'zod'
import { Button, Dialog, Field, Textarea } from '@/components/ui'
import { useCreateNote } from '../hooks/useCreateNote'
import { NOTE_MAX_LENGTH } from '../lib'

const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(3, 'Escribe al menos unas palabras.')
    .max(NOTE_MAX_LENGTH, `Máximo ${NOTE_MAX_LENGTH} caracteres.`),
})

interface NoteDialogProps {
  onClose: () => void
  studentId: string
  studentName: string
  authorId: string
  /** Sesión de la que habla la nota; `null` para una nota general. */
  sessionId: string | null
}

/** Montar solo cuando se abre: así el texto se reinicia en cada nota. */
export function NoteDialog({ onClose, studentId, studentName, authorId, sessionId }: NoteDialogProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | undefined>()
  const { mutate, isPending } = useCreateNote()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = noteSchema.safeParse({ body })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    setError(undefined)
    mutate({ studentId, authorId, sessionId, body: parsed.data.body }, { onSuccess: onClose })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Agregar nota"
      description={`Seguimiento de ${studentName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="note-form" loading={isPending}>
            Guardar nota
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={handleSubmit}>
        <Field label="Nota" error={error} hint={`${body.length}/${NOTE_MAX_LENGTH}`} required>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={6}
            placeholder="Ej.: mejoró su técnica de piso, reforzar coordinación en la próxima clase."
            autoFocus
          />
        </Field>
      </form>
    </Dialog>
  )
}
