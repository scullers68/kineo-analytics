'use client'

import React, { useMemo } from 'react'
import { clsx } from 'clsx'
import { useDrillDown, BreadcrumbItem } from '../../contexts/DrillDownProvider'

interface DrillDownBreadcrumbProps {
  className?: string
  separator?: React.ReactNode
  maxItems?: number
  showLevelIcons?: boolean
  onBreadcrumbClick?: (item: BreadcrumbItem, level: string) => void
}

const levelIcons: Record<string, string> = {
  department: '🏢',
  team: '👥', 
  individual: '👤'
}

const levelLabels: Record<string, string> = {
  department: 'Department',
  team: 'Team',
  individual: 'Individual'
}

export const DrillDownBreadcrumb: React.FC<DrillDownBreadcrumbProps> = ({
  className = '',
  separator = '/',
  maxItems = 4,
  showLevelIcons = true,
  onBreadcrumbClick
}) => {
  const { state } = useDrillDown()

  // Generate breadcrumb items based on current navigation state
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = []

    // Always show department level
    items.push({
      label: state.department ? `${levelLabels.department}: ${state.department}` : levelLabels.department,
      level: 'department',
      onClick: () => {}
    })

    // Add team level if we're at team or individual level
    if (state.level === 'team' || state.level === 'individual') {
      items.push({
        label: state.team ? `${levelLabels.team}: ${state.team}` : levelLabels.team,
        level: 'team',
        onClick: () => {}
      })
    }

    // Add individual level if we're at individual level
    if (state.level === 'individual') {
      items.push({
        label: state.individual ? `${levelLabels.individual}: ${state.individual}` : levelLabels.individual,
        level: 'individual',
        onClick: () => {}
      })
    }

    return items
  }, [state.level, state.department, state.team, state.individual])

  // Handle truncation for long paths
  const displayItems = useMemo(() => {
    if (breadcrumbItems.length <= maxItems) return breadcrumbItems
    
    return [
      breadcrumbItems[0],
      {
        label: '...',
        level: 'ellipsis',
        onClick: () => {}
      },
      ...breadcrumbItems.slice(-(maxItems - 2))
    ]
  }, [breadcrumbItems, maxItems])

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.level === 'ellipsis') return
    
    // Call custom handler if provided
    if (onBreadcrumbClick) {
      onBreadcrumbClick(item, item.level)
    }
    
    // Call the item's onClick handler
    item.onClick()
  }

  if (displayItems.length === 0) {
    return null
  }

  return (
    <nav 
      className={clsx('drill-down-breadcrumb', className)} 
      aria-label="Drill-down navigation breadcrumb"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isEllipsis = item.level === 'ellipsis'
          const isClickable = !isEllipsis && !isLast
          
          return (
            <li key={`${item.level}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400 dark:text-gray-500">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400 px-2">
                  {item.label}
                </span>
              ) : (
                <span
                  className={clsx(
                    'flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200',
                    isClickable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400',
                    isLast 
                      ? 'text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-800' 
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                  onClick={() => handleItemClick(item, index)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      handleItemClick(item, index)
                    }
                  }}
                >
                  {showLevelIcons && levelIcons[item.level] && (
                    <span className="text-base" role="img" aria-label={`${item.level} level`}>
                      {levelIcons[item.level]}
                    </span>
                  )}
                  <span className="truncate max-w-32 sm:max-w-48">
                    {item.label}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default DrillDownBreadcrumb