import { ChartDataPoint } from '../types/store'

// Transform various data formats into standardized bar chart data
export const transformBarData = (
  rawData: any[],
  xKey: string = 'x',
  yKey: string = 'y',
  labelKey?: string
): ChartDataPoint[] => {
  if (!Array.isArray(rawData)) {
    throw new Error('Data must be an array')
  }

  return rawData.map((item, index) => ({
    x: item[xKey] ?? index,
    y: Number(item[yKey]) || 0,
    label: labelKey ? item[labelKey] : String(item[xKey] ?? index),
    id: item.id ?? `data-${index}`,
    metadata: { ...item }
  }))
}

// Validate bar chart data format
export const validateBarData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors }
  }
  
  if (data.length === 0) {
    errors.push('Data array cannot be empty')
    return { isValid: false, errors }
  }
  
  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Data item at index ${index} must be an object`)
    } else {
      if (item.x === undefined) {
        errors.push(`Data item at index ${index} is missing 'x' property`)
      }
      if (item.y === undefined) {
        errors.push(`Data item at index ${index} is missing 'y' property`)  
      } else if (typeof item.y !== 'number') {
        errors.push(`Data item at index ${index} 'y' property must be a number`)
      }
    }
  })
  
  return { isValid: errors.length === 0, errors }
}

// Aggregate data by category (for grouping similar values)
export const aggregateBarData = (
  data: ChartDataPoint[],
  aggregationType: 'sum' | 'average' | 'count' = 'sum'
): ChartDataPoint[] => {
  const groups = data.reduce((acc, item) => {
    const key = String(item.x)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, ChartDataPoint[]>)
  
  return Object.entries(groups).map(([key, items]) => {
    let aggregatedValue: number
    
    switch (aggregationType) {
      case 'sum':
        aggregatedValue = items.reduce((sum, item) => sum + item.y, 0)
        break
      case 'average':
        aggregatedValue = items.reduce((sum, item) => sum + item.y, 0) / items.length
        break
      case 'count':
        aggregatedValue = items.length
        break
      default:
        aggregatedValue = items.reduce((sum, item) => sum + item.y, 0)
    }
    
    return {
      x: key,
      y: aggregatedValue,
      label: items[0].label || key,
      id: `aggregated-${key}`,
      metadata: { 
        aggregationType,
        itemCount: items.length,
        originalItems: items
      }
    }
  })
}

// Normalize data to percentage values (useful for stacked charts)
export const normalizeBarData = (data: ChartDataPoint[]): ChartDataPoint[] => {
  const total = data.reduce((sum, item) => sum + Math.abs(item.y), 0)
  
  if (total === 0) return data
  
  return data.map(item => ({
    ...item,
    y: (item.y / total) * 100,
    metadata: {
      ...item.metadata,
      originalValue: item.y,
      percentage: (item.y / total) * 100
    }
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    transformBarData,
    validateBarData,
    aggregateBarData,
    normalizeBarData
  }
}