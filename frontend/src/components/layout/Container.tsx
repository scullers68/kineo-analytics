'use client'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
}

const sizeClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
}

export default function Container({ 
  children, 
  className = '',
  size = 'lg',
  centered = true 
}: ContainerProps) {
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${centered ? 'mx-auto' : ''}
        px-4 sm:px-6 lg:px-8
        ${className}
      `}
    >
      {children}
    </div>
  )
}