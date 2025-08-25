'use client'

import Link from 'next/link'
import { useUIStore } from '@/stores/ui-store'

interface SidebarProps {
  className?: string
  'data-testid'?: string
}

export default function Sidebar({ className = '', 'data-testid': testId }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const isCollapsed = sidebarCollapsed
  const navigation = [
    { name: 'Dashboard', href: '/', current: true },
    { name: 'Analytics', href: '/analytics', current: false },
    { name: 'Reports', href: '/reports', current: false },
    { name: 'Settings', href: '/settings', current: false },
  ]

  return (
    <div data-testid={testId} className={`bg-gray-800 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className}`}>
      <div className="flex h-16 items-center justify-between px-4">
        <h2 className={`text-white font-bold ${isCollapsed ? 'hidden' : 'block'}`}>
          Kineo Analytics
        </h2>
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      <nav className="mt-8">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white ${
              item.current ? 'bg-gray-900 text-white' : ''
            }`}
          >
            {isCollapsed ? item.name[0] : item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}