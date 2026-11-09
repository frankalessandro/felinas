import { UnderlineTabs } from '@/components/ui/UnderlineTabs'
import type { ClassTypeOption } from '../types'

interface ClassTypeTabsProps {
  types: ClassTypeOption[]
  /** `undefined` = todas. */
  value: string | undefined
  onChange: (typeId: string | undefined) => void
  /** Si se pasa, los estilos fuera del plan se atenúan y llevan candado. */
  allowedIds?: ReadonlySet<string>
}

export function ClassTypeTabs({ types, value, onChange, allowedIds }: ClassTypeTabsProps) {
  return (
    <UnderlineTabs
      label="Filtrar por estilo"
      value={value}
      onChange={onChange}
      options={[
        { id: undefined, label: 'Todas' },
        ...types.map((type) => ({ id: type.id, label: type.name, color: type.color, locked: allowedIds ? !allowedIds.has(type.id) : false })),
      ]}
    />
  )
}
