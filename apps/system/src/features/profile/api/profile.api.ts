import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { Profile } from '@/features/auth/types'
import type { ProfileFormData } from '../schemas'

/** Nombre, celular, fecha de nacimiento y autorización de imagen. El consentimiento de datos solo se da en el onboarding. */
export async function updateMyProfile(data: ProfileFormData): Promise<Profile> {
  return unwrap(
    await supabase.rpc('update_my_profile', {
      p_full_name: data.full_name,
      p_phone: data.phone,
      p_birth_date: data.birth_date,
      p_image_consent: data.image_consent,
    }),
  )
}
