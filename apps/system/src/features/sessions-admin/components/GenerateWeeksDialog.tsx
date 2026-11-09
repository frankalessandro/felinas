import { useState, type FormEvent } from 'react'
import { Button, Dialog, Field, Input, Select } from '@/components/ui'
import { academyToday, getWeekStart, toDateKey } from '@/lib/dates'
import { useGenerateSessions } from '../hooks/useSessionMutations'

const WEEK_OPTIONS = [1, 2, 4, 8, 12, 26].map((weeks) => ({ value: String(weeks), label: weeks === 1 ? '1 semana' : `${weeks} semanas` }))
const DEFAULT_WEEKS = '4'

function GenerateWeeksForm({ onClose }: { onClose: () => void }) {
  const [from, setFrom] = useState(() => toDateKey(getWeekStart(academyToday())))
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS)
  const generate = useGenerateSessions()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!from) return
    try {
      await generate.mutateAsync({ from, weeks: Number(weeks) })
      onClose()
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <Field label="Desde" hint="Se crean las clases de las plantillas activas; las que ya existen no se duplican." required>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </Field>
      <Field label="Cuántas semanas">
        <Select value={weeks} onValueChange={setWeeks} options={WEEK_OPTIONS} />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={generate.isPending}>
          Cancelar
        </Button>
        <Button type="submit" loading={generate.isPending} disabled={!from}>
          Generar clases
        </Button>
      </div>
    </form>
  )
}

interface GenerateWeeksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateWeeksDialog({ open, onOpenChange }: GenerateWeeksDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Generar semanas" description="Crea las clases concretas a partir de los horarios recurrentes.">
      <GenerateWeeksForm onClose={() => onOpenChange(false)} />
    </Dialog>
  )
}
