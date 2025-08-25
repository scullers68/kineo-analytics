'use client'

import { ReactNode } from 'react'
import { useUIStore } from '@/stores/ui-store'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  className?: string
}

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard',
  className = '' 
}: DashboardLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className={`dashboard-layout min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className={`flex flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
            <div className="dashboard-content">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}