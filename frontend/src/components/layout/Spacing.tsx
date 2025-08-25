'use client'

interface SpacingProps {
  children: React.ReactNode
  className?: string
  p?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  px?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  py?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  m?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  mx?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'
  my?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'
}

const paddingClasses = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12'
}

const paddingXClasses = {
  none: 'px-0',
  xs: 'px-1',
  sm: 'px-2',
  md: 'px-4',
  lg: 'px-6',
  xl: 'px-8',
  '2xl': 'px-12'
}

const paddingYClasses = {
  none: 'py-0',
  xs: 'py-1',
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-6',
  xl: 'py-8',
  '2xl': 'py-12'
}

const marginClasses = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
  '2xl': 'm-12'
}

const marginXClasses = {
  none: 'mx-0',
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
  xl: 'mx-8',
  '2xl': 'mx-12',
  auto: 'mx-auto'
}

const marginYClasses = {
  none: 'my-0',
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8',
  '2xl': 'my-12',
  auto: 'my-auto'
}

export default function Spacing({
  children,
  className = '',
  p,
  px,
  py,
  m,
  mx,
  my
}: SpacingProps) {
  const spacingClasses = [
    p && paddingClasses[p],
    px && paddingXClasses[px],
    py && paddingYClasses[py],
    m && marginClasses[m],
    mx && marginXClasses[mx],
    my && marginYClasses[my]
  ].filter(Boolean).join(' ')

  return (
    <div className={`${spacingClasses} ${className}`}>
      {children}
    </div>
  )
}