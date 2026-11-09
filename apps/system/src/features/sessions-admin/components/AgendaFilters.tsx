import { useQuery } from '@tanstack/react-query'
import { UnderlineTabs } from '@/components/ui/UnderlineTabs'
import { sessionFormOptionsQuery } from '../queries'
import { TeacherPicker } from './TeacherPicker'

interface AgendaFiltersProps {
  teacherId?: string
  classTypeId?: string
  onChange: (next: { teacherId?: string; classTypeId?: string }) => void
}

export function AgendaFilters({ teacherId, classTypeId, onChange }: AgendaFiltersProps) {
  const options = useQuery(sessionFormOptionsQuery())
  const teachers = options.data?.teachers ?? []
  const classTypes = options.data?.classTypes ?? []

  return (
    <div className="flex flex-col gap-3">
      <UnderlineTabs
        label="Estilo"
        value={classTypeId}
        onChange={(id) => onChange({ teacherId, classTypeId: id })}
        options={[{ id: undefined, label: 'Todos los estilos' }, ...classTypes.map((t) => ({ id: t.id, label: t.name, color: t.color }))]}
      />
      <TeacherPicker teachers={teachers} value={teacherId} onChange={(id) => onChange({ teacherId: id, classTypeId })} />
    </div>
  )
}
