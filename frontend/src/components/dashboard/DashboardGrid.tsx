'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface DashboardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12'
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4', 
  lg: 'gap-6',
  xl: 'gap-8'
}

export default function DashboardGrid({ 
  children,
  columns = 3,
  gap = 'md',
  className = ''
}: DashboardGridProps) {
  return (
    <div className={clsx(
      'dashboard-grid grid',
      columnClasses[columns],
      gapClasses[gap],
      'auto-rows-min',
      className
    )}>
      {children}
    </div>
  )
}