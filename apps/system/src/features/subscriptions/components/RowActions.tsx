import { Link } from '@tanstack/react-router'
import { MoreVertical, Plus, RefreshCw, Snowflake, UserRound, Wallet } from 'lucide-react'
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import type { MonthKey } from '../months'
import { buildReminderMessage } from '../reminders'
import { getPrimaryAction, getRenewSourceId } from '../rowMeta'
import type { SubscriptionRow } from '../types'

export interface RowHandlers {
  onRenew: (row: SubscriptionRow) => void
  onPay: (row: SubscriptionRow) => void
  onAssign: (row: SubscriptionRow) => void
  onFreeze: (row: SubscriptionRow) => void
  /** Alumna cuyo plan se está renovando ahora mismo (deshabilita y muestra carga). */
  renewingStudentId: string | null
}

interface RowActionsProps {
  row: SubscriptionRow
  month: MonthKey
  handlers: RowHandlers
  className?: string
}

const PRIMARY_LABEL = {
  renew: { label: 'Renovar', icon: RefreshCw },
  pay: { label: 'Registrar pago', icon: Wallet },
  assign: { label: 'Asignar plan', icon: Plus },
} as const

/** Acciones rápidas de una fila: la principal según su situación, recordatorio por WhatsApp y el resto en un menú. */
export function RowActions({ row, month, handlers, className }: RowActionsProps) {
  const primary = getPrimaryAction(row)
  const canRenew = getRenewSourceId(row) !== null
  const canPay = row.studentPlanId !== null
  const isRenewing = handlers.renewingStudentId === row.studentId

  function runPrimary() {
    if (primary === 'renew') handlers.onRenew(row)
    if (primary === 'pay') handlers.onPay(row)
    if (primary === 'assign') handlers.onAssign(row)
  }

  const PrimaryIcon = primary ? PRIMARY_LABEL[primary].icon : null

  return (
    <div className={className ?? 'flex items-center gap-2'}>
      {primary && PrimaryIcon && (
        <Button
          size="md"
          loading={primary === 'renew' && isRenewing}
          disabled={handlers.renewingStudentId !== null}
          onClick={runPrimary}
          className="flex-1 sm:flex-none"
        >
          <PrimaryIcon className="size-4" aria-hidden /> {PRIMARY_LABEL[primary].label}
        </Button>
      )}
      <WhatsAppButton phone={row.phone} name={row.fullName} message={buildReminderMessage(row, month) ?? undefined} size="icon" label="Recordar" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton aria-label={`Más acciones para ${row.fullName}`}>
            <MoreVertical className="size-5" aria-hidden />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {canPay && primary !== 'pay' && (
            <DropdownMenuItem onSelect={() => handlers.onPay(row)}>
              <Wallet className="size-4" aria-hidden /> Registrar pago
            </DropdownMenuItem>
          )}
          {canRenew && primary !== 'renew' && (
            <DropdownMenuItem onSelect={() => handlers.onRenew(row)}>
              <RefreshCw className="size-4" aria-hidden /> Renovar para el mes siguiente
            </DropdownMenuItem>
          )}
          {primary !== 'assign' && (
            <DropdownMenuItem onSelect={() => handlers.onAssign(row)}>
              <Plus className="size-4" aria-hidden /> Asignar plan
            </DropdownMenuItem>
          )}
          {row.studentPlanId && (
            <DropdownMenuItem onSelect={() => handlers.onFreeze(row)}>
              <Snowflake className="size-4" aria-hidden /> {row.isFrozen ? 'Descongelar plan' : 'Congelar plan'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/admin/students/$studentId" params={{ studentId: row.studentId }} search={{ tab: 'plans' }}>
              <UserRound className="size-4" aria-hidden /> Ver alumna
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
