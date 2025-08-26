import * as d3 from 'd3'

// Get appropriate color scheme for time series data
export const getTimeSeriesColorScheme = (
  seriesCount: number,
  scheme: 'category' | 'sequential' | 'diverging' | 'custom' = 'category'
): string[] => {
  switch (scheme) {
    case 'sequential':
      // Use blues for sequential data
      return seriesCount <= 9 
        ? d3.schemeBlues[Math.max(3, seriesCount)] || d3.schemeBlues[9]
        : d3.scaleSequential(d3.interpolateBlues)
          .domain([0, seriesCount - 1])
          .range() as string[]

    case 'diverging':
      // Use red-blue diverging for comparison data
      return seriesCount <= 11
        ? d3.schemeRdBu[Math.max(3, seriesCount)] || d3.schemeRdBu[11]
        : d3.scaleDiverging(d3.interpolateRdBu)
          .domain([0, Math.floor(seriesCount / 2), seriesCount - 1])
          .range() as string[]

    case 'custom':
      // Custom color palette optimized for time series
      const customColors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Amber
        '#8b5cf6', // Purple
        '#f97316', // Orange
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#84cc16', // Lime
        '#6366f1'  // Indigo
      ]
      
      if (seriesCount <= customColors.length) {
        return customColors.slice(0, seriesCount)
      }
      
      // Generate additional colors using HSL
      const colors = [...customColors]
      const baseHues = colors.length
      
      for (let i = baseHues; i < seriesCount; i++) {
        const hue = ((i - baseHues) * 137.5) % 360 // Golden angle
        colors.push(`hsl(${hue}, 65%, 55%)`)
      }
      
      return colors

    default: // 'category'
      if (seriesCount <= 10) {
        return d3.schemeCategory10.slice(0, seriesCount)
      }
      
      // Generate additional colors for large series counts
      const colors = [...d3.schemeCategory10]
      for (let i = 10; i < seriesCount; i++) {
        const hue = ((i - 10) * 137.5) % 360 // Golden angle distribution
        const saturation = 60 + (i % 3) * 15    // Vary saturation
        const lightness = 45 + (i % 4) * 10     // Vary lightness
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
      }
      
      return colors
  }
}

// Apply colors to line chart series
export const applyLineColors = (
  seriesCount: number,
  existingColors?: (string | undefined)[],
  colorScheme?: 'category' | 'sequential' | 'diverging' | 'custom'
): string[] => {
  const schemeColors = getTimeSeriesColorScheme(seriesCount, colorScheme)
  
  return Array.from({ length: seriesCount }, (_, i) => {
    // Use existing color if provided, otherwise use scheme color
    return existingColors?.[i] || schemeColors[i] || schemeColors[i % schemeColors.length]
  })
}

// Create gradient fills for area charts
export const createGradientFills = (
  colors: string[],
  opacity: { start: number; end: number } = { start: 0.8, end: 0.1 },
  direction: 'vertical' | 'horizontal' = 'vertical'
): Array<{
  id: string
  color: string
  gradient: {
    x1: string
    y1: string
    x2: string
    y2: string
    stops: Array<{ offset: string; color: string; opacity: number }>
  }
}> => {
  return colors.map((color, i) => ({
    id: `gradient-${i}`,
    color,
    gradient: {
      x1: direction === 'vertical' ? '0%' : '0%',
      y1: direction === 'vertical' ? '0%' : '0%',
      x2: direction === 'vertical' ? '0%' : '100%',
      y2: direction === 'vertical' ? '100%' : '0%',
      stops: [
        { offset: '0%', color, opacity: opacity.start },
        { offset: '100%', color, opacity: opacity.end }
      ]
    }
  }))
}

// Generate color variations for hover/select states
export const generateColorVariations = (
  baseColor: string,
  variations: ('hover' | 'selected' | 'disabled' | 'faded')[] = ['hover', 'selected', 'disabled', 'faded']
): Record<string, string> => {
  const hsl = d3.hsl(baseColor)
  const result: Record<string, string> = { base: baseColor }

  variations.forEach(variation => {
    switch (variation) {
      case 'hover':
        // Slightly brighter and more saturated
        result.hover = d3.hsl(hsl.h, Math.min(1, hsl.s * 1.2), Math.min(1, hsl.l * 1.1)).toString()
        break
      case 'selected':
        // Darker and more saturated
        result.selected = d3.hsl(hsl.h, Math.min(1, hsl.s * 1.3), hsl.l * 0.8).toString()
        break
      case 'disabled':
        // Desaturated and lighter
        result.disabled = d3.hsl(hsl.h, hsl.s * 0.3, Math.min(1, hsl.l * 1.4)).toString()
        break
      case 'faded':
        // Reduced opacity effect
        result.faded = d3.hsl(hsl.h, hsl.s * 0.7, Math.min(1, hsl.l * 1.2)).toString()
        break
    }
  })

  return result
}

// Ensure color accessibility and contrast
export const ensureColorAccessibility = (
  colors: string[],
  backgroundColor: string = '#ffffff',
  minContrast: number = 3.0
): string[] => {
  return colors.map(color => {
    const colorHsl = d3.hsl(color)
    const bgHsl = d3.hsl(backgroundColor)
    
    // Simple contrast check based on lightness difference
    const contrast = Math.abs(colorHsl.l - bgHsl.l)
    
    if (contrast < minContrast) {
      // Adjust lightness to improve contrast
      if (bgHsl.l > 0.5) {
        // Light background, make color darker
        colorHsl.l = Math.max(0, bgHsl.l - minContrast)
      } else {
        // Dark background, make color lighter
        colorHsl.l = Math.min(1, bgHsl.l + minContrast)
      }
    }
    
    return colorHsl.toString()
  })
}

// Generate color palette for specific chart types
export const getChartTypeColorPalette = (
  chartType: 'line' | 'area' | 'stream',
  seriesCount: number,
  theme: 'light' | 'dark' = 'light'
): string[] => {
  let baseScheme: string[]

  switch (chartType) {
    case 'line':
      // High contrast colors for line charts
      baseScheme = theme === 'light' 
        ? ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777']
        : ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6']
      break
    
    case 'area':
      // Slightly muted colors for area charts to avoid overwhelming fill
      baseScheme = theme === 'light'
        ? ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
        : ['#93c5fd', '#fca5a5', '#6ee7b7', '#fed7aa', '#c4b5fd', '#f9a8d4']
      break
    
    case 'stream':
      // Organic, flowing colors for stream graphs
      baseScheme = theme === 'light'
        ? ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1']
        : ['#67e8f9', '#c4b5fd', '#86efac', '#fde047', '#fbbf24', '#a5b4fc']
      break
    
    default:
      baseScheme = getTimeSeriesColorScheme(seriesCount, 'category')
  }

  if (seriesCount <= baseScheme.length) {
    return baseScheme.slice(0, seriesCount)
  }

  // Generate additional colors
  const colors = [...baseScheme]
  const baseHues = [220, 350, 160, 40, 270, 320] // Hues from base scheme
  
  for (let i = baseScheme.length; i < seriesCount; i++) {
    const hueIndex = i % baseHues.length
    const hueVariation = Math.floor(i / baseHues.length) * 30
    const hue = (baseHues[hueIndex] + hueVariation) % 360
    
    const saturation = theme === 'light' ? 65 : 55
    const lightness = theme === 'light' ? 50 : 65
    
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  return colors
}

// Create color legend data
export const createColorLegend = (
  seriesLabels: string[],
  colors: string[],
  includeSwatches: boolean = true
) => {
  return seriesLabels.map((label, i) => ({
    label,
    color: colors[i] || colors[i % colors.length],
    swatch: includeSwatches ? {
      width: 12,
      height: 12,
      style: `background-color: ${colors[i] || colors[i % colors.length]}`
    } : undefined
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getTimeSeriesColorScheme,
    applyLineColors,
    createGradientFills,
    generateColorVariations,
    ensureColorAccessibility,
    getChartTypeColorPalette,
    createColorLegend
  }
}