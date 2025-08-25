'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import Button from '@/components/ui/Button'
import MainNavigation from './MainNavigation'

interface NavigationItem {
  label: string
  href: string
  icon?: ReactNode
  badge?: string | number
  children?: NavigationItem[]
}

interface CollapsibleSidebarProps {
  items: NavigationItem[]
  collapsed: boolean
  onToggle: () => void
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export default function CollapsibleSidebar({
  items,
  collapsed,
  onToggle,
  header,
  footer,
  className = ''
}: CollapsibleSidebarProps) {
  return (
    <aside className={clsx(
      'collapsible-sidebar fixed left-0 top-0 h-full z-40',
      'bg-white dark:bg-gray-900',
      'border-r border-gray-200 dark:border-gray-800',
      'transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={clsx(
          'flex items-center justify-between p-4',
          'border-b border-gray-200 dark:border-gray-800',
          collapsed && 'justify-center px-2'
        )}>
          {!collapsed && header && (
            <div className="flex-1">
              {header}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={clsx(
              'flex-shrink-0 p-2',
              collapsed && 'w-full justify-center'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={clsx(
                'w-4 h-4 transition-transform duration-200',
                collapsed ? 'rotate-180' : ''
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <MainNavigation 
            items={items} 
            collapsed={collapsed}
          />
        </div>

        {/* Footer */}
        {footer && (
          <div className={clsx(
            'border-t border-gray-200 dark:border-gray-800 p-4',
            collapsed && 'px-2'
          )}>
            {footer}
          </div>
        )}
      </div>
      
      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </aside>
  )
}