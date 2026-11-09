import { queryOptions } from '@tanstack/react-query'
import { listClassCategories } from './api/categories.api'
import { listClassTypes } from './api/classTypes.api'
import { listRooms } from './api/rooms.api'
import { listSchedules } from './api/schedules.api'

export const classKeys = {
  all: ['classes'] as const,
  types: () => [...classKeys.all, 'types'] as const,
  categories: () => [...classKeys.all, 'categories'] as const,
  rooms: () => [...classKeys.all, 'rooms'] as const,
  schedules: () => [...classKeys.all, 'schedules'] as const,
}

export const classTypesQuery = () => queryOptions({ queryKey: classKeys.types(), queryFn: listClassTypes })
export const roomsQuery = () => queryOptions({ queryKey: classKeys.rooms(), queryFn: listRooms })
export const schedulesQuery = () => queryOptions({ queryKey: classKeys.schedules(), queryFn: listSchedules })
export const classCategoriesQuery = () => queryOptions({ queryKey: classKeys.categories(), queryFn: listClassCategories })
