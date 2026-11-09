import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { Profile } from '@/features/auth/types'
import type { OnboardingFormData } from '../schemas'

export async function completeOnboarding(data: OnboardingFormData): Promise<Profile> {
  return unwrap(
    await supabase.rpc('complete_onboarding', {
      p_full_name: data.full_name,
      p_phone: data.phone,
      p_birth_date: data.birth_date,
      p_accept_data_policy: data.accept_data_policy,
      p_image_consent: data.image_consent,
    }),
  )
}
