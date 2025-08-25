'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface WidgetContainerProps {
  children: ReactNode
  title?: string
  description?: string
  loading?: boolean
  error?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'min-h-32',
  md: 'min-h-48', 
  lg: 'min-h-64',
  xl: 'min-h-80'
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
}

export default function WidgetContainer({
  children,
  title,
  description,
  loading = false,
  error,
  className = '',
  size = 'md',
  padding = 'md'
}: WidgetContainerProps) {
  return (
    <div className={clsx(
      'widget-container',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      'rounded-lg shadow-sm',
      sizeClasses[size],
      'transition-all duration-200 hover:shadow-md',
      className
    )}>
      {(title || description) && (
        <div className="widget-header border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={clsx('widget-content', paddingClasses[padding])}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-red-600 dark:text-red-400 text-sm text-center">
              <div className="mb-2">⚠️</div>
              <div>{error}</div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}