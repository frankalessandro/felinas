import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { UserRole } from '@/features/auth/types'

interface DevViewState {
  /** Rol con el que el desarrollador está viendo la app (`null` = su rol real). */
  viewAs: UserRole | null
  /** Profe "suplantado" en la vista de profe. */
  teacherId: string | null
  setView: (viewAs: UserRole, teacherId?: string | null) => void
  reset: () => void
}

// localStorage puede no existir o lanzar (modo privado, bloqueos): en ese caso la vista no persiste y ya.
const safeStorage = createJSONStorage(() => {
  try {
    return window.localStorage
  } catch {
    return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }
  }
})

export const useDevViewStore = create<DevViewState>()(
  persist(
    (set) => ({
      viewAs: null,
      teacherId: null,
      setView: (viewAs, teacherId = null) => set({ viewAs, teacherId }),
      reset: () => set({ viewAs: null, teacherId: null }),
    }),
    { name: 'felinas-dev-view', storage: safeStorage },
  ),
)
