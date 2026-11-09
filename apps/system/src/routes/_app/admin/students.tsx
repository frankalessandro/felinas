import { createFileRoute, Outlet } from '@tanstack/react-router'

/** Layout de /admin/students: la lista vive en `students.index` y la ficha en `students.$studentId`. */
export const Route = createFileRoute('/_app/admin/students')({
  component: Outlet,
})
