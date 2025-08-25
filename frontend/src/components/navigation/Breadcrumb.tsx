'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  className?: string
  maxItems?: number
}

export default function Breadcrumb({ 
  items, 
  separator = '/',
  className = '',
  maxItems = 5
}: BreadcrumbProps) {
  // If too many items, show first item, ellipsis, and last few items
  const displayItems = items.length > maxItems 
    ? [
        items[0],
        { label: '...', current: false },
        ...items.slice(-(maxItems - 2))
      ]
    : items

  return (
    <nav className={clsx('breadcrumb', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.label === '...'
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400 dark:text-gray-500">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400 px-2">
                  {item.label}
                </span>
              ) : item.href && !item.current && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                >
                  {item.icon && (
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className={clsx(
                  'flex items-center gap-1',
                  isLast || item.current
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                )}>
                  {item.icon && (
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}