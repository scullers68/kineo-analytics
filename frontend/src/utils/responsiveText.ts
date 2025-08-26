import { Breakpoint } from '../types/responsive'
import { getCurrentBreakpoint } from './viewport'

export interface ResponsiveFontConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export const DEFAULT_FONT_SCALES: ResponsiveFontConfig = {
  xs: 0.75,
  sm: 0.875,
  md: 1,
  lg: 1.125,
  xl: 1.25,
  '2xl': 1.375
}

export const calculateResponsiveFontSize = (
  baseFontSize: number = 16,
  breakpoint?: Breakpoint
): number => {
  const currentBreakpoint = breakpoint || getCurrentBreakpoint()
  const scale = DEFAULT_FONT_SCALES[currentBreakpoint]
  
  return Math.round(baseFontSize * scale)
}

export const getResponsiveTextClasses = (breakpoint?: Breakpoint): string => {
  const currentBreakpoint = breakpoint || getCurrentBreakpoint()
  
  const classMap: Record<Breakpoint, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }
  
  return classMap[currentBreakpoint]
}

export const calculateOptimalTextSize = (
  containerWidth: number,
  textLength: number,
  maxFontSize: number = 24,
  minFontSize: number = 12
): number => {
  // Simple heuristic: larger containers and shorter text = larger font
  const widthFactor = containerWidth / 400 // Normalize to ~400px base
  const lengthFactor = Math.max(0.5, 50 / textLength) // Shorter text = larger font
  
  const calculatedSize = 16 * widthFactor * lengthFactor
  
  return Math.round(Math.max(minFontSize, Math.min(maxFontSize, calculatedSize)))
}

export const getLineHeight = (fontSize: number): number => {
  // Golden ratio for line height
  return Math.round(fontSize * 1.618)
}

export const calculateTextMetrics = (
  text: string,
  fontSize: number,
  fontFamily: string = 'Arial, sans-serif'
): { width: number; height: number } => {
  // Create temporary canvas to measure text
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (!context) {
    return { width: text.length * fontSize * 0.6, height: fontSize }
  }
  
  context.font = `${fontSize}px ${fontFamily}`
  const metrics = context.measureText(text)
  
  return {
    width: metrics.width,
    height: fontSize
  }
}

export default calculateResponsiveFontSize