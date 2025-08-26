import React from 'react'
import { TimeSeriesData } from '../types/time-series'
import { LineChartVariant, VariantConfigMap, VariantPropsMap } from '../types/line-chart-variants'

// Dynamic imports for code splitting
const variantComponents = {
  'simple-line': () => import('../components/charts/variants/SimpleLineChart'),
  'multi-line': () => import('../components/charts/variants/MultiLineChart'),
  'simple-area': () => import('../components/charts/variants/SimpleAreaChart'),
  'stacked-area': () => import('../components/charts/variants/StackedAreaChart'),
  'stream-graph': () => import('../components/charts/variants/StreamGraphChart')
}

// Component registry for loaded components
const componentRegistry = new Map<LineChartVariant, React.ComponentType<any>>()

// Create line chart variant component
export const createLineChartVariant = async <T extends LineChartVariant>(
  variant: T,
  props: VariantPropsMap[T]
): Promise<React.ComponentType<VariantPropsMap[T]>> => {
  // Check if component is already loaded
  if (componentRegistry.has(variant)) {
    return componentRegistry.get(variant)!
  }

  try {
    // Dynamically import the component
    const componentModule = await variantComponents[variant]()
    const Component = componentModule.default || componentModule[getComponentName(variant)]
    
    if (!Component) {
      throw new Error(`Component not found in module for variant: ${variant}`)
    }

    // Register the component
    componentRegistry.set(variant, Component)
    
    return Component
  } catch (error) {
    console.error(`Failed to load variant component: ${variant}`, error)
    throw new Error(`Failed to load chart variant: ${variant}`)
  }
}

// Get component synchronously if already loaded
export const getLineVariantComponent = <T extends LineChartVariant>(
  variant: T
): React.ComponentType<VariantPropsMap[T]> | null => {
  return componentRegistry.get(variant) || null
}

// Get component name from variant
function getComponentName(variant: LineChartVariant): string {
  const nameMap: Record<LineChartVariant, string> = {
    'simple-line': 'SimpleLineChart',
    'multi-line': 'MultiLineChart',
    'simple-area': 'SimpleAreaChart',
    'stacked-area': 'StackedAreaChart',
    'stream-graph': 'StreamGraphChart'
  }
  
  return nameMap[variant]
}

// Preload all variants for better performance
export const preloadAllVariants = async (): Promise<void> => {
  const variants: LineChartVariant[] = ['simple-line', 'multi-line', 'simple-area', 'stacked-area', 'stream-graph']
  
  const loadPromises = variants.map(async (variant) => {
    try {
      await createLineChartVariant(variant, {} as any)
    } catch (error) {
      console.warn(`Failed to preload variant: ${variant}`, error)
    }
  })

  await Promise.allSettled(loadPromises)
}

// Get default config for variant
export const getDefaultConfigForVariant = <T extends LineChartVariant>(
  variant: T
): Partial<VariantConfigMap[T]> => {
  const defaultConfigs: Record<LineChartVariant, any> = {
    'simple-line': {
      interpolation: 'linear',
      showPoints: true,
      pointRadius: 4,
      strokeWidth: 2,
      showGrid: true,
      singleSeriesColor: '#3b82f6'
    },
    'multi-line': {
      interpolation: 'linear',
      showPoints: true,
      pointRadius: 3,
      strokeWidth: 2,
      showGrid: true,
      showLegend: true,
      legendPosition: 'right',
      seriesInteraction: true,
      maxSeries: 10
    },
    'simple-area': {
      interpolation: 'linear',
      showPoints: false,
      strokeWidth: 1,
      areaOpacity: 0.6,
      showGrid: true,
      gradientFill: true,
      singleAreaColor: '#3b82f6'
    },
    'stacked-area': {
      interpolation: 'linear',
      stackedMode: 'normal',
      showPoints: false,
      strokeWidth: 1,
      areaOpacity: 0.7,
      showGrid: true,
      showLegend: true,
      stackOrder: 'none',
      stackOffset: 'none'
    },
    'stream-graph': {
      interpolation: 'cardinal',
      stackedMode: 'stream',
      showPoints: false,
      strokeWidth: 0.5,
      areaOpacity: 0.8,
      showGrid: false,
      showLegend: true,
      gradientFill: true,
      streamOrder: 'inside-out',
      streamOffset: 'wiggle',
      symmetrical: true
    }
  }

  return defaultConfigs[variant] || {}
}

// Validate data for specific variant
export const validateDataForVariant = (
  variant: LineChartVariant,
  data: TimeSeriesData[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Common validations
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors }
  }

  if (data.length === 0) {
    errors.push('Data array cannot be empty')
    return { isValid: false, errors }
  }

  // Variant-specific validations
  switch (variant) {
    case 'simple-line':
    case 'simple-area':
      if (data.length > 1) {
        errors.push(`${variant} supports only single series data. Use multi-line or stacked variants for multiple series.`)
      }
      break

    case 'multi-line':
      if (data.length > 10) {
        errors.push('Multi-line charts are limited to 10 series for readability. Consider using fewer series or data aggregation.')
      }
      break

    case 'stacked-area':
    case 'stream-graph':
      if (data.length < 2) {
        errors.push(`${variant} requires at least 2 series for meaningful visualization`)
      }
      
      if (data.length > 15) {
        errors.push(`${variant} supports maximum 15 series for performance and readability`)
      }

      // Check that all series have some overlapping time points
      if (data.length > 1) {
        const allDates = new Set<number>()
        data.forEach(series => {
          series.points.forEach(point => {
            allDates.add(point.date.getTime())
          })
        })

        const hasOverlap = data.every(series => {
          return series.points.some(point => 
            data.some(otherSeries => 
              otherSeries.id !== series.id && 
              otherSeries.points.some(otherPoint => 
                Math.abs(otherPoint.date.getTime() - point.date.getTime()) < 86400000 // Within 24 hours
              )
            )
          )
        })

        if (!hasOverlap) {
          errors.push('Stacked/stream charts require series with overlapping time periods')
        }
      }
      break
  }

  // Validate each series
  data.forEach((series, seriesIndex) => {
    if (!series.id) {
      errors.push(`Series ${seriesIndex} missing required ID`)
    }
    
    if (!series.label) {
      errors.push(`Series ${seriesIndex} missing required label`)
    }

    if (!Array.isArray(series.points)) {
      errors.push(`Series ${seriesIndex} points must be an array`)
    } else if (series.points.length === 0) {
      errors.push(`Series ${seriesIndex} has no data points`)
    } else {
      // Validate data points
      series.points.forEach((point, pointIndex) => {
        if (!(point.date instanceof Date)) {
          errors.push(`Series ${seriesIndex} point ${pointIndex} date must be a Date object`)
        } else if (isNaN(point.date.getTime())) {
          errors.push(`Series ${seriesIndex} point ${pointIndex} has invalid date`)
        }

        if (typeof point.value !== 'number' || isNaN(point.value)) {
          errors.push(`Series ${seriesIndex} point ${pointIndex} value must be a valid number`)
        }

        // For stacked charts, check for negative values
        if ((variant === 'stacked-area' || variant === 'stream-graph') && point.value < 0) {
          errors.push(`Series ${seriesIndex} point ${pointIndex} has negative value. Stacked charts require non-negative values.`)
        }
      })
    }
  })

  return { isValid: errors.length === 0, errors }
}

// Get recommended variant based on data characteristics
export const getRecommendedVariant = (
  data: TimeSeriesData[],
  intent: 'trend' | 'comparison' | 'composition' | 'flow' = 'trend'
): {
  variant: LineChartVariant
  reason: string
  alternatives: LineChartVariant[]
} => {
  const seriesCount = data.length

  if (seriesCount === 0) {
    return {
      variant: 'simple-line',
      reason: 'No data provided',
      alternatives: []
    }
  }

  if (seriesCount === 1) {
    return {
      variant: intent === 'composition' ? 'simple-area' : 'simple-line',
      reason: `Single series best displayed as ${intent === 'composition' ? 'area' : 'line'} chart`,
      alternatives: intent === 'composition' ? ['simple-line'] : ['simple-area']
    }
  }

  switch (intent) {
    case 'trend':
      return {
        variant: 'multi-line',
        reason: 'Multiple series trends are best shown with separate lines',
        alternatives: ['simple-area', 'stacked-area']
      }

    case 'comparison':
      return {
        variant: seriesCount <= 5 ? 'multi-line' : 'stacked-area',
        reason: seriesCount <= 5 
          ? 'Few series allow clear individual comparison'
          : 'Many series benefit from stacked view',
        alternatives: seriesCount <= 5 ? ['simple-area'] : ['multi-line', 'stream-graph']
      }

    case 'composition':
      return {
        variant: 'stacked-area',
        reason: 'Stacked areas show part-to-whole relationships clearly',
        alternatives: ['stream-graph', 'multi-line']
      }

    case 'flow':
      return {
        variant: 'stream-graph',
        reason: 'Stream graphs emphasize organic flow and aesthetic appeal',
        alternatives: ['stacked-area', 'multi-line']
      }

    default:
      return {
        variant: 'multi-line',
        reason: 'Multi-line is the most versatile for general use',
        alternatives: ['stacked-area', 'stream-graph']
      }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createLineChartVariant,
    getLineVariantComponent,
    preloadAllVariants,
    getDefaultConfigForVariant,
    validateDataForVariant,
    getRecommendedVariant
  }
}