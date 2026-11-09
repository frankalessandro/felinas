import type { Enums, Tables } from '@/types/database'

export type Profile = Tables<'profiles'>
export type UserRole = Enums<'user_role'>
export type ProfileStatus = Enums<'profile_status'>
