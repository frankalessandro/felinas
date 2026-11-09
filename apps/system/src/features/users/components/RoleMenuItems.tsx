import { GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui'
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '../constants'
import type { UserRole } from '../types'

const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  student: UserRound,
  teacher: GraduationCap,
  admin: ShieldCheck,
}

interface RoleMenuItemsProps {
  /** Rol actual: se omite de la lista al cambiar de rol. */
  exclude?: UserRole
  onSelect: (role: UserRole) => void
}

export function RoleMenuItems({ exclude, onSelect }: RoleMenuItemsProps) {
  return (
    <>
      {ASSIGNABLE_ROLES.filter((role) => role !== exclude).map((role) => {
        const Icon = ROLE_ICONS[role]
        return (
          <DropdownMenuItem key={role} tone={role === 'admin' ? 'danger' : 'default'} onSelect={() => onSelect(role)}>
            <Icon className="size-4" aria-hidden /> {ROLE_LABELS[role]}
          </DropdownMenuItem>
        )
      })}
    </>
  )
}
