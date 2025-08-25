import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { UIStore, Notification } from '@/types/store'

const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        theme: 'light',
        sidebarCollapsed: false,
        notifications: [],
        modals: {},
        loading: {},

        // Actions
        toggleTheme: () => {
          const currentTheme = get().theme
          const newTheme = currentTheme === 'light' ? 'dark' : 'light'
          
          set({ theme: newTheme }, false, 'ui/toggle-theme')
          
          // Update document class for CSS theming
          if (typeof document !== 'undefined') {
            document.documentElement.className = newTheme
          }
        },

        toggleSidebar: () => {
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            false,
            'ui/toggle-sidebar'
          )
        },

        addNotification: (notification: Notification) => {
          const { notifications } = get()
          
          // Ensure unique IDs
          const newNotification = {
            ...notification,
            id: notification.id || `notification-${Date.now()}-${Math.random()}`
          }
          
          set({
            notifications: [...notifications, newNotification]
          }, false, 'ui/add-notification')

          // Auto-remove notification after duration
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(newNotification.id)
            }, newNotification.duration)
          }
        },

        removeNotification: (id: string) => {
          set(
            (state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }),
            false,
            'ui/remove-notification'
          )
        },

        openModal: (modalId: string) => {
          set(
            (state) => ({
              modals: { ...state.modals, [modalId]: true }
            }),
            false,
            'ui/open-modal'
          )
        },

        closeModal: (modalId: string) => {
          set(
            (state) => ({
              modals: { ...state.modals, [modalId]: false }
            }),
            false,
            'ui/close-modal'
          )
        },

        setLoading: (key: string, loading: boolean) => {
          set(
            (state) => ({
              loading: { ...state.loading, [key]: loading }
            }),
            false,
            'ui/set-loading'
          )
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
        onRehydrateStorage: () => (state) => {
          // Apply theme on hydration
          if (state?.theme && typeof document !== 'undefined') {
            document.documentElement.className = state.theme
          }
        }
      }
    ),
    { name: 'ui-store' }
  )
)

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  const initialTheme = useUIStore.getState().theme
  document.documentElement.className = initialTheme
}

// Add SSR hydration properties for testing
;(useUIStore as any).skipHydration = ['notifications', 'modals', 'loading']
;(useUIStore as any).onRehydrateStorage = (state: any) => {
  // Apply theme on hydration
  if (state?.theme && typeof document !== 'undefined') {
    document.documentElement.className = state.theme
  }
}

export { useUIStore }