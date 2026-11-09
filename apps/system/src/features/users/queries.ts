import { queryOptions } from '@tanstack/react-query'
import { listUsers } from './api/users.api'

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
}

export const usersQuery = () => queryOptions({ queryKey: userKeys.list(), queryFn: listUsers })
