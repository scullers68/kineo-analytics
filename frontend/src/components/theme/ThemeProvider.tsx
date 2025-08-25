'use client'

import { ReactNode, useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { setSystemTheme, resolvedTheme } = useThemeStore()

  useEffect(() => {
    // Initialize system theme detection
    const updateSystemTheme = () => {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setSystemTheme(systemTheme)
    }

    // Set initial system theme
    updateSystemTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateSystemTheme)

    // Apply initial theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [setSystemTheme, resolvedTheme])

  useEffect(() => {
    // Apply theme changes to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return <>{children}</>
}