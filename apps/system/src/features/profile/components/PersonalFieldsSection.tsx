import { Field, Input } from '@/components/ui'
import { getBirthDateBounds, NAME_MAX } from '../personalData'

type TextField = 'full_name' | 'phone' | 'birth_date'

interface PersonalFieldsSectionProps {
  values: Record<TextField, string>
  errors: Partial<Record<TextField, string | undefined>>
  onChange: (field: TextField, value: string) => void
}


/** Nombre, celular y fecha de nacimiento: los mismos campos en el onboarding y en "Mi perfil". */
export function PersonalFieldsSection({ values, errors, onChange }: PersonalFieldsSectionProps) {
  const { min, max } = getBirthDateBounds()
  return (
    <div className="flex flex-col gap-5">
      <Field label="Nombre completo" error={errors.full_name} required>
        <Input
          value={values.full_name}
          onChange={(event) => onChange('full_name', event.target.value)}
          autoComplete="name"
          maxLength={NAME_MAX}
          placeholder="Como te conocen en la academia"
        />
      </Field>
      <Field label="Celular / WhatsApp" error={errors.phone} hint="Te escribimos por aquí para avisos de tu plan." required>
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={values.phone}
          onChange={(event) => onChange('phone', event.target.value)}
          placeholder="300 123 4567"
        />
      </Field>
      <Field label="Fecha de nacimiento" error={errors.birth_date} required>
        <Input
          type="date"
          autoComplete="bday"
          min={min}
          max={max}
          value={values.birth_date}
          onChange={(event) => onChange('birth_date', event.target.value)}
        />
      </Field>
    </div>
  )
}
