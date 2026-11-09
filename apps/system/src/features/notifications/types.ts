import type { Enums, Tables } from '@/types/database'

export type NotificationType = Enums<'notification_type'>
export type AppNotification = Tables<'notifications'>
