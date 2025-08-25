import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { AuthStore, User } from '@/types/store'

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        refreshToken: null,

        // Actions
        login: (user: User, token: string, refreshToken: string) => {
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }, false, 'auth/login')
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          }, false, 'auth/logout')
        },

        refreshAuth: async () => {
          const { refreshToken } = get()
          if (!refreshToken) {
            get().logout()
            return
          }

          set({ isLoading: true }, false, 'auth/refresh-start')

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            })

            if (!response.ok) {
              throw new Error('Token refresh failed')
            }

            const data = await response.json()
            
            set({
              token: data.token,
              refreshToken: data.refreshToken,
              isLoading: false,
              error: null,
            }, false, 'auth/refresh-success')
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false,
            }, false, 'auth/refresh-error')
            get().logout()
          }
        },

        clearError: () => {
          set({ error: null }, false, 'auth/clear-error')
        },

        updateUser: (userUpdate: Partial<User>) => {
          const { user } = get()
          if (!user) return

          set({
            user: { ...user, ...userUpdate }
          }, false, 'auth/update-user')
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
)

// Expose persistence configuration for testing
Object.assign(useAuthStore, {
  persistConfig: {
    name: 'auth-storage',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
  getServerState: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null,
    refreshToken: null,
  })
})

export { useAuthStore }