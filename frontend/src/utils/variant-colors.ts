import * as d3 from 'd3'
import { ChartSeries } from '../types/chart-variants'

// Default color palettes for different chart variants
export const DEFAULT_COLOR_SCHEMES = {
  primary: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  pastel: ['#93c5fd', '#fca5a5', '#86efac', '#fcd34d', '#c4b5fd', '#f9a8d4', '#67e8f9', '#bef264'],
  dark: ['#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'],
  monochrome: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#ffffff'],
  categorical: d3.schemeCategory10,
  sequential: d3.schemeBlues[9] || ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']
}

// Get color scheme for chart variants
export const getVariantColorScheme = (
  variant: 'simple' | 'grouped' | 'stacked',
  seriesCount: number,
  theme: 'light' | 'dark' = 'light',
  customColors?: string[]
): string[] => {
  // Use custom colors if provided
  if (customColors && customColors.length >= seriesCount) {
    return customColors.slice(0, seriesCount)
  }
  
  // Select base palette based on variant and theme
  let basePalette: string[]
  
  switch (variant) {
    case 'simple':
      basePalette = theme === 'dark' ? DEFAULT_COLOR_SCHEMES.dark : DEFAULT_COLOR_SCHEMES.primary
      break
    case 'grouped':
      basePalette = theme === 'dark' ? DEFAULT_COLOR_SCHEMES.dark : DEFAULT_COLOR_SCHEMES.primary
      break
    case 'stacked':
      basePalette = theme === 'dark' ? DEFAULT_COLOR_SCHEMES.monochrome : DEFAULT_COLOR_SCHEMES.pastel
      break
    default:
      basePalette = DEFAULT_COLOR_SCHEMES.primary
  }
  
  // Extend palette if needed
  if (seriesCount <= basePalette.length) {
    return basePalette.slice(0, seriesCount)
  }
  
  // Generate additional colors using d3 color interpolation
  const colorScale = d3.scaleOrdinal()
    .domain(Array.from({ length: seriesCount }, (_, i) => i.toString()))
    .range(basePalette)
  
  return Array.from({ length: seriesCount }, (_, i) => colorScale(i.toString()))
}

// Apply colors to series based on group configuration
export const applyGroupColors = (
  series: ChartSeries[],
  colorScheme?: string[],
  theme: 'light' | 'dark' = 'light'
): ChartSeries[] => {
  const colors = colorScheme || getVariantColorScheme('grouped', series.length, theme)
  
  return series.map((s, index) => ({
    ...s,
    color: s.color || colors[index % colors.length]
  }))
}

// Generate contrasting colors for accessibility
export const generateAccessibleColors = (
  count: number,
  backgroundColor: string = '#ffffff'
): string[] => {
  const colors: string[] = []
  const bgColor = d3.color(backgroundColor)
  
  if (!bgColor) {
    throw new Error('Invalid background color')
  }
  
  const bgLuminance = getLuminance(bgColor.rgb())
  
  // Generate colors with sufficient contrast ratio (WCAG AA: 4.5:1)
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360
    let saturation = 70
    let lightness = bgLuminance > 0.5 ? 30 : 70
    
    let color: d3.RGBColor
    let contrast: number
    
    do {
      const hslColor = d3.hsl(hue, saturation / 100, lightness / 100)
      color = hslColor.rgb()
      contrast = getContrastRatio(bgColor.rgb(), color)
      
      // Adjust lightness if contrast is insufficient
      if (contrast < 4.5) {
        lightness = bgLuminance > 0.5 ? Math.max(0, lightness - 10) : Math.min(100, lightness + 10)
      }
    } while (contrast < 4.5 && lightness > 0 && lightness < 100)
    
    colors.push(color.formatHex())
  }
  
  return colors
}

// Calculate relative luminance (WCAG formula)
const getLuminance = (color: d3.RGBColor): number => {
  const { r, g, b } = color
  const [rs, gs, bs] = [r, g, b].map(c => {
    const channel = c / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio between two colors
const getContrastRatio = (color1: d3.RGBColor, color2: d3.RGBColor): number => {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Create color interpolator for gradients
export const createColorInterpolator = (
  startColor: string,
  endColor: string,
  steps: number
): string[] => {
  const interpolator = d3.interpolateRgb(startColor, endColor)
  return Array.from({ length: steps }, (_, i) => interpolator(i / (steps - 1)))
}

// Get semantic colors for data visualization
export const getSemanticColors = (theme: 'light' | 'dark' = 'light') => {
  return {
    success: theme === 'dark' ? '#10b981' : '#059669',
    warning: theme === 'dark' ? '#f59e0b' : '#d97706',
    error: theme === 'dark' ? '#ef4444' : '#dc2626',
    info: theme === 'dark' ? '#3b82f6' : '#2563eb',
    neutral: theme === 'dark' ? '#6b7280' : '#9ca3af'
  }
}

// Adjust color opacity
export const adjustColorOpacity = (color: string, opacity: number): string => {
  const d3Color = d3.color(color)
  if (!d3Color) return color
  
  d3Color.opacity = Math.max(0, Math.min(1, opacity))
  return d3Color.formatRgb()
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_COLOR_SCHEMES,
    getVariantColorScheme,
    applyGroupColors,
    generateAccessibleColors,
    createColorInterpolator,
    getSemanticColors,
    adjustColorOpacity
  }
}