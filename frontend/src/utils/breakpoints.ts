export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof breakpoints

export const getBreakpointValue = (breakpoint: Breakpoint): number => {
  return breakpoints[breakpoint]
}

export const isBreakpointActive = (breakpoint: Breakpoint, width?: number): boolean => {
  if (typeof window === 'undefined') return false
  
  const currentWidth = width ?? window.innerWidth
  return currentWidth >= breakpoints[breakpoint]
}

export const getCurrentBreakpoint = (width?: number): Breakpoint => {
  if (typeof window === 'undefined') return 'sm'
  
  const currentWidth = width ?? window.innerWidth
  
  const sortedBreakpoints = (Object.entries(breakpoints) as [Breakpoint, number][])
    .sort(([, a], [, b]) => b - a) // Sort by value descending
  
  for (const [breakpoint, value] of sortedBreakpoints) {
    if (currentWidth >= value) {
      return breakpoint
    }
  }
  
  return 'sm' // Default to smallest breakpoint
}

export const getBreakpointRange = (breakpoint: Breakpoint): { min: number; max?: number } => {
  const sortedBreakpoints = (Object.entries(breakpoints) as [Breakpoint, number][])
    .sort(([, a], [, b]) => a - b) // Sort by value ascending
  
  const currentIndex = sortedBreakpoints.findIndex(([bp]) => bp === breakpoint)
  const nextBreakpoint = sortedBreakpoints[currentIndex + 1]
  
  return {
    min: breakpoints[breakpoint],
    max: nextBreakpoint ? nextBreakpoint[1] - 1 : undefined
  }
}

export const createMediaQuery = (breakpoint: Breakpoint, type: 'min' | 'max' = 'min'): string => {
  const value = breakpoints[breakpoint]
  
  if (type === 'max') {
    return `(max-width: ${value - 1}px)`
  }
  
  return `(min-width: ${value}px)`
}

export const isMobile = (width?: number): boolean => {
  return !isBreakpointActive('md', width)
}

export const isTablet = (width?: number): boolean => {
  if (typeof window === 'undefined') return false
  
  const currentWidth = width ?? window.innerWidth
  return currentWidth >= breakpoints.md && currentWidth < breakpoints.lg
}

export const isDesktop = (width?: number): boolean => {
  return isBreakpointActive('lg', width)
}