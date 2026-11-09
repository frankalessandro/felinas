import { z } from 'zod'
import { personalFieldsShape } from '@/features/profile/schemas'

export const onboardingSchema = z.object({
  ...personalFieldsShape,
  accept_data_policy: z.boolean().refine((accepted) => accepted, 'Debes aceptar la política de datos para continuar'),
})
export type OnboardingFormValues = z.input<typeof onboardingSchema>
export type OnboardingFormData = z.output<typeof onboardingSchema>
