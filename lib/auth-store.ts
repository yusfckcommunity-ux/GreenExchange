"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  userId: string | null
  isAuthenticated: boolean
  login: (userId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: false,
      login: (userId: string) => set({ userId, isAuthenticated: true }),
      logout: () => set({ userId: null, isAuthenticated: false }),
    }),
    {
      name: 'greenexchange-auth',
    }
  )
)
