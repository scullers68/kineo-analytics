import * as d3 from 'd3'
import { TimeSeriesDataPoint, TimeSeriesData, TimeSeriesGap, TimeFormatConfig } from '../types/time-series'

// Time axis formatting with adaptive behavior
export const formatTimeAxis = (domain: [Date, Date], width: number, config: TimeFormatConfig = {}): d3.AxisScale<Date> => {
  const timeSpan = domain[1].getTime() - domain[0].getTime()
  const pixelsPerTick = width / 8 // Target 8 ticks max
  
  let format: string
  if (timeSpan < 86400000) { // Less than 1 day
    format = config.format || '%H:%M'
  } else if (timeSpan < 2592000000) { // Less than 30 days
    format = config.format || '%m/%d'
  } else if (timeSpan < 31536000000) { // Less than 1 year
    format = config.format || '%b %Y'
  } else {
    format = config.format || '%Y'
  }
  
  const timeScale = d3.scaleTime()
    .domain(domain)
    .range([0, width])
  
  return timeScale
}

// Calculate time range from data
export const calculateTimeRange = (data: TimeSeriesData[]): [Date, Date] => {
  if (!data.length || !data.some(series => series.points.length > 0)) {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86400000)
    return [dayAgo, now]
  }
  
  let minDate = new Date(8640000000000000) // Max safe date
  let maxDate = new Date(-8640000000000000) // Min safe date
  
  data.forEach(series => {
    series.points.forEach(point => {
      if (point.date < minDate) minDate = point.date
      if (point.date > maxDate) maxDate = point.date
    })
  })
  
  return [minDate, maxDate]
}

// Detect gaps in time series data
export const detectTimeGaps = (
  series: TimeSeriesData, 
  gapThreshold: number = 86400000 // 24 hours in milliseconds
): TimeSeriesGap[] => {
  const gaps: TimeSeriesGap[] = []
  const sortedPoints = [...series.points].sort((a, b) => a.date.getTime() - b.date.getTime())
  
  for (let i = 1; i < sortedPoints.length; i++) {
    const prevPoint = sortedPoints[i - 1]
    const currentPoint = sortedPoints[i]
    const timeDiff = currentPoint.date.getTime() - prevPoint.date.getTime()
    
    if (timeDiff > gapThreshold) {
      gaps.push({
        startDate: prevPoint.date,
        endDate: currentPoint.date,
        duration: timeDiff,
        seriesId: series.id
      })
    }
  }
  
  return gaps
}

// Get intelligent time format based on range and screen size
export const getAdaptiveTimeFormat = (
  timeRange: [Date, Date], 
  screenWidth: number,
  maxTicks: number = 8
): string => {
  const [start, end] = timeRange
  const span = end.getTime() - start.getTime()
  const ticksNeeded = Math.min(maxTicks, screenWidth / 100)
  
  const oneMinute = 60 * 1000
  const oneHour = 60 * oneMinute
  const oneDay = 24 * oneHour
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay
  const oneYear = 365 * oneDay
  
  if (span < oneHour) return '%H:%M:%S'
  if (span < oneDay) return '%H:%M'
  if (span < oneWeek) return '%m/%d %H:%M'
  if (span < oneMonth) return '%m/%d'
  if (span < oneYear) return '%b %d'
  return '%Y'
}

// Create time scale with nice formatting
export const createNiceTimeScale = (
  domain: [Date, Date],
  range: [number, number],
  ticks?: number
): d3.ScaleTime<number, number> => {
  const scale = d3.scaleTime()
    .domain(domain)
    .range(range)
    .nice()
  
  return scale
}

// Format time labels for display
export const formatTimeLabels = (
  dates: Date[],
  format: string,
  locale: string = 'en-US'
): string[] => {
  const formatter = d3.timeFormat(format)
  return dates.map(date => formatter(date))
}

// Calculate optimal tick count for time axis
export const calculateOptimalTicks = (
  timeRange: [Date, Date],
  availableWidth: number,
  minSpacing: number = 80
): number => {
  return Math.max(2, Math.floor(availableWidth / minSpacing))
}

// Interpolate missing data points
export const interpolateMissingData = (
  points: TimeSeriesDataPoint[],
  method: 'linear' | 'polynomial' | 'none' = 'linear'
): TimeSeriesDataPoint[] => {
  if (method === 'none' || points.length < 2) return points
  
  const sortedPoints = [...points].sort((a, b) => a.date.getTime() - b.date.getTime())
  
  if (method === 'linear') {
    // Simple linear interpolation for demonstration
    // In a real implementation, you'd handle gaps more sophisticated
    return sortedPoints
  }
  
  return sortedPoints
}

// Validate time series data
export const validateTimeSeriesData = (data: TimeSeriesData[]): string[] => {
  const errors: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return errors
  }
  
  data.forEach((series, index) => {
    if (!series.id) {
      errors.push(`Series ${index} missing required id`)
    }
    if (!series.label) {
      errors.push(`Series ${index} missing required label`)
    }
    if (!Array.isArray(series.points)) {
      errors.push(`Series ${index} points must be an array`)
    } else {
      series.points.forEach((point, pointIndex) => {
        if (!(point.date instanceof Date)) {
          errors.push(`Series ${index} point ${pointIndex} date must be a Date object`)
        }
        if (typeof point.value !== 'number' || isNaN(point.value)) {
          errors.push(`Series ${index} point ${pointIndex} value must be a valid number`)
        }
      })
    }
  })
  
  return errors
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTimeAxis,
    calculateTimeRange,
    detectTimeGaps,
    getAdaptiveTimeFormat,
    createNiceTimeScale,
    formatTimeLabels,
    calculateOptimalTicks,
    interpolateMissingData,
    validateTimeSeriesData
  }
}