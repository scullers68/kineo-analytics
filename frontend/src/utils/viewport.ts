import { ViewportDimensions, Breakpoint } from '../types/responsive'

export const getViewportDimensions = (): ViewportDimensions => {
  const width = window.innerWidth
  const height = window.innerHeight
  
  return {
    width,
    height,
    aspectRatio: width / height
  }
}

export const getCurrentBreakpoint = (width?: number): Breakpoint => {
  const viewportWidth = width || window.innerWidth
  
  if (viewportWidth >= 1536) return '2xl'
  if (viewportWidth >= 1280) return 'xl'
  if (viewportWidth >= 1024) return 'lg'
  if (viewportWidth >= 768) return 'md'
  if (viewportWidth >= 640) return 'sm'
  return 'xs'
}

export const isViewportAtLeast = (breakpoint: Breakpoint, width?: number): boolean => {
  const viewportWidth = width || window.innerWidth
  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
  
  return viewportWidth >= breakpoints[breakpoint]
}

export const getOptimalChartDimensions = (
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 16/9,
  minWidth: number = 200,
  minHeight: number = 150
): { width: number; height: number } => {
  let width = Math.max(containerWidth, minWidth)
  let height = width / aspectRatio
  
  if (height > containerHeight) {
    height = Math.max(containerHeight, minHeight)
    width = height * aspectRatio
  }
  
  return { width: Math.round(width), height: Math.round(height) }
}

export const createViewportObserver = (callback: (dimensions: ViewportDimensions) => void) => {
  const handleResize = () => {
    callback(getViewportDimensions())
  }
  
  window.addEventListener('resize', handleResize)
  
  // Initial call
  handleResize()
  
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

export default getViewportDimensions