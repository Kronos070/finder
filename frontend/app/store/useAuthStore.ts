import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserI } from '~/types/types'

interface AuthState {
  user: UserI | null
  isAuth: boolean
  setUser: (user: UserI | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user) => set({ user, isAuth: !!user }),
      logout: () => set({ user: null, isAuth: false }),
    }),
    {
      name: 'auth', // Zustand сам сохранит это в LocalStorage
    }
  )
)