import { AtSign, ChevronRight, Link2, MoreVertical, Pencil, Phone, Power } from 'lucide-react'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import {
  Avatar,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui'
import { getClassStyleIcon } from '@/features/classes/components/ClassStyleIcon'
import { cn } from '@/lib/cn'
import { getInstagramUrl, getTeacherColor, getTeacherStyles, getTeacherWeek } from '../lib'
import type { TeacherWithSchedules } from '../types'

interface TeacherCardProps {
  teacher: TeacherWithSchedules
  onOpen: () => void
  onEdit: () => void
  onToggleActive: () => void
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
      <span className="font-display text-2xl font-black leading-none tabular-nums">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-fg-subtle">{label}</span>
    </div>
  )
}

/** Los siete días de la semana: se enciende el color de la profe donde da clase. */
function WeekStrip({ teacher, color }: { teacher: TeacherWithSchedules; color: string }) {
  const week = getTeacherWeek(teacher)
  const working = week.filter((day) => day.classes > 0)
  const summary = working.length === 0 ? 'Sin días con clase' : `Da clase: ${working.map((day) => day.label).join(', ')}`
  return (
    <div role="img" aria-label={summary} className="flex justify-between gap-1">
      {week.map((day) => (
        <span
          key={day.weekday}
          aria-hidden
          className={cn(
            'grid size-8 place-items-center rounded-full text-[11px] font-bold transition-colors',
            day.classes > 0 ? 'text-white shadow-[0_0_14px_-3px_var(--teacher)]' : 'bg-surface-2 text-fg-subtle',
          )}
          style={day.classes > 0 ? { backgroundColor: color } : undefined}
        >
          {day.letter}
        </span>
      ))}
    </div>
  )
}

export function TeacherCard({ teacher, onOpen, onEdit, onToggleActive }: TeacherCardProps) {
  const color = getTeacherColor(teacher)
  const styles = getTeacherStyles(teacher)
  const activeSchedules = teacher.schedules.filter((schedule) => schedule.active)
  const days = getTeacherWeek(teacher).filter((day) => day.classes > 0).length

  return (
    <article
      style={{ ['--teacher' as string]: color }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition duration-200',
        'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--teacher)_55%,var(--color-line))] hover:shadow-[0_22px_44px_-24px_var(--teacher)] motion-reduce:hover:translate-y-0',
        !teacher.active && 'opacity-70 saturate-50',
      )}
    >
      <button type="button" onClick={onOpen} aria-label={`Ver horario y detalle de ${teacher.full_name}`} className="absolute inset-0 z-0 rounded-3xl" />

      <div
        aria-hidden
        className="relative h-28 overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${color} 60%, #12070d), color-mix(in srgb, ${color} 22%, #12070d))` }}
      >
        <span
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg, transparent 0 14px, #fff 14px 16px, transparent 16px 34px)' }}
        />
        <span className="absolute -right-10 -top-12 size-44 rounded-full opacity-60 blur-3xl" style={{ backgroundColor: color }} />
      </div>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton aria-label={`Acciones de ${teacher.full_name}`} className="text-white hover:bg-white/15">
              <MoreVertical className="size-5" aria-hidden />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="size-4" aria-hidden /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem tone={teacher.active ? 'danger' : 'default'} onSelect={onToggleActive}>
              <Power className="size-4" aria-hidden /> {teacher.active ? 'Desactivar' : 'Reactivar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pointer-events-none relative flex flex-1 flex-col gap-4 px-5 pb-5">
        <div className="-mt-12 flex items-end gap-3">
          <span className="rounded-full p-1 shadow-lg" style={{ backgroundColor: color }}>
            <Avatar name={teacher.full_name} src={teacher.photo_url} size="xl" className="size-24 border-4 border-surface text-3xl" />
          </span>
          <div className="min-w-0 pb-1">
            {!teacher.active && <p className="text-[11px] font-bold uppercase tracking-widest text-warn">Inactiva</p>}
            {teacher.profile_id && (
              <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-ok">
                <Link2 className="size-3" aria-hidden /> Cuenta vinculada
              </p>
            )}
          </div>
        </div>

        <h3 className="font-display text-2xl font-black leading-none tracking-tight">{teacher.full_name}</h3>

        <div className="flex divide-x divide-line rounded-2xl bg-surface-2/70">
          <Stat value={activeSchedules.length} label="Clases / sem" />
          <Stat value={styles.length} label="Estilos" />
          <Stat value={days} label="Días" />
        </div>

        <WeekStrip teacher={teacher} color={color} />

        <div className="flex flex-wrap gap-1.5" aria-label="Estilos que dicta">
          {styles.length === 0 ? (
            <span className="text-xs text-fg-subtle">Sin horarios activos</span>
          ) : (
            styles.map((style) => {
              const Icon = getClassStyleIcon(style.name)
              return (
                <Badge key={style.id} color={style.color}>
                  <Icon className="size-3" aria-hidden /> {style.name}
                </Badge>
              )
            })
          )}
        </div>

        <div className="pointer-events-auto relative z-10 mt-auto flex items-center gap-2 border-t border-line pt-4">
          {teacher.instagram && (
            <a
              href={getInstagramUrl(teacher.instagram)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Instagram de ${teacher.full_name}: ${teacher.instagram}`}
              className="grid size-11 place-items-center rounded-xl bg-surface-2 text-fg-muted transition hover:text-rosa-hover active:scale-95"
            >
              <AtSign className="size-5" aria-hidden />
            </a>
          )}
          {teacher.phone && (
            <>
              <WhatsAppButton phone={teacher.phone} name={teacher.full_name} size="icon" label="Escribir" />
              <a
                href={`tel:${teacher.phone}`}
                aria-label={`Llamar a ${teacher.full_name}`}
                className="grid size-11 place-items-center rounded-xl bg-surface-2 text-fg-muted transition hover:text-fg active:scale-95"
              >
                <Phone className="size-5" aria-hidden />
              </a>
            </>
          )}
          <span className="ml-auto inline-flex items-center gap-1 font-display text-sm font-semibold text-rosa-hover transition-transform group-hover:translate-x-0.5">
            Ver horario <ChevronRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  )
}
