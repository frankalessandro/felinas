import { z } from 'zod'
import { calendarSearchShape } from '@/features/schedule/calendarSearch'

/** Estado de la pantalla Reservar en la URL: vista, fecha y filtro por tipo de clase. */
export const bookSearchSchema = z.object({
  ...calendarSearchShape,
  type: z.uuid().optional().catch(undefined),
})

export const historySearchSchema = z.object({
  tab: z.enum(['classes', 'notes']).optional().catch(undefined),
  type: z.uuid().optional().catch(undefined),
})

export type BookSearch = z.infer<typeof bookSearchSchema>
export type HistorySearch = z.infer<typeof historySearchSchema>
