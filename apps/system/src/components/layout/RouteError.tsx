import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Button } from '@/components/ui'
import { getErrorMessage } from '@/lib/errors'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  const retry = () => {
    reset()
    void router.invalidate()
  }

  return (
    <div className="grid min-h-[70dvh] place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <IconTile icon={TriangleAlert} tone="danger" size="lg" />
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Algo salió mal</h1>
        <p className="text-sm text-fg-muted">{getErrorMessage(error)}</p>
        <Button size="lg" className="mt-3" onClick={retry}>
          <RefreshCw className="size-4" aria-hidden />
          Reintentar
        </Button>
      </div>
    </div>
  )
}
