import * as d3 from 'd3'
import { TimeSeriesData } from '../types/time-series'

// Create time scale with nice formatting
export const createTimeScale = (
  domain: [Date, Date],
  range: [number, number],
  nice: boolean = true
): d3.ScaleTime<number, number> => {
  const scale = d3.scaleTime()
    .domain(domain)
    .range(range)
  
  if (nice) {
    scale.nice()
  }
  
  return scale
}

// Adapt time scale based on data density and screen width
export const adaptTimeScale = (
  data: TimeSeriesData[],
  availableWidth: number,
  margins: { left: number; right: number } = { left: 60, right: 20 }
): {
  scale: d3.ScaleTime<number, number>
  tickCount: number
  tickFormat: (date: Date) => string
} => {
  // Calculate time domain from data
  let minDate: Date | null = null
  let maxDate: Date | null = null
  
  data.forEach(series => {
    series.points.forEach(point => {
      if (!minDate || point.date < minDate) minDate = point.date
      if (!maxDate || point.date > maxDate) maxDate = point.date
    })
  })
  
  if (!minDate || !maxDate) {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86400000)
    minDate = dayAgo
    maxDate = now
  }
  
  const chartWidth = availableWidth - margins.left - margins.right
  const scale = createTimeScale([minDate, maxDate], [0, chartWidth])
  
  // Calculate optimal tick count based on available space
  const minTickSpacing = 80 // Minimum pixels between ticks
  const maxTicks = Math.floor(chartWidth / minTickSpacing)
  const tickCount = Math.max(2, Math.min(8, maxTicks))
  
  // Determine appropriate time format based on time span
  const timeSpan = maxDate.getTime() - minDate.getTime()
  const oneMinute = 60 * 1000
  const oneHour = 60 * oneMinute
  const oneDay = 24 * oneHour
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay
  const oneYear = 365 * oneDay
  
  let tickFormat: (date: Date) => string
  
  if (timeSpan < oneHour) {
    tickFormat = d3.timeFormat('%H:%M:%S')
  } else if (timeSpan < oneDay) {
    tickFormat = d3.timeFormat('%H:%M')
  } else if (timeSpan < oneWeek) {
    tickFormat = d3.timeFormat('%m/%d %H:%M')
  } else if (timeSpan < oneMonth) {
    tickFormat = d3.timeFormat('%m/%d')
  } else if (timeSpan < oneYear) {
    tickFormat = d3.timeFormat('%b %d')
  } else {
    tickFormat = d3.timeFormat('%Y')
  }
  
  return { scale, tickCount, tickFormat }
}

// Format time labels with intelligent formatting
export const formatTimeLabels = (
  dates: Date[],
  timeSpan: number,
  compact: boolean = false
): string[] => {
  const oneMinute = 60 * 1000
  const oneHour = 60 * oneMinute
  const oneDay = 24 * oneHour
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay
  const oneYear = 365 * oneDay
  
  let formatter: (date: Date) => string
  
  if (compact) {
    // Compact formatting for small screens
    if (timeSpan < oneHour) formatter = d3.timeFormat('%H:%M')
    else if (timeSpan < oneDay) formatter = d3.timeFormat('%H:%M')
    else if (timeSpan < oneMonth) formatter = d3.timeFormat('%m/%d')
    else if (timeSpan < oneYear) formatter = d3.timeFormat('%b')
    else formatter = d3.timeFormat('%Y')
  } else {
    // Full formatting for larger screens
    if (timeSpan < oneHour) formatter = d3.timeFormat('%H:%M:%S')
    else if (timeSpan < oneDay) formatter = d3.timeFormat('%I:%M %p')
    else if (timeSpan < oneWeek) formatter = d3.timeFormat('%a %m/%d')
    else if (timeSpan < oneMonth) formatter = d3.timeFormat('%m/%d')
    else if (timeSpan < oneYear) formatter = d3.timeFormat('%b %Y')
    else formatter = d3.timeFormat('%Y')
  }
  
  return dates.map(formatter)
}

// Create fiscal year time scale (July-June)
export const createFiscalYearScale = (
  domain: [Date, Date],
  range: [number, number]
): d3.ScaleTime<number, number> => {
  return d3.scaleTime()
    .domain(domain)
    .range(range)
    .nice(d3.timeYear)
}

// Get fiscal year from date (July 1 - June 30)
export const getFiscalYear = (date: Date): number => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // If before July (month 6), it's the previous fiscal year
  return month < 6 ? year : year + 1
}

// Create time brush for zooming/panning
export const createTimeBrush = (
  scale: d3.ScaleTime<number, number>,
  height: number,
  onBrush: (selection: [Date, Date] | null) => void
): d3.BrushBehavior<unknown> => {
  return d3.brushX()
    .extent([[0, 0], [scale.range()[1], height]])
    .on('brush end', function(event) {
      if (event.selection) {
        const [x0, x1] = event.selection
        const selection: [Date, Date] = [scale.invert(x0), scale.invert(x1)]
        onBrush(selection)
      } else {
        onBrush(null)
      }
    })
}

// Create zoom behavior for time scale
export const createTimeZoom = (
  scale: d3.ScaleTime<number, number>,
  onZoom: (newScale: d3.ScaleTime<number, number>) => void
): d3.ZoomBehavior<Element, unknown> => {
  return d3.zoom<Element, unknown>()
    .scaleExtent([0.1, 10])
    .on('zoom', function(event) {
      const newScale = event.transform.rescaleX(scale)
      onZoom(newScale)
    })
}

// Generate time ticks with intelligent intervals
export const generateTimeTicks = (
  scale: d3.ScaleTime<number, number>,
  tickCount: number
): Date[] => {
  return scale.ticks(tickCount)
}

// Calculate time intervals for data aggregation
export const calculateTimeInterval = (
  timeSpan: number,
  targetPointCount: number = 100
): {
  interval: d3.TimeInterval
  format: string
  description: string
} => {
  const intervalSize = timeSpan / targetPointCount
  
  const oneMinute = 60 * 1000
  const oneHour = 60 * oneMinute
  const oneDay = 24 * oneHour
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay
  
  if (intervalSize < oneMinute * 5) {
    return {
      interval: d3.timeMinute.every(1)!,
      format: '%H:%M',
      description: 'Every minute'
    }
  } else if (intervalSize < oneHour) {
    return {
      interval: d3.timeMinute.every(15)!,
      format: '%H:%M',
      description: 'Every 15 minutes'
    }
  } else if (intervalSize < oneDay) {
    return {
      interval: d3.timeHour.every(1)!,
      format: '%H:%M',
      description: 'Hourly'
    }
  } else if (intervalSize < oneWeek) {
    return {
      interval: d3.timeDay.every(1)!,
      format: '%m/%d',
      description: 'Daily'
    }
  } else if (intervalSize < oneMonth) {
    return {
      interval: d3.timeWeek.every(1)!,
      format: '%m/%d',
      description: 'Weekly'
    }
  } else {
    return {
      interval: d3.timeMonth.every(1)!,
      format: '%b %Y',
      description: 'Monthly'
    }
  }
}

// Create responsive time axis
export const createResponsiveTimeAxis = (
  scale: d3.ScaleTime<number, number>,
  orientation: 'top' | 'bottom' = 'bottom',
  screenWidth: number
): d3.Axis<Date> => {
  const tickCount = screenWidth < 768 ? 4 : screenWidth < 1024 ? 6 : 8
  const timeSpan = scale.domain()[1].getTime() - scale.domain()[0].getTime()
  const compact = screenWidth < 768
  
  const axis = orientation === 'top' ? d3.axisTop(scale) : d3.axisBottom(scale)
  
  return axis
    .ticks(tickCount)
    .tickFormat(d => {
      const formatter = compact ? 
        d3.timeFormat(timeSpan < 86400000 ? '%H:%M' : '%m/%d') :
        d3.timeFormat(timeSpan < 86400000 ? '%I:%M %p' : '%m/%d/%y')
      return formatter(d)
    })
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTimeScale,
    adaptTimeScale,
    formatTimeLabels,
    createFiscalYearScale,
    getFiscalYear,
    createTimeBrush,
    createTimeZoom,
    generateTimeTicks,
    calculateTimeInterval,
    createResponsiveTimeAxis
  }
}