import { Shapes } from 'lucide-react'
import { PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { ClassTypesTab } from './ClassTypesTab'
import { RoomsTab } from './RoomsTab'
import { SchedulesTab } from './SchedulesTab'

export type ClassesTab = 'styles' | 'schedules' | 'rooms'

interface ClassesPageProps {
  tab: ClassesTab
  onTabChange: (tab: ClassesTab) => void
}

export function ClassesPage({ tab, onTabChange }: ClassesPageProps) {
  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader icon={Shapes} title="Clases" description="Estilos, horarios semanales y salones que dan forma a la agenda." />
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as ClassesTab)}>
        <TabsList aria-label="Secciones de clases">
          <TabsTrigger value="styles">Estilos</TabsTrigger>
          <TabsTrigger value="schedules">Horarios</TabsTrigger>
          <TabsTrigger value="rooms">Salones</TabsTrigger>
        </TabsList>
        <TabsContent value="styles">
          <ClassTypesTab />
        </TabsContent>
        <TabsContent value="schedules">
          <SchedulesTab />
        </TabsContent>
        <TabsContent value="rooms">
          <RoomsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
