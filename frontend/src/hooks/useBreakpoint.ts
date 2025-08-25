'use client'

import { useState, useEffect } from 'react'
import { 
  Breakpoint, 
  getCurrentBreakpoint, 
  isBreakpointActive,
  isMobile,
  isTablet,
  isDesktop
} from '@/utils/breakpoints'

interface UseBreakpointReturn {
  breakpoint: Breakpoint
  width: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isActive: (bp: Breakpoint) => boolean
}

export const useBreakpoint = (): UseBreakpointReturn => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    
    // Set initial width
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const breakpoint = getCurrentBreakpoint(width)

  return {
    breakpoint,
    width,
    isMobile: isMobile(width),
    isTablet: isTablet(width),
    isDesktop: isDesktop(width),
    isActive: (bp: Breakpoint) => isBreakpointActive(bp, width)
  }
}

export const useBreakpointValue = <T>(
  values: Partial<Record<Breakpoint | 'base', T>>
): T => {
  const { breakpoint } = useBreakpoint()
  
  // Define breakpoint priority (largest to smallest)
  const priorities: (Breakpoint | 'base')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'base']
  
  // Find the first matching value based on current breakpoint
  for (const bp of priorities) {
    if (bp === 'base' && values.base !== undefined) {
      return values.base
    }
    
    if (bp === breakpoint && values[bp] !== undefined) {
      return values[bp]!
    }
    
    // Also check if current breakpoint is larger than this one
    if (bp !== 'base' && isBreakpointActive(bp as Breakpoint) && values[bp] !== undefined) {
      return values[bp]!
    }
  }
  
  // Fallback to base or first available value
  if (values.base !== undefined) {
    return values.base
  }
  
  const firstValue = Object.values(values)[0]
  if (firstValue !== undefined) {
    return firstValue
  }
  
  throw new Error('useBreakpointValue: No values provided')
}

export default useBreakpoint