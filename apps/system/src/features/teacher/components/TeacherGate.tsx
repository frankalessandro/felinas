import { UserRoundX } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { useCurrentTeacher } from '../hooks/useCurrentTeacher'
import type { Teacher } from '../types'

interface TeacherGateProps {
  children: (teacher: Teacher) => ReactNode
}

/** Resuelve la ficha de profe de la cuenta; si no está vinculada muestra un aviso en vez de pantallas vacías. */
export function TeacherGate({ children }: TeacherGateProps) {
  const { data: teacher, isLoading, error, refetch } = useCurrentTeacher()

  if (isLoading) {
    return (
      <div aria-busy className="flex flex-col gap-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }
  if (error) return <ErrorState message={error.message} onRetry={() => void refetch()} />
  if (!teacher) {
    return (
      <EmptyState
        icon={UserRoundX}
        title="Cuenta sin vincular"
        description="Tu cuenta aún no está vinculada a un perfil de profesor. Habla con la administración."
      />
    )
  }
  return <>{children(teacher)}</>
}
