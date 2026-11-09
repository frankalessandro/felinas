import { Badge } from '@/components/ui'
import type { PlanClassType } from '../types'

export function AllowedTypeChips({ types }: { types: PlanClassType[] }) {
  if (types.length === 0) return <p className="text-sm text-fg-muted">Tu plan aún no tiene estilos asignados.</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {types.map((type) => (
        <li key={type.id}>
          <Badge color={type.color} className="px-3 py-1 text-sm">
            {type.name}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
