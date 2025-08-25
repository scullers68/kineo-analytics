'use client'

import { useThemeStore, Theme } from '@/stores/theme-store'
import Button from '@/components/ui/Button'

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'button'
  className?: string
}

export default function ThemeToggle({ 
  variant = 'icon',
  className = '' 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore()

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          p-2 rounded-lg
          text-gray-500 hover:text-gray-900
          dark:text-gray-400 dark:hover:text-white
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors duration-200
          ${className}
        `}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
    )
  }

  if (variant === 'dropdown') {
    const themes: { value: Theme; label: string; icon: string }[] = [
      { value: 'light', label: 'Light', icon: '☀️' },
      { value: 'dark', label: 'Dark', icon: '🌙' },
      { value: 'system', label: 'System', icon: '💻' }
    ]

    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="
            appearance-none bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-md px-3 py-2 pr-8
            text-sm text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
          "
        >
          {themes.map(({ value, label, icon }) => (
            <option key={value} value={value}>
              {icon} {label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <div className={`flex gap-1 ${className}`}>
        <Button
          variant={theme === 'light' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
        >
          ☀️ Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
        >
          🌙 Dark
        </Button>
        <Button
          variant={theme === 'system' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme('system')}
        >
          💻 Auto
        </Button>
      </div>
    )
  }

  return null
}