import { createFileRoute } from '@tanstack/react-router'
import { TeacherGate } from '@/features/teacher/components/TeacherGate'
import { TeacherHome } from '@/features/teacher/components/TeacherHome'

export const Route = createFileRoute('/_app/teacher/')({
  component: () => <TeacherGate>{(teacher) => <TeacherHome teacher={teacher} />}</TeacherGate>,
})
