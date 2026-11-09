import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile, Meter, type Tone } from '@/components/brand'
import { Button, Checkbox } from '@/components/ui'
import { PersonalFieldsSection } from '@/features/profile/components/PersonalFieldsSection'
import { useServerFieldError } from '@/features/profile/hooks/useServerFieldError'
import { useZodForm } from '@/hooks/useZodForm'
import { toastError } from '@/lib/mutationToasts'
import { useCompleteOnboarding } from '../hooks/useCompleteOnboarding'
import { onboardingSchema, type OnboardingFormValues } from '../schemas'
import { DataPolicyPanel } from './DataPolicyPanel'

interface OnboardingFormProps {
  initialName: string
}

const POLICY_ERROR_ID = 'policy-error'
const REQUIRED_FIELDS = 4

interface FormSectionProps {
  icon: LucideIcon
  tone: Tone
  title: string
  description: string
  children: ReactNode
}

function FormSection({ icon, tone, title, description, children }: FormSectionProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} tone={tone} />
        <div>
          <h2 className="font-display text-base font-bold leading-tight">{title}</h2>
          <p className="text-xs text-fg-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function countCompleted(values: OnboardingFormValues): number {
  const checks = [values.full_name.trim(), values.phone.trim(), values.birth_date, values.accept_data_policy]
  return checks.filter(Boolean).length
}

export function OnboardingForm({ initialName }: OnboardingFormProps) {
  const mutation = useCompleteOnboarding()
  const serverError = useServerFieldError()
  const initialValues: OnboardingFormValues = {
    full_name: initialName,
    phone: '',
    birth_date: '',
    image_consent: false,
    accept_data_policy: false,
  }
  const { values, errors, setValue, submit } = useZodForm(onboardingSchema, initialValues)

  function change<K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) {
    serverError.clear()
    setValue(key, value)
  }

  const handleSubmit = submit(async (data) => {
    serverError.clear()
    try {
      await mutation.mutateAsync(data)
    } catch (error) {
      if (!serverError.capture(error)) toastError('No pudimos guardar tus datos')(error)
    }
  })

  const policyError = errors.accept_data_policy ?? serverError.errorFor('accept_data_policy')
  const completed = countCompleted(values)

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-fg-muted">Tu progreso</span>
          <span className="tabular-nums text-fg-subtle">
            {completed} de {REQUIRED_FIELDS} campos obligatorios
          </span>
        </div>
        <Meter variant="bar" value={completed} max={REQUIRED_FIELDS} label={`${completed} de ${REQUIRED_FIELDS} campos obligatorios completos`} />
      </div>

      <FormSection icon={UserRound} tone="rosa" title="Tus datos" description="Para que la academia te reconozca y te escriba.">
        <PersonalFieldsSection
          values={values}
          errors={{
            full_name: errors.full_name ?? serverError.errorFor('full_name'),
            phone: errors.phone ?? serverError.errorFor('phone'),
            birth_date: errors.birth_date ?? serverError.errorFor('birth_date'),
          }}
          onChange={(field, value) => change(field, value)}
        />
      </FormSection>

      <FormSection icon={ShieldCheck} tone="violeta" title="Permisos" description="Protegemos tus datos según la Ley 1581 de 2012.">
        <fieldset className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2/60 p-4">
          <legend className="sr-only">Autorizaciones</legend>
          <Checkbox
            checked={values.accept_data_policy}
            onChange={(event) => change('accept_data_policy', event.target.checked)}
            aria-invalid={policyError ? true : undefined}
            aria-describedby={policyError ? POLICY_ERROR_ID : undefined}
            label={
              <span>
                Acepto la política de tratamiento de datos personales (Ley 1581 de 2012).
                <span aria-hidden className="ml-0.5 text-rosa-hover">
                  *
                </span>
              </span>
            }
          />
          {policyError && (
            <p id={POLICY_ERROR_ID} role="alert" className="pl-8 text-xs font-medium text-danger">
              {policyError}
            </p>
          )}
          <div className="pl-8">
            <DataPolicyPanel />
          </div>
          <Checkbox
            checked={values.image_consent}
            onChange={(event) => change('image_consent', event.target.checked)}
            label="Autorizo el uso de mi imagen en fotos y videos de clase para las redes de Felinas (opcional)."
          />
        </fieldset>
      </FormSection>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
          Entrar a Felinas
          {!mutation.isPending && <ArrowRight className="size-5" aria-hidden />}
        </Button>
        <p className="text-center text-xs text-fg-subtle">Podrás cambiar todo esto luego en Mi perfil.</p>
      </div>
    </form>
  )
}
