import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  handle: string
  name: string
  avatar?: string
  bio?: string
}

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      signOut: () => set({ token: null, user: null }),
    }),
    {
      name: 'daira-auth',
      // Persist only non-sensitive data; do NOT store tokens in localStorage to avoid XSS token exposure
      partialize: (state) => ({ user: state.user }),
    }
  )
)
