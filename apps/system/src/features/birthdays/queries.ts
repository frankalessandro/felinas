import { queryOptions } from '@tanstack/react-query'
import { listMonthBirthdays } from './api/birthdays.api'

export const birthdayKeys = {
  all: ['birthdays'] as const,
  month: () => [...birthdayKeys.all, 'month'] as const,
}

export const monthBirthdaysQuery = () =>
  queryOptions({
    queryKey: birthdayKeys.month(),
    queryFn: listMonthBirthdays,
  })
