'use client'

import { useUIStore } from '@/stores/ui-store'

interface HeaderProps {
  children?: React.ReactNode
  className?: string
  sticky?: boolean
  'data-testid'?: string
}

function Header({ 
  children, 
  className = '', 
  sticky = false,
  'data-testid': testId
}: HeaderProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <header 
      data-testid={testId}
      className={`
        h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
        flex items-center justify-between px-6
        ${sticky ? 'sticky top-0 z-10' : ''}
        transition-all duration-300
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
        lg:ml-0
        ${className}
      `}
    >
      {children}
    </header>
  )
}

// Default export
export default Header

// Named export for test compatibility  
export { Header }