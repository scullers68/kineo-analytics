'use client'

interface VisibilityProps {
  children: React.ReactNode
  className?: string
  show?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
    wide?: boolean
  }
  hide?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
    wide?: boolean
  }
}

export default function Visibility({ 
  children, 
  className = '',
  show,
  hide
}: VisibilityProps) {
  let visibilityClasses = ''

  if (show) {
    // Show only on specified breakpoints
    const showClasses = []
    if (show.mobile) showClasses.push('block sm:hidden')
    if (show.tablet) showClasses.push('hidden sm:block md:hidden')
    if (show.desktop) showClasses.push('hidden md:block lg:hidden')
    if (show.wide) showClasses.push('hidden lg:block')
    
    visibilityClasses = showClasses.length > 0 
      ? showClasses.join(' ') 
      : 'hidden'
  } else if (hide) {
    // Hide on specified breakpoints
    const hideClasses = []
    if (hide.mobile) hideClasses.push('hidden sm:block')
    if (hide.tablet) hideClasses.push('sm:hidden md:block')  
    if (hide.desktop) hideClasses.push('md:hidden lg:block')
    if (hide.wide) hideClasses.push('lg:hidden')
    
    visibilityClasses = hideClasses.join(' ')
  }

  return (
    <div className={`${visibilityClasses} ${className}`}>
      {children}
    </div>
  )
}