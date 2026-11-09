import type { ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

interface AsyncContentProps {
  isLoading: boolean
  error?: Error | null
  isEmpty?: boolean
  onRetry?: () => void
  loading?: ReactNode
  empty?: ReactNode
  children: ReactNode
}

/** Estandariza los estados loading → error → empty → contenido. */
export function AsyncContent({ isLoading, error, isEmpty = false, onRetry, loading, empty, children }: AsyncContentProps) {
  if (isLoading) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {loading ?? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        )}
      </div>
    )
  }
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />
  if (isEmpty) return <>{empty ?? <EmptyState title="Nada por aquí todavía" />}</>
  return <>{children}</>
}
