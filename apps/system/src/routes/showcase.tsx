import { createFileRoute, notFound } from '@tanstack/react-router'
import { Showcase } from '@/components/ui/__showcase__/Showcase'

// Solo en desarrollo: vitrina del sistema de componentes.
export const Route = createFileRoute('/showcase')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: Showcase,
})
