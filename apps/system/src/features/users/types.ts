import type { Enums, Tables } from '@/types/database'

export type UserProfile = Tables<'profiles'>
export type UserRole = Enums<'user_role'>
export type UserStatus = Enums<'profile_status'>

/** Lo que el admin pidió hacer con una cuenta: convertirla en un rol concreto. */
export interface ApprovalRequest {
  profile: UserProfile
  role: UserRole
}
