import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'

// Transform raw data to time series format
export const transformTimeSeriesData = (
  rawData: any[],
  config: {
    dateField: string
    valueField: string
    seriesField?: string
    idField?: string
    labelField?: string
  }
): TimeSeriesData[] => {
  const { dateField, valueField, seriesField, idField, labelField } = config
  
  if (!rawData.length) return []
  
  // Group data by series if seriesField is provided
  if (seriesField) {
    const grouped = rawData.reduce((acc, item) => {
      const seriesKey = item[seriesField]
      if (!acc[seriesKey]) {
        acc[seriesKey] = {
          id: item[idField] || seriesKey,
          label: item[labelField] || seriesKey,
          points: []
        }
      }
      
      const date = new Date(item[dateField])
      const value = parseFloat(item[valueField])
      
      if (!isNaN(date.getTime()) && !isNaN(value)) {
        acc[seriesKey].points.push({
          date,
          value,
          metadata: { ...item }
        })
      }
      
      return acc
    }, {} as Record<string, TimeSeriesData>)
    
    return Object.values(grouped)
  }
  
  // Single series transformation
  const points: TimeSeriesDataPoint[] = rawData
    .map(item => {
      const date = new Date(item[dateField])
      const value = parseFloat(item[valueField])
      
      if (isNaN(date.getTime()) || isNaN(value)) return null
      
      return {
        date,
        value,
        metadata: { ...item }
      }
    })
    .filter((point): point is TimeSeriesDataPoint => point !== null)
  
  return [{
    id: 'series-1',
    label: 'Data Series',
    points
  }]
}

// Validate time series data structure
export const validateTimeSeriesData = (data: TimeSeriesData[]): string[] => {
  const errors: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return errors
  }
  
  data.forEach((series, seriesIndex) => {
    // Validate series structure
    if (!series.id) {
      errors.push(`Series ${seriesIndex}: Missing required 'id' field`)
    }
    if (!series.label) {
      errors.push(`Series ${seriesIndex}: Missing required 'label' field`)
    }
    if (!Array.isArray(series.points)) {
      errors.push(`Series ${seriesIndex}: 'points' must be an array`)
      return
    }
    
    // Validate each data point
    series.points.forEach((point, pointIndex) => {
      if (!(point.date instanceof Date)) {
        errors.push(`Series ${seriesIndex}, Point ${pointIndex}: 'date' must be a Date object`)
      } else if (isNaN(point.date.getTime())) {
        errors.push(`Series ${seriesIndex}, Point ${pointIndex}: 'date' is not a valid Date`)
      }
      
      if (typeof point.value !== 'number' || isNaN(point.value)) {
        errors.push(`Series ${seriesIndex}, Point ${pointIndex}: 'value' must be a valid number`)
      }
    })
    
    // Check for duplicate dates in series
    const dates = series.points.map(p => p.date.getTime())
    const uniqueDates = new Set(dates)
    if (dates.length !== uniqueDates.size) {
      errors.push(`Series ${seriesIndex}: Contains duplicate dates`)
    }
  })
  
  return errors
}

// Sort time series data points by date
export const sortTimeSeriesData = (data: TimeSeriesData[]): TimeSeriesData[] => {
  return data.map(series => ({
    ...series,
    points: [...series.points].sort((a, b) => a.date.getTime() - b.date.getTime())
  }))
}

// Filter time series data by date range
export const filterByDateRange = (
  data: TimeSeriesData[],
  startDate: Date,
  endDate: Date
): TimeSeriesData[] => {
  return data.map(series => ({
    ...series,
    points: series.points.filter(point => 
      point.date >= startDate && point.date <= endDate
    )
  }))
}

// Aggregate data points by time interval
export const aggregateByInterval = (
  series: TimeSeriesData,
  interval: 'hour' | 'day' | 'week' | 'month',
  aggregation: 'sum' | 'average' | 'min' | 'max' | 'count' = 'sum'
): TimeSeriesData => {
  const intervalMs = {
    hour: 3600000,    // 1 hour
    day: 86400000,    // 24 hours
    week: 604800000,  // 7 days
    month: 2592000000 // 30 days (approximate)
  }[interval]
  
  const grouped = series.points.reduce((acc, point) => {
    // Round down to interval boundary
    const intervalStart = Math.floor(point.date.getTime() / intervalMs) * intervalMs
    const key = intervalStart.toString()
    
    if (!acc[key]) {
      acc[key] = {
        date: new Date(intervalStart),
        values: [],
        metadata: []
      }
    }
    
    acc[key].values.push(point.value)
    acc[key].metadata.push(point.metadata)
    
    return acc
  }, {} as Record<string, { date: Date; values: number[]; metadata: any[] }>)
  
  const aggregatedPoints: TimeSeriesDataPoint[] = Object.values(grouped).map(group => {
    let value: number
    
    switch (aggregation) {
      case 'sum':
        value = group.values.reduce((sum, v) => sum + v, 0)
        break
      case 'average':
        value = group.values.reduce((sum, v) => sum + v, 0) / group.values.length
        break
      case 'min':
        value = Math.min(...group.values)
        break
      case 'max':
        value = Math.max(...group.values)
        break
      case 'count':
        value = group.values.length
        break
      default:
        value = group.values.reduce((sum, v) => sum + v, 0)
    }
    
    return {
      date: group.date,
      value,
      metadata: {
        aggregation,
        interval,
        count: group.values.length,
        originalMetadata: group.metadata
      }
    }
  })
  
  return {
    ...series,
    points: aggregatedPoints.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
}

// Resample data to target point count
export const resampleToTargetCount = (
  series: TimeSeriesData,
  targetCount: number
): TimeSeriesData => {
  if (series.points.length <= targetCount) return series
  
  const sortedPoints = [...series.points].sort((a, b) => a.date.getTime() - b.date.getTime())
  const step = Math.floor(sortedPoints.length / targetCount)
  
  const sampledPoints: TimeSeriesDataPoint[] = []
  for (let i = 0; i < sortedPoints.length; i += step) {
    sampledPoints.push(sortedPoints[i])
  }
  
  // Always include the last point
  const lastPoint = sortedPoints[sortedPoints.length - 1]
  if (sampledPoints[sampledPoints.length - 1] !== lastPoint) {
    sampledPoints.push(lastPoint)
  }
  
  return {
    ...series,
    points: sampledPoints
  }
}

// Calculate basic statistics for series
export const calculateSeriesStats = (series: TimeSeriesData) => {
  if (!series.points.length) {
    return { min: 0, max: 0, mean: 0, count: 0 }
  }
  
  const values = series.points.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  
  return { min, max, mean, count: values.length }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    transformTimeSeriesData,
    validateTimeSeriesData,
    sortTimeSeriesData,
    filterByDateRange,
    aggregateByInterval,
    resampleToTargetCount,
    calculateSeriesStats
  }
}