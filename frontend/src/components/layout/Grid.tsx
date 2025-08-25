'use client'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

export default function Grid({ 
  children, 
  className = '',
  cols = 1,
  gap = 'md',
  responsive = true
}: GridProps) {
  const responsiveClasses = responsive 
    ? `grid-cols-1 sm:grid-cols-2 lg:${colsClasses[cols]}`
    : colsClasses[cols]

  return (
    <div 
      className={`
        grid
        ${responsive ? responsiveClasses : colsClasses[cols]}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface GridItemProps {
  children: React.ReactNode
  className?: string
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  spanSm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  spanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
}

const spanClasses = {
  1: 'col-span-1',
  2: 'col-span-2', 
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  12: 'col-span-12'
}

export function GridItem({ 
  children, 
  className = '',
  span = 1,
  spanSm,
  spanLg
}: GridItemProps) {
  const spanClass = spanClasses[span]
  const spanSmClass = spanSm ? `sm:${spanClasses[spanSm]}` : ''
  const spanLgClass = spanLg ? `lg:${spanClasses[spanLg]}` : ''

  return (
    <div className={`${spanClass} ${spanSmClass} ${spanLgClass} ${className}`}>
      {children}
    </div>
  )
}