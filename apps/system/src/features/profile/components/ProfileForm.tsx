import { IdCard, ShieldCheck } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Button, Card, CardContent, CardHeader, CardTitle, Checkbox, Field, Input } from '@/components/ui'
import type { Profile } from '@/features/auth/types'
import { useZodForm } from '@/hooks/useZodForm'
import { formatters } from '@/lib/dates'
import { toastError } from '@/lib/mutationToasts'
import { useServerFieldError } from '../hooks/useServerFieldError'
import { useUpdateMyProfile } from '../hooks/useUpdateMyProfile'
import { formatPhone } from '../personalData'
import { profileSchema, type ProfileFormValues } from '../schemas'
import { PersonalFieldsSection } from './PersonalFieldsSection'

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    full_name: profile.full_name ?? '',
    phone: formatPhone(profile.phone),
    birth_date: profile.birth_date ?? '',
    image_consent: profile.image_consent ?? false,
  }
}

/** Montar con `key={profile.updated_at}` para que los valores se reinicien tras guardar. */
export function ProfileForm({ profile }: { profile: Profile }) {
  const mutation = useUpdateMyProfile()
  const serverError = useServerFieldError()
  const { values, errors, setValue, submit } = useZodForm(profileSchema, toFormValues(profile))

  function change<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    serverError.clear()
    setValue(key, value)
  }

  const handleSubmit = submit(async (data) => {
    serverError.clear()
    try {
      await mutation.mutateAsync(data)
    } catch (error) {
      if (!serverError.capture(error)) toastError('No pudimos guardar tu perfil')(error)
    }
  })

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconTile icon={IdCard} tone="rosa" size="sm" />
            <CardTitle className="text-base font-bold">Tus datos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field label="Correo" hint="Viene de tu cuenta de Google y no se puede cambiar.">
            <Input value={profile.email ?? ''} readOnly disabled />
          </Field>
          <PersonalFieldsSection
            values={values}
            errors={{
              full_name: errors.full_name ?? serverError.errorFor('full_name'),
              phone: errors.phone ?? serverError.errorFor('phone'),
              birth_date: errors.birth_date ?? serverError.errorFor('birth_date'),
            }}
            onChange={(field, value) => change(field, value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconTile icon={ShieldCheck} tone="violeta" size="sm" />
            <CardTitle className="text-base font-bold">Autorizaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Checkbox
            checked={values.image_consent}
            onChange={(event) => change('image_consent', event.target.checked)}
            label="Autorizo el uso de mi imagen en fotos y videos de clase para las redes de Felinas."
          />
          <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-sm text-fg-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
            {profile.data_consent_at
              ? `Aceptaste la política de tratamiento de datos el ${formatters.shortDate(profile.data_consent_at)}.`
              : 'Aún no registramos tu aceptación de la política de datos.'}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={mutation.isPending} className="w-full sm:w-auto">
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
