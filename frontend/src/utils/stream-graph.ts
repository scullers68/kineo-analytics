import * as d3 from 'd3'
import { TimeSeriesData } from '../types/time-series'

// Calculate stream layout with various algorithms
export const calculateStreamLayout = (
  series: TimeSeriesData[],
  options: {
    order?: 'ascending' | 'descending' | 'inside-out' | 'reverse'
    offset?: 'wiggle' | 'silhouette' | 'expand'
  } = {}
) => {
  const { order = 'inside-out', offset = 'wiggle' } = options

  if (!series.length) return []

  // Get all unique dates across all series
  const allDates = new Set<number>()
  series.forEach(s => {
    s.points.forEach(point => {
      allDates.add(point.date.getTime())
    })
  })

  const sortedDates = Array.from(allDates).sort()

  // Create data matrix for D3.js stack
  const stackData = sortedDates.map(timestamp => {
    const date = new Date(timestamp)
    const dataPoint: any = { date, timestamp }
    
    series.forEach(s => {
      const point = s.points.find(p => p.date.getTime() === timestamp)
      dataPoint[s.id] = point ? point.value : 0
    })
    
    return dataPoint
  })

  // Configure D3.js stack with stream parameters
  const stack = d3.stack<any, string>()
    .keys(series.map(s => s.id))

  // Apply ordering
  switch (order) {
    case 'ascending':
      stack.order(d3.stackOrderAscending)
      break
    case 'descending':
      stack.order(d3.stackOrderDescending)
      break
    case 'inside-out':
      stack.order(d3.stackOrderInsideOut)
      break
    case 'reverse':
      stack.order(d3.stackOrderReverse)
      break
    default:
      stack.order(d3.stackOrderNone)
  }

  // Apply offset
  switch (offset) {
    case 'wiggle':
      stack.offset(d3.stackOffsetWiggle)
      break
    case 'silhouette':
      stack.offset(d3.stackOffsetSilhouette)
      break
    case 'expand':
      stack.offset(d3.stackOffsetExpand)
      break
    default:
      stack.offset(d3.stackOffsetNone)
  }

  const stackedSeries = stack(stackData)

  return stackedSeries.map(d => ({
    seriesId: d.key,
    label: series.find(s => s.id === d.key)?.label || d.key,
    color: series.find(s => s.id === d.key)?.color,
    points: d.map((point, i) => ({
      date: stackData[i].date,
      value: point.data[d.key],
      y0: point[0],
      y1: point[1]
    }))
  }))
}

// Create symmetric stream layout
export const createSymmetricStream = (
  series: TimeSeriesData[],
  centerline: number = 0
) => {
  const streamData = calculateStreamLayout(series, { 
    order: 'inside-out', 
    offset: 'silhouette' 
  })

  // Adjust to center around specified centerline
  if (centerline !== 0) {
    streamData.forEach(s => {
      s.points.forEach(point => {
        point.y0 += centerline
        point.y1 += centerline
      })
    })
  }

  return streamData
}

// Balance stream areas for better visual flow
export const balanceStreamAreas = (
  streamData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>,
  smoothingFactor: number = 0.3
) => {
  if (!streamData.length) return []

  const dates = streamData[0].points.map(p => p.date)

  // Apply smoothing to reduce harsh transitions
  const smoothedData = streamData.map(series => ({
    ...series,
    points: series.points.map((point, i) => {
      if (i === 0 || i === series.points.length - 1) return point

      const prev = series.points[i - 1]
      const next = series.points[i + 1]

      // Smooth the baseline using weighted average
      const smoothedY0 = (
        prev.y0 * smoothingFactor +
        point.y0 * (1 - 2 * smoothingFactor) +
        next.y0 * smoothingFactor
      )

      return {
        ...point,
        y0: smoothedY0,
        y1: smoothedY0 + point.value
      }
    })
  }))

  return smoothedData
}

// Calculate flow velocity for animation
export const calculateFlowVelocity = (
  streamData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
) => {
  return streamData.map(series => ({
    seriesId: series.seriesId,
    velocity: series.points.map((point, i) => {
      if (i === 0) return 0

      const prev = series.points[i - 1]
      const timeDiff = point.date.getTime() - prev.date.getTime()
      const valueDiff = point.value - prev.value
      const baselineDiff = point.y0 - prev.y0

      return {
        date: point.date,
        valueVelocity: valueDiff / timeDiff,
        baselineVelocity: baselineDiff / timeDiff,
        totalVelocity: Math.sqrt(valueDiff * valueDiff + baselineDiff * baselineDiff) / timeDiff
      }
    }).slice(1) // Skip first point (no velocity)
  }))
}

// Generate organic curves for stream paths
export const generateOrganicStreamPaths = (
  streamData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>
) => {
  // Use cardinal splines for organic, flowing curves
  const area = d3.area<{ date: Date; value: number; y0: number; y1: number }>()
    .x(d => xScale(d.date))
    .y0(d => yScale(d.y0))
    .y1(d => yScale(d.y1))
    .curve(d3.curveCardinal.tension(0.8)) // High tension for flowing curves

  return streamData.map(series => ({
    seriesId: series.seriesId,
    path: area(series.points) || '',
    color: series.color
  }))
}

// Calculate stream graph statistics
export const calculateStreamStats = (
  streamData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>
) => {
  if (!streamData.length) return null

  // Calculate overall bounds
  let minY = Infinity
  let maxY = -Infinity
  let totalVolume = 0

  streamData.forEach(series => {
    series.points.forEach(point => {
      if (point.y0 < minY) minY = point.y0
      if (point.y1 > maxY) maxY = point.y1
      totalVolume += point.value
    })
  })

  // Calculate flow characteristics
  const flowHeight = maxY - minY
  const centerline = (maxY + minY) / 2
  const symmetryScore = Math.abs(Math.abs(maxY - centerline) - Math.abs(centerline - minY)) / flowHeight

  // Calculate temporal characteristics
  const dates = streamData[0].points.map(p => p.date)
  const timeSpan = dates[dates.length - 1].getTime() - dates[0].getTime()

  return {
    bounds: { minY, maxY, flowHeight, centerline },
    volume: {
      total: totalVolume,
      average: totalVolume / (streamData.length * dates.length),
      byDate: dates.map((date, i) => ({
        date,
        total: streamData.reduce((sum, series) => sum + series.points[i].value, 0)
      }))
    },
    flow: {
      symmetryScore, // 0 = perfect symmetry, 1 = completely asymmetric
      timeSpan,
      seriesCount: streamData.length,
      dateCount: dates.length
    },
    series: streamData.map(series => {
      const values = series.points.map(p => p.value)
      const baselines = series.points.map(p => p.y0)
      
      return {
        seriesId: series.seriesId,
        volume: values.reduce((sum, v) => sum + v, 0),
        averageValue: values.reduce((sum, v) => sum + v, 0) / values.length,
        averageBaseline: baselines.reduce((sum, b) => sum + b, 0) / baselines.length,
        maxValue: Math.max(...values),
        minValue: Math.min(...values),
        variability: d3.deviation(values) || 0
      }
    })
  }
}

// Generate gradient definitions for stream areas
export const generateStreamGradients = (
  streamData: Array<{ seriesId: string; color?: string }>,
  opacity: { top: number; bottom: number } = { top: 0.8, bottom: 0.3 }
) => {
  return streamData.map((series, i) => {
    const color = series.color || d3.schemeCategory10[i % 10]
    const gradientId = `stream-gradient-${series.seriesId}`
    
    return {
      id: gradientId,
      seriesId: series.seriesId,
      stops: [
        { offset: '0%', color, opacity: opacity.top },
        { offset: '50%', color, opacity: (opacity.top + opacity.bottom) / 2 },
        { offset: '100%', color, opacity: opacity.bottom }
      ]
    }
  })
}

// Optimize stream for animation performance
export const optimizeStreamForAnimation = (
  streamData: Array<{
    seriesId: string
    points: Array<{ date: Date; value: number; y0: number; y1: number }>
  }>,
  maxPoints: number = 100
) => {
  if (!streamData.length) return []

  return streamData.map(series => {
    if (series.points.length <= maxPoints) return series

    // Sample points evenly across the time range
    const step = Math.floor(series.points.length / maxPoints)
    const sampledPoints = []
    
    for (let i = 0; i < series.points.length; i += step) {
      sampledPoints.push(series.points[i])
    }
    
    // Always include the last point
    if (sampledPoints[sampledPoints.length - 1] !== series.points[series.points.length - 1]) {
      sampledPoints.push(series.points[series.points.length - 1])
    }

    return {
      ...series,
      points: sampledPoints
    }
  })
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateStreamLayout,
    createSymmetricStream,
    balanceStreamAreas,
    calculateFlowVelocity,
    generateOrganicStreamPaths,
    calculateStreamStats,
    generateStreamGradients,
    optimizeStreamForAnimation
  }
}