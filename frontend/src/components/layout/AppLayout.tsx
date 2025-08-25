'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '@/stores/ui-store'
import { useCustomerStore } from '@/stores/customer-store'

interface AppLayoutProps {
  children: React.ReactNode
  variant?: 'default' | 'fullwidth' | 'centered'
}

function AppLayout({ children, variant = 'default' }: AppLayoutProps) {
  const { theme } = useUIStore()
  const { currentCustomer } = useCustomerStore()

  return (
    <div data-testid="app-layout" className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-background">
        <Sidebar data-testid="sidebar" className="shrink-0" />
        <div className="flex-1 flex flex-col">
          <Header data-testid="header" />
          <main data-testid="main-content" className="flex-1 overflow-auto">
            {currentCustomer && (
              <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 border-b">
                Current Customer: {currentCustomer.name}
              </div>
            )}
            <div className={`p-6 ${variant === 'fullwidth' ? 'w-full' : variant === 'centered' ? 'max-w-6xl mx-auto' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Default export
export default AppLayout

// Named export for test compatibility
export { AppLayout }