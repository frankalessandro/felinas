import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message = 'Algo salió mal. Inténtalo de nuevo.', onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-6 py-10 text-center', className)}>
      <TriangleAlert className="size-8 text-danger" aria-hidden />
      <p className="max-w-sm text-sm text-fg">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
