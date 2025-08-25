'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

interface NavigationItem {
  label: string
  href: string
  icon?: ReactNode
  badge?: string | number
  children?: NavigationItem[]
}

interface MainNavigationProps {
  items: NavigationItem[]
  className?: string
  collapsed?: boolean
}

function NavigationLink({ 
  item, 
  isActive, 
  collapsed = false 
}: { 
  item: NavigationItem
  isActive: boolean
  collapsed?: boolean 
}) {
  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
        isActive
          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        collapsed && 'justify-center px-2'
      )}
    >
      {item.icon && (
        <span className="flex-shrink-0">
          {item.icon}
        </span>
      )}
      
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className={clsx(
              'px-2 py-1 text-xs rounded-full',
              isActive
                ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export default function MainNavigation({ 
  items, 
  className = '',
  collapsed = false 
}: MainNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={clsx('main-navigation', className)}>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname && pathname.startsWith(item.href + '/'))
          
          return (
            <li key={item.href}>
              <NavigationLink 
                item={item} 
                isActive={!!isActive}
                collapsed={collapsed}
              />
              
              {item.children && !collapsed && isActive && (
                <ul className="ml-6 mt-2 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-4">
                  {item.children.map((child) => {
                    const childIsActive = pathname === child.href
                    
                    return (
                      <li key={child.href}>
                        <NavigationLink 
                          item={child} 
                          isActive={childIsActive}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}