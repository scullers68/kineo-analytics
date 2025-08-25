'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const shadowClasses = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
}

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'md',
  shadow = 'sm',
  hover = false
}: CardProps) {
  return (
    <div className={clsx(
      'card',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      'rounded-lg',
      shadowClasses[shadow],
      hover && 'transition-shadow duration-200 hover:shadow-md',
      className
    )}>
      {(title || subtitle) && (
        <div className={clsx(
          'card-header',
          'border-b border-gray-200 dark:border-gray-700',
          paddingClasses[padding]
        )}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={clsx('card-content', paddingClasses[padding])}>
        {children}
      </div>
    </div>
  )
}