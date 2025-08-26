import * as d3 from 'd3'
import { TimeSeriesData } from '../types/time-series'

// Calculate layout for stacked area charts
export const calculateStackedAreaLayout = (
  series: TimeSeriesData[],
  stackOrder: 'none' | 'ascending' | 'descending' | 'inside-out' = 'none'
) => {
  if (!series.length) return []

  // Get all unique dates across all series
  const allDates = new Set<number>()
  series.forEach(s => {
    s.points.forEach(point => {
      allDates.add(point.date.getTime())
    })
  })

  const sortedDates = Array.from(allDates).sort()

  // Create data matrix: [date][seriesIndex] = value
  const dataMatrix: number[][] = []
  const dateMap = new Map<number, number>()

  sortedDates.forEach((timestamp, dateIndex) => {
    dateMap.set(timestamp, dateIndex)
    dataMatrix[dateIndex] = new Array(series.length).fill(0)
  })

  // Fill the matrix with actual values
  series.forEach((s, seriesIndex) => {
    s.points.forEach(point => {
      const dateIndex = dateMap.get(point.date.getTime())
      if (dateIndex !== undefined) {
        dataMatrix[dateIndex][seriesIndex] = point.value
      }
    })
  })

  // Apply stack ordering
  let seriesIndices = series.map((_, i) => i)
  if (stackOrder === 'ascending') {
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    seriesIndices = seriesIndices.sort((a, b) => sums[a] - sums[b])
  } else if (stackOrder === 'descending') {
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    seriesIndices = seriesIndices.sort((a, b) => sums[b] - sums[a])
  } else if (stackOrder === 'inside-out') {
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    const sorted = seriesIndices.sort((a, b) => sums[b] - sums[a])
    seriesIndices = []
    
    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) {
        seriesIndices.push(sorted[i])
      } else {
        seriesIndices.unshift(sorted[i])
      }
    }
  }

  return seriesIndices.map(seriesIndex => ({
    seriesIndex,
    series: series[seriesIndex],
    order: seriesIndices.indexOf(seriesIndex)
  }))
}

// Get stacked area data with baseline calculations
export const getStackedAreaData = (
  series: TimeSeriesData[],
  stackOrder: 'none' | 'ascending' | 'descending' | 'inside-out' = 'none'
) => {
  const layout = calculateStackedAreaLayout(series, stackOrder)
  if (!layout.length) return []

  // Get all unique dates
  const allDates = new Set<number>()
  series.forEach(s => {
    s.points.forEach(point => {
      allDates.add(point.date.getTime())
    })
  })

  const sortedDates = Array.from(allDates).sort()

  // Build stacked data
  const stackedData = layout.map(({ seriesIndex, series: s }) => {
    const points = sortedDates.map(timestamp => {
      const date = new Date(timestamp)
      
      // Find the value for this series at this date
      const point = s.points.find(p => p.date.getTime() === timestamp)
      const value = point ? point.value : 0

      // Calculate baseline (sum of all previous series at this date)
      const y0 = layout
        .slice(0, layout.findIndex(l => l.seriesIndex === seriesIndex))
        .reduce((sum, prevLayout) => {
          const prevPoint = prevLayout.series.points.find(p => p.date.getTime() === timestamp)
          return sum + (prevPoint ? prevPoint.value : 0)
        }, 0)

      return {
        date,
        value,
        y0,
        y1: y0 + value
      }
    })

    return {
      seriesId: s.id,
      label: s.label,
      color: s.color,
      points
    }
  })

  return stackedData
}

// Create D3.js area stack
export const createAreaStack = (
  series: TimeSeriesData[],
  keys?: string[]
) => {
  if (!keys) {
    keys = series.map(s => s.id)
  }

  // Prepare data for D3.js stack layout
  const allDates = new Set<number>()
  series.forEach(s => {
    s.points.forEach(point => {
      allDates.add(point.date.getTime())
    })
  })

  const stackData = Array.from(allDates).sort().map(timestamp => {
    const date = new Date(timestamp)
    const dataPoint: any = { date, timestamp }
    
    series.forEach(s => {
      const point = s.points.find(p => p.date.getTime() === timestamp)
      dataPoint[s.id] = point ? point.value : 0
    })
    
    return dataPoint
  })

  // Create D3.js stack
  const stack = d3.stack<any, string>()
    .keys(keys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

  const stackedSeries = stack(stackData)

  return stackedSeries.map((d, i) => ({
    key: d.key,
    seriesId: d.key,
    label: series.find(s => s.id === d.key)?.label || d.key,
    color: series.find(s => s.id === d.key)?.color,
    data: d.map((point, j) => ({
      date: stackData[j].date,
      y0: point[0],
      y1: point[1],
      value: point[1] - point[0]
    }))
  }))
}

// Calculate percentage values for percentage stacked areas
export const calculatePercentageStack = (
  stackedData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
) => {
  if (!stackedData.length) return []

  const dates = stackedData[0].points.map(p => p.date)

  return stackedData.map(series => ({
    ...series,
    points: series.points.map((point, dateIndex) => {
      // Calculate total at this date
      const totalAtDate = stackedData.reduce((sum, s) => 
        sum + s.points[dateIndex].value, 0
      )

      if (totalAtDate === 0) {
        return {
          ...point,
          percentage: 0,
          y0: 0,
          y1: 0
        }
      }

      // Calculate percentage baseline
      const percentageY0 = stackedData
        .slice(0, stackedData.indexOf(series))
        .reduce((sum, s) => sum + (s.points[dateIndex].value / totalAtDate), 0)

      const percentage = point.value / totalAtDate
      const percentageY1 = percentageY0 + percentage

      return {
        ...point,
        percentage: percentage * 100, // Convert to percentage
        y0: percentageY0,
        y1: percentageY1
      }
    })
  }))
}

// Validate stacked area data
export const validateStackedData = (
  stackedData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
) => {
  const errors: string[] = []

  if (!stackedData.length) {
    errors.push('No stacked data provided')
    return errors
  }

  // Check that all series have the same date points
  const referenceDates = stackedData[0].points.map(p => p.date.getTime())
  
  stackedData.forEach((series, seriesIndex) => {
    if (series.points.length !== referenceDates.length) {
      errors.push(`Series ${seriesIndex} has different number of points`)
    }

    series.points.forEach((point, pointIndex) => {
      if (point.date.getTime() !== referenceDates[pointIndex]) {
        errors.push(`Series ${seriesIndex} point ${pointIndex} has mismatched date`)
      }

      if (point.y0 < 0) {
        errors.push(`Series ${seriesIndex} point ${pointIndex} has negative baseline`)
      }

      if (point.y1 < point.y0) {
        errors.push(`Series ${seriesIndex} point ${pointIndex} has y1 < y0`)
      }

      if (point.value !== point.y1 - point.y0) {
        errors.push(`Series ${seriesIndex} point ${pointIndex} value inconsistent with y0/y1`)
      }
    })
  })

  return errors
}

// Calculate stacked area statistics
export const calculateStackedStats = (
  stackedData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
) => {
  if (!stackedData.length) return null

  const dates = stackedData[0].points.map(p => p.date)
  
  const stats = {
    seriesCount: stackedData.length,
    dateCount: dates.length,
    totalsByDate: dates.map((date, dateIndex) => ({
      date,
      total: stackedData.reduce((sum, series) => sum + series.points[dateIndex].value, 0),
      maxY: Math.max(...stackedData.map(series => series.points[dateIndex].y1))
    })),
    seriesStats: stackedData.map(series => ({
      seriesId: series.seriesId,
      sum: series.points.reduce((sum, p) => sum + p.value, 0),
      avg: series.points.reduce((sum, p) => sum + p.value, 0) / series.points.length,
      min: Math.min(...series.points.map(p => p.value)),
      max: Math.max(...series.points.map(p => p.value))
    }))
  }

  return stats
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateStackedAreaLayout,
    getStackedAreaData,
    createAreaStack,
    calculatePercentageStack,
    validateStackedData,
    calculateStackedStats
  }
}