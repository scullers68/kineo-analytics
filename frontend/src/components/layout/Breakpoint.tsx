'use client'

import { useEffect, useState } from 'react'

interface BreakpointProps {
  children: React.ReactNode | ((breakpoint: string) => React.ReactNode)
  className?: string
  show?: 'mobile' | 'tablet' | 'desktop' | 'wide'
  hide?: 'mobile' | 'tablet' | 'desktop' | 'wide'
}

const breakpoints = {
  mobile: '(max-width: 479px)',
  tablet: '(min-width: 480px) and (max-width: 767px)', 
  desktop: '(min-width: 768px) and (max-width: 1279px)',
  wide: '(min-width: 1280px)'
}

export default function Breakpoint({ 
  children, 
  className = '',
  show,
  hide
}: BreakpointProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop')
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    const updateBreakpoint = () => {
      if (typeof window === 'undefined') return

      let current = 'desktop'
      if (window.matchMedia(breakpoints.mobile).matches) current = 'mobile'
      else if (window.matchMedia(breakpoints.tablet).matches) current = 'tablet'
      else if (window.matchMedia(breakpoints.desktop).matches) current = 'desktop'
      else if (window.matchMedia(breakpoints.wide).matches) current = 'wide'
      
      setCurrentBreakpoint(current)
      
      if (show) {
        setShouldShow(current === show)
      } else if (hide) {
        setShouldShow(current !== hide)
      } else {
        setShouldShow(true)
      }
    }

    updateBreakpoint()
    
    const mediaQueries = Object.values(breakpoints).map(query => 
      window.matchMedia(query)
    )
    
    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateBreakpoint)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateBreakpoint)
      })
    }
  }, [show, hide])

  if (!shouldShow) return null

  return (
    <div className={className}>
      {typeof children === 'function' ? children(currentBreakpoint) : children}
    </div>
  )
}