import { createFileRoute } from '@tanstack/react-router'
import { TeacherGate } from '@/features/teacher/components/TeacherGate'
import { TeacherStudents } from '@/features/teacher/components/TeacherStudents'

export const Route = createFileRoute('/_app/teacher/students')({
  component: () => <TeacherGate>{(teacher) => <TeacherStudents teacher={teacher} />}</TeacherGate>,
})
