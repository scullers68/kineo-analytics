'use client'

import Sidebar from './Sidebar'
import { useUIStore } from '@/stores/ui-store'
import { useCustomerStore } from '@/stores/customer-store'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useUIStore()
  const { currentCustomer } = useCustomerStore()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="shrink-0" />
        <main className="flex-1 overflow-auto">
          {currentCustomer && (
            <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 border-b">
              Current Customer: {currentCustomer.name}
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}