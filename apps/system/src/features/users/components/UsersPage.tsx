import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, PageHeader, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { usersQuery } from '../queries'
import type { ApprovalRequest } from '../types'
import { AllUsersTab } from './AllUsersTab'
import { ApprovalDialogs } from './ApprovalDialogs'
import { PendingTab } from './PendingTab'

export type UsersTab = 'pending' | 'all'

interface UsersPageProps {
  tab: UsersTab
  onTabChange: (tab: UsersTab) => void
}

export function UsersPage({ tab, onTabChange }: UsersPageProps) {
  const query = useQuery(usersQuery())
  const [request, setRequest] = useState<ApprovalRequest | null>(null)

  const users = query.data ?? []
  const pending = users.filter((profile) => profile.status === 'pending')
  const askApproval = (profile: ApprovalRequest['profile'], role: ApprovalRequest['role']) => setRequest({ profile, role })

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        icon={ShieldCheck}
        title="Solicitudes y usuarios"
        description="Aprueba cuentas nuevas y define su rol. También puedes desactivar cuentas o cambiar roles."
      />

      <AsyncContent isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        <Tabs value={tab} onValueChange={(value) => onTabChange(value as UsersTab)}>
          <TabsList aria-label="Secciones de usuarios">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pendientes
              {pending.length > 0 && (
                <span
                  aria-label={`${pending.length} pendientes`}
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-rosa px-1.5 text-xs font-bold text-white"
                >
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Todos los usuarios</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <PendingTab users={pending} onApprove={askApproval} />
          </TabsContent>
          <TabsContent value="all">
            <AllUsersTab users={users} onChangeRole={askApproval} />
          </TabsContent>
        </Tabs>
      </AsyncContent>

      <ApprovalDialogs request={request} onClose={() => setRequest(null)} />
    </div>
  )
}
