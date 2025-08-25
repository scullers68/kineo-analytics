'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  systemTheme: 'light' | 'dark'
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  setSystemTheme: (systemTheme: 'light' | 'dark') => void
  toggleTheme: () => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
  if (theme === 'system') return systemTheme
  return theme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: getSystemTheme(),
      resolvedTheme: resolveTheme('system', getSystemTheme()),
      
      setTheme: (theme: Theme) => {
        const { systemTheme } = get()
        const resolvedTheme = resolveTheme(theme, systemTheme)
        
        set({ theme, resolvedTheme })
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(resolvedTheme)
        }
      },
      
      setSystemTheme: (systemTheme: 'light' | 'dark') => {
        const { theme } = get()
        const resolvedTheme = resolveTheme(theme, systemTheme)
        
        set({ systemTheme, resolvedTheme })
        
        // Apply theme to document if using system theme
        if (theme === 'system' && typeof window !== 'undefined') {
          const root = document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(resolvedTheme)
        }
      },
      
      toggleTheme: () => {
        const { theme, resolvedTheme } = get()
        
        if (theme === 'system') {
          // If currently system, toggle to opposite of resolved theme
          get().setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        } else {
          // If currently light or dark, toggle between them
          get().setTheme(theme === 'dark' ? 'light' : 'dark')
        }
      }
    }),
    {
      name: 'kineo-theme-store',
      partialize: (state) => ({ theme: state.theme })
    }
  )
)