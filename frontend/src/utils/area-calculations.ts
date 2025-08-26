import * as d3 from 'd3'
import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'

// Interface for stacked area data
interface StackedAreaPoint {
  date: Date
  values: number[]
  y0: number[]
  y1: number[]
}

// Calculate stacked area layout
export const calculateStackedAreas = (
  series: TimeSeriesData[],
  stackOrder: 'none' | 'ascending' | 'descending' | 'inside-out' = 'none'
): Array<{ 
  seriesId: string
  label: string
  color?: string
  points: Array<{ date: Date; value: number; y0: number; y1: number }> 
}> => {
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
  
  // Apply stack order
  let seriesIndices = series.map((_, i) => i)
  if (stackOrder === 'ascending') {
    // Order by sum of values (ascending)
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    seriesIndices = seriesIndices.sort((a, b) => sums[a] - sums[b])
  } else if (stackOrder === 'descending') {
    // Order by sum of values (descending)
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    seriesIndices = seriesIndices.sort((a, b) => sums[b] - sums[a])
  } else if (stackOrder === 'inside-out') {
    // Place largest series in center
    const sums = series.map(s => s.points.reduce((sum, p) => sum + p.value, 0))
    const sorted = seriesIndices.sort((a, b) => sums[b] - sums[a])
    seriesIndices = []
    
    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) {
        seriesIndices.push(sorted[i]) // Add to right
      } else {
        seriesIndices.unshift(sorted[i]) // Add to left
      }
    }
  }
  
  // Calculate stacked positions
  const result: Array<{
    seriesId: string
    label: string
    color?: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }> = []
  
  seriesIndices.forEach(seriesIndex => {
    const s = series[seriesIndex]
    const points: Array<{ date: Date; value: number; y0: number; y1: number }> = []
    
    sortedDates.forEach((timestamp, dateIndex) => {
      const date = new Date(timestamp)
      const value = dataMatrix[dateIndex][seriesIndex]
      
      // Calculate baseline (sum of all previous series at this date)
      const y0 = seriesIndices
        .slice(0, seriesIndices.indexOf(seriesIndex))
        .reduce((sum, prevIndex) => sum + dataMatrix[dateIndex][prevIndex], 0)
      
      const y1 = y0 + value
      
      points.push({ date, value, y0, y1 })
    })
    
    result.push({
      seriesId: s.id,
      label: s.label,
      color: s.color,
      points
    })
  })
  
  return result
}

// Calculate stream graph layout (symmetric stacking)
export const calculateStreamGraph = (
  series: TimeSeriesData[],
  streamOffset: 'wiggle' | 'silhouette' | 'expand' = 'wiggle'
): Array<{
  seriesId: string
  label: string
  color?: string
  points: Array<{ date: Date; value: number; y0: number; y1: number }>
}> => {
  // Start with basic stacking
  const stacked = calculateStackedAreas(series, 'inside-out')
  
  if (!stacked.length) return []
  
  // Get all dates
  const dates = stacked[0].points.map(p => p.date)
  
  if (streamOffset === 'silhouette') {
    // Center the stream around y=0
    dates.forEach((date, dateIndex) => {
      const totalAtDate = stacked.reduce((sum, s) => sum + s.points[dateIndex].value, 0)
      const offset = -totalAtDate / 2
      
      stacked.forEach(s => {
        s.points[dateIndex].y0 += offset
        s.points[dateIndex].y1 += offset
      })
    })
  } else if (streamOffset === 'expand') {
    // Normalize to percentage (0-1)
    dates.forEach((date, dateIndex) => {
      const totalAtDate = stacked.reduce((sum, s) => sum + s.points[dateIndex].value, 0)
      
      if (totalAtDate > 0) {
        stacked.forEach(s => {
          const point = s.points[dateIndex]
          point.y0 = point.y0 / totalAtDate
          point.y1 = point.y1 / totalAtDate
        })
      }
    })
  } else if (streamOffset === 'wiggle') {
    // Minimize weighted change in slope
    // This is a simplified version - full wiggle is more complex
    dates.forEach((date, dateIndex) => {
      if (dateIndex === 0 || dateIndex === dates.length - 1) return
      
      // Calculate center of mass
      let weightedSum = 0
      let totalWeight = 0
      
      stacked.forEach(s => {
        const prev = s.points[dateIndex - 1].value
        const curr = s.points[dateIndex].value
        const next = s.points[dateIndex + 1].value
        
        const weight = Math.abs(next - prev)
        const center = s.points[dateIndex].y0 + curr / 2
        
        weightedSum += center * weight
        totalWeight += weight
      })
      
      if (totalWeight > 0) {
        const centerOfMass = weightedSum / totalWeight
        const currentCenter = stacked.reduce((sum, s, i) => {
          return sum + (s.points[dateIndex].y0 + s.points[dateIndex].value / 2)
        }, 0) / stacked.length
        
        const offset = centerOfMass - currentCenter
        
        stacked.forEach(s => {
          s.points[dateIndex].y0 += offset
          s.points[dateIndex].y1 += offset
        })
      }
    })
  }
  
  return stacked
}

// Balance stream areas for aesthetic appeal
export const balanceStreamAreas = (
  stackedData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
): Array<{
  seriesId: string
  points: Array<{ date: Date; value: number; y0: number; y1: number }>
}> => {
  if (!stackedData.length) return []
  
  const dates = stackedData[0].points.map(p => p.date)
  
  // Apply smoothing to reduce harsh transitions
  dates.forEach((date, dateIndex) => {
    if (dateIndex === 0 || dateIndex === dates.length - 1) return
    
    stackedData.forEach(series => {
      const points = series.points
      const prev = points[dateIndex - 1]
      const curr = points[dateIndex]
      const next = points[dateIndex + 1]
      
      // Smooth the baseline using weighted average
      const smoothedY0 = (prev.y0 + 2 * curr.y0 + next.y0) / 4
      const smoothedY1 = smoothedY0 + curr.value
      
      points[dateIndex].y0 = smoothedY0
      points[dateIndex].y1 = smoothedY1
    })
  })
  
  return stackedData
}

// Calculate area between two series (for difference charts)
export const calculateAreaBetween = (
  series1: TimeSeriesData,
  series2: TimeSeriesData
): Array<{ date: Date; upper: number; lower: number; difference: number }> => {
  // Create a map of dates to values for series2
  const series2Map = new Map<number, number>()
  series2.points.forEach(point => {
    series2Map.set(point.date.getTime(), point.value)
  })
  
  // Calculate differences for each point in series1
  return series1.points.map(point => {
    const series2Value = series2Map.get(point.date.getTime()) || 0
    const upper = Math.max(point.value, series2Value)
    const lower = Math.min(point.value, series2Value)
    const difference = point.value - series2Value
    
    return {
      date: point.date,
      upper,
      lower,
      difference
    }
  })
}

// Normalize stacked areas to percentages
export const normalizeToPercent = (
  stackedData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
): Array<{
  seriesId: string
  points: Array<{ date: Date; value: number; y0: number; y1: number }>
}> => {
  if (!stackedData.length) return []
  
  const dates = stackedData[0].points.map(p => p.date)
  
  dates.forEach((date, dateIndex) => {
    // Calculate total at this date
    const totalAtDate = stackedData.reduce((sum, series) => {
      return sum + series.points[dateIndex].value
    }, 0)
    
    if (totalAtDate > 0) {
      // Convert to percentages
      stackedData.forEach(series => {
        const point = series.points[dateIndex]
        const percentage = point.value / totalAtDate
        
        point.value = percentage
        point.y0 = point.y0 / totalAtDate
        point.y1 = point.y1 / totalAtDate
      })
    }
  })
  
  return stackedData
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateStackedAreas,
    calculateStreamGraph,
    balanceStreamAreas,
    calculateAreaBetween,
    normalizeToPercent
  }
}