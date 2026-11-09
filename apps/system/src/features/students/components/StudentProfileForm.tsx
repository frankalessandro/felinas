import { ShieldAlert } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { useUpdateStudentProfile } from '../hooks/useStudentMutations'
import { getAge, isMinor } from '../lib'
import { studentProfileSchema } from '../schemas'
import type { StudentProfileFormValues } from '../schemas'
import type { StudentProfile } from '../types'

function toFormValues(profile: StudentProfile): StudentProfileFormValues {
  return {
    phone: profile.phone ?? '',
    birth_date: profile.birth_date ?? '',
    guardian_name: profile.guardian_name ?? '',
    guardian_phone: profile.guardian_phone ?? '',
  }
}

/** Montar con `key={profile.updated_at}` para que reinicie los valores tras guardar. */
export function StudentProfileForm({ profile }: { profile: StudentProfile }) {
  const mutation = useUpdateStudentProfile(profile.id)
  const form = useZodForm(studentProfileSchema, toFormValues(profile))
  const { values, errors, setValue } = form
  const minor = isMinor(values.birth_date === '' ? null : values.birth_date)

  const save = form.submit((data) => mutation.mutateAsync(data).then(() => undefined, () => undefined))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo" hint="Viene de su cuenta de Google.">
              <Input value={profile.email ?? ''} readOnly disabled />
            </Field>
            <Field label="Teléfono / WhatsApp" error={errors.phone}>
              <Input type="tel" value={values.phone} onChange={(e) => setValue('phone', e.target.value)} placeholder="300 123 4567" />
            </Field>
            <Field
              label="Fecha de nacimiento"
              error={errors.birth_date}
              hint={values.birth_date && !errors.birth_date ? `${getAge(values.birth_date)} años` : undefined}
            >
              <Input type="date" value={values.birth_date} onChange={(e) => setValue('birth_date', e.target.value)} />
            </Field>
          </div>

          {minor && (
            <div className="flex flex-col gap-4 rounded-2xl border border-dorado/30 bg-dorado-soft p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-dorado">
                <ShieldAlert className="size-5" aria-hidden /> Menor de edad: registra a su acudiente
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre del acudiente" error={errors.guardian_name} required>
                  <Input value={values.guardian_name} onChange={(e) => setValue('guardian_name', e.target.value)} maxLength={80} />
                </Field>
                <Field label="Teléfono del acudiente" error={errors.guardian_phone} required>
                  <Input type="tel" value={values.guardian_phone} onChange={(e) => setValue('guardian_phone', e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
