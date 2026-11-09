import type { LinkProps } from '@tanstack/react-router'
import {
  BarChart3,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  HandCoins,
  History,
  Home,
  Layers,
  type LucideIcon,
  Ticket,
  UserCheck,
  Users,
  UserRound,
} from 'lucide-react'
import type { UserRole } from '@/features/auth/types'

export interface NavItem {
  to: LinkProps['to']
  label: string
  icon: LucideIcon
  /** Solo marca activo en coincidencia exacta (para las rutas índice). */
  exact?: boolean
  /** Acción estrella del rol: en móvil va como botón central elevado del dock. */
  primary?: boolean
  /** Grupo en la barra lateral. */
  section: NavSection
}

export type NavSection = 'general' | 'negocio' | 'academia'

export const NAV_SECTION_LABEL: Record<NavSection, string> = {
  general: 'General',
  negocio: 'Negocio',
  academia: 'Academia',
}

export const NAVIGATION: Record<UserRole, NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Inicio', icon: Home, exact: true, section: 'general' },
    { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays, section: 'general' },
    { to: '/admin/attendance', label: 'Asistencia', icon: ClipboardCheck, primary: true, section: 'general' },
    { to: '/admin/subscriptions', label: 'Membresías', icon: HandCoins, section: 'negocio' },
    { to: '/admin/reports', label: 'Reportes', icon: BarChart3, section: 'negocio' },
    { to: '/admin/students', label: 'Alumnas', icon: Users, section: 'academia' },
    { to: '/admin/teachers', label: 'Profes', icon: UserRound, section: 'academia' },
    { to: '/admin/classes', label: 'Clases', icon: Layers, section: 'academia' },
    { to: '/admin/plans', label: 'Planes', icon: Ticket, section: 'academia' },
    { to: '/admin/users', label: 'Solicitudes', icon: UserCheck, section: 'academia' },
  ],
  teacher: [
    { to: '/teacher', label: 'Inicio', icon: Home, exact: true, section: 'general' },
    { to: '/teacher/agenda', label: 'Mi agenda', icon: CalendarDays, primary: true, section: 'general' },
    { to: '/teacher/students', label: 'Alumnas', icon: Users, section: 'general' },
  ],
  student: [
    { to: '/student', label: 'Inicio', icon: Home, exact: true, section: 'general' },
    { to: '/student/book', label: 'Reservar', icon: CalendarPlus, primary: true, section: 'general' },
    { to: '/student/history', label: 'Historial', icon: History, section: 'general' },
    { to: '/student/plan', label: 'Mi plan', icon: Ticket, section: 'general' },
    { to: '/student/profile', label: 'Perfil', icon: UserRound, section: 'general' },
  ],
}

/** Ítems del dock móvil además de la acción estrella; el resto vive en el menú completo. */
export const MOBILE_DOCK_SIDE_ITEMS = 2

/** Para el dock móvil: la acción estrella al centro y dos ítems a cada lado. */
export function getDockItems(items: NavItem[]): { left: NavItem[]; primary: NavItem | null; right: NavItem[] } {
  const primary = items.find((item) => item.primary) ?? null
  const others = items.filter((item) => item !== primary)
  return {
    left: others.slice(0, MOBILE_DOCK_SIDE_ITEMS),
    primary,
    right: others.slice(MOBILE_DOCK_SIDE_ITEMS, MOBILE_DOCK_SIDE_ITEMS * 2),
  }
}

/** Agrupa los ítems por sección, conservando el orden. */
export function groupBySection(items: NavItem[]): { section: NavSection; items: NavItem[] }[] {
  const groups: { section: NavSection; items: NavItem[] }[] = []
  for (const item of items) {
    const group = groups.find((entry) => entry.section === item.section)
    if (group) group.items.push(item)
    else groups.push({ section: item.section, items: [item] })
  }
  return groups
}
