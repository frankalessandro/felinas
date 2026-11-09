import { ConfirmDialog } from '@/components/ui'
import { useApproveAdmin } from '../hooks/useUserMutations'
import type { ApprovalRequest } from '../types'
import { ApproveStudentDialog } from './ApproveStudentDialog'
import { ApproveTeacherDialog } from './ApproveTeacherDialog'

interface ApprovalDialogsProps {
  request: ApprovalRequest | null
  onClose: () => void
}

/** Muestra el diálogo que corresponde al rol elegido. Alumna y profe piden datos; admin solo confirma. */
export function ApprovalDialogs({ request, onClose }: ApprovalDialogsProps) {
  const approveAdmin = useApproveAdmin()
  if (!request) return null
  const { profile, role } = request
  const name = profile.full_name ?? profile.email ?? 'esta cuenta'

  if (role === 'student') return <ApproveStudentDialog key={profile.id} profile={profile} onClose={onClose} />
  if (role === 'teacher') return <ApproveTeacherDialog key={profile.id} profile={profile} onClose={onClose} />

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`¿Dar acceso de admin a ${name}?`}
      description="Un admin ve y modifica todo: alumnas, planes, asistencia, reportes y otros usuarios. Solo hazlo con personas de confianza."
      confirmLabel="Sí, hacer admin"
      tone="danger"
      onConfirm={() => approveAdmin.mutateAsync(profile.id).then(() => undefined, () => undefined)}
    />
  )
}
