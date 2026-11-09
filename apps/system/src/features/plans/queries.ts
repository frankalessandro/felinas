import { queryOptions } from '@tanstack/react-query'
import { listCategories, listPlans } from './api/plans.api'

export const planKeys = {
  all: ['plans'] as const,
  list: () => [...planKeys.all, 'list'] as const,
  categories: () => [...planKeys.all, 'categories'] as const,
}

export const plansQuery = () => queryOptions({ queryKey: planKeys.list(), queryFn: listPlans })

export const categoriesQuery = () => queryOptions({ queryKey: planKeys.categories(), queryFn: listCategories })
