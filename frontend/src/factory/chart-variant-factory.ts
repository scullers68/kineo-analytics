import { ChartDataPoint } from '../types/store'
import { ChartSeries, SimpleChartConfig, GroupedChartConfig, StackedChartConfig } from '../types/chart-variants'

// Chart variant types
export type ChartVariant = 'simple' | 'grouped' | 'stacked'
export type ChartType = 'bar' | 'column'

// Factory function to create chart variant configuration
export const createChartVariant = (
  variant: ChartVariant,
  data: ChartDataPoint[] | ChartSeries[],
  customConfig?: Partial<SimpleChartConfig | GroupedChartConfig | StackedChartConfig>
) => {
  const baseConfig = {
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        background: '#ffffff',
        text: '#1f2937',
        grid: '#e5e7eb'
      },
      fonts: {
        family: 'Inter, system-ui, sans-serif',
        size: {
          small: 12,
          medium: 14,
          large: 16
        }
      },
      spacing: {
        small: 4,
        medium: 8,
        large: 16
      }
    },
    animation: {
      duration: 750,
      easing: 'ease-in-out',
      stagger: 50,
      enabled: true
    },
    accessibility: {
      enabled: true,
      keyboardNavigation: true,
      screenReaderSupport: true,
      highContrast: false
    }
  }
  
  switch (variant) {
    case 'simple':
      const simpleConfig: SimpleChartConfig = {
        ...baseConfig,
        showValues: true,
        valuePosition: 'end',
        ...customConfig
      }
      return { variant, config: simpleConfig, data }
      
    case 'grouped':
      const groupedConfig: GroupedChartConfig = {
        ...baseConfig,
        groupPadding: 0.05,
        seriesPadding: 0.02,
        showLegend: true,
        legendPosition: 'top',
        colorScheme: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        ...customConfig
      }
      return { variant, config: groupedConfig, data }
      
    case 'stacked':
      const stackedConfig: StackedChartConfig = {
        ...baseConfig,
        stackOrder: 'none',
        stackOffset: 'none',
        showTotals: false,
        totalPosition: 'top',
        ...customConfig
      }
      return { variant, config: stackedConfig, data }
      
    default:
      throw new Error(`Unsupported chart variant: ${variant}`)
  }
}

// Get the appropriate component for a chart variant
export const getVariantComponent = (
  chartType: ChartType,
  variant: ChartVariant
): string => {
  const componentMap = {
    bar: {
      simple: 'SimpleBarChart',
      grouped: 'GroupedBarChart', 
      stacked: 'StackedBarChart'
    },
    column: {
      simple: 'SimpleColumnChart',
      grouped: 'GroupedColumnChart',
      stacked: 'StackedColumnChart'
    }
  }
  
  const component = componentMap[chartType]?.[variant]
  if (!component) {
    throw new Error(`No component found for ${chartType} chart with ${variant} variant`)
  }
  
  return component
}

// Validate data format for specific variant
export const validateVariantData = (
  variant: ChartVariant,
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors }
  }
  
  if (data.length === 0) {
    errors.push('Data array cannot be empty')
    return { isValid: false, errors }
  }
  
  switch (variant) {
    case 'simple':
      // Simple charts expect ChartDataPoint[]
      data.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          errors.push(`Data item at index ${index} must be an object`)
        } else {
          if (item.x === undefined) errors.push(`Item ${index}: missing 'x' property`)
          if (typeof item.y !== 'number') errors.push(`Item ${index}: 'y' must be a number`)
        }
      })
      break
      
    case 'grouped':
    case 'stacked':
      // Grouped/stacked charts can accept either ChartDataPoint[] with series metadata 
      // or ChartSeries[]
      const firstItem = data[0]
      if (firstItem.id && firstItem.label && Array.isArray(firstItem.data)) {
        // ChartSeries[] format
        data.forEach((series, index) => {
          if (!series.id) errors.push(`Series ${index}: missing 'id' property`)
          if (!series.label) errors.push(`Series ${index}: missing 'label' property`) 
          if (!Array.isArray(series.data)) {
            errors.push(`Series ${index}: 'data' must be an array`)
          } else {
            series.data.forEach((item: any, itemIndex: number) => {
              if (item.x === undefined) {
                errors.push(`Series ${index}, item ${itemIndex}: missing 'x' property`)
              }
              if (typeof item.y !== 'number') {
                errors.push(`Series ${index}, item ${itemIndex}: 'y' must be a number`)
              }
            })
          }
        })
      } else {
        // ChartDataPoint[] format with series metadata
        data.forEach((item, index) => {
          if (!item || typeof item !== 'object') {
            errors.push(`Data item at index ${index} must be an object`)
          } else {
            if (item.x === undefined) errors.push(`Item ${index}: missing 'x' property`)
            if (typeof item.y !== 'number') errors.push(`Item ${index}: 'y' must be a number`)
          }
        })
      }
      break
  }
  
  return { isValid: errors.length === 0, errors }
}

// Get recommended variant based on data characteristics
export const getRecommendedVariant = (
  data: ChartDataPoint[]
): ChartVariant => {
  // Check if data has series information
  const hasSeriesInfo = data.some(item => 
    item.metadata && (item.metadata.series || item.metadata.category)
  )
  
  if (!hasSeriesInfo) {
    return 'simple'
  }
  
  // Count unique series
  const seriesSet = new Set(
    data.map(item => item.metadata?.series || item.metadata?.category || 'default')
  )
  
  if (seriesSet.size <= 1) {
    return 'simple'
  }
  
  // For multiple series, check if values should be stacked or grouped
  // This is a heuristic - in practice, this would be a business decision
  const avgValuesPerSeries = data.length / seriesSet.size
  
  // If there are many overlapping x values, suggest stacking
  if (avgValuesPerSeries > 5) {
    return 'stacked'
  }
  
  return 'grouped'
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createChartVariant,
    getVariantComponent,
    validateVariantData,
    getRecommendedVariant
  }
}