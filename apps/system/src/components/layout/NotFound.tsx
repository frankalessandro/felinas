import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { Illustration } from '@/components/illustrations/Illustration'
import { buttonVariants } from '@/components/ui'

export function NotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Illustration name="search" className="h-36" />
        <p className="text-xs font-semibold text-rosa-hover">Error 404</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">No encontramos esta página</h1>
        <p className="text-sm text-fg-muted">La dirección no existe o cambió de lugar. Vuelve al inicio para seguir.</p>
        <Link to="/" className={buttonVariants({ size: 'lg', className: 'mt-3' })}>
          <Home className="size-4" aria-hidden />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
