import * as d3 from 'd3'
import { TimeSeriesData } from '../types/time-series'

// Calculate layout for multi-line charts
export const calculateMultiLineLayout = (
  series: TimeSeriesData[],
  chartWidth: number,
  chartHeight: number
) => {
  const margins = { top: 20, right: 30, bottom: 40, left: 60 }
  
  // If we have a legend, adjust right margin
  const adjustedMargins = series.length > 1 
    ? { ...margins, right: Math.max(margins.right, 120) }
    : margins

  return {
    margins: adjustedMargins,
    plotWidth: chartWidth - adjustedMargins.left - adjustedMargins.right,
    plotHeight: chartHeight - adjustedMargins.top - adjustedMargins.bottom,
    legendWidth: series.length > 1 ? 100 : 0,
    legendPosition: { x: chartWidth - 110, y: 30 }
  }
}

// Get appropriate scales for multi-line data
export const getMultiLineScale = (
  series: TimeSeriesData[],
  plotWidth: number,
  plotHeight: number
) => {
  // Calculate combined domain for all series
  let minDate: Date | null = null
  let maxDate: Date | null = null
  let minValue = Infinity
  let maxValue = -Infinity

  series.forEach(s => {
    s.points.forEach(point => {
      if (!minDate || point.date < minDate) minDate = point.date
      if (!maxDate || point.date > maxDate) maxDate = point.date
      if (point.value < minValue) minValue = point.value
      if (point.value > maxValue) maxValue = point.value
    })
  })

  // Fallback if no data
  if (!minDate || !maxDate || minValue === Infinity) {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 86400000)
    minDate = dayAgo
    maxDate = now
    minValue = 0
    maxValue = 1
  }

  // Add padding to value domain
  const valuePadding = (maxValue - minValue) * 0.1
  
  const xScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, plotWidth])
    .nice()

  const yScale = d3.scaleLinear()
    .domain([minValue - valuePadding, maxValue + valuePadding])
    .range([plotHeight, 0])
    .nice()

  return { xScale, yScale }
}

// Manage series data for multi-line charts
export const manageSeries = (
  series: TimeSeriesData[],
  options: {
    maxSeries?: number
    colorScheme?: string[]
    sortBy?: 'name' | 'dataCount' | 'maxValue' | 'none'
  } = {}
) => {
  const { maxSeries = 10, colorScheme = d3.schemeCategory10, sortBy = 'none' } = options

  let processedSeries = [...series]

  // Sort series if requested
  if (sortBy === 'name') {
    processedSeries.sort((a, b) => a.label.localeCompare(b.label))
  } else if (sortBy === 'dataCount') {
    processedSeries.sort((a, b) => b.points.length - a.points.length)
  } else if (sortBy === 'maxValue') {
    processedSeries.sort((a, b) => {
      const maxA = Math.max(...a.points.map(p => p.value))
      const maxB = Math.max(...b.points.map(p => p.value))
      return maxB - maxA
    })
  }

  // Limit series count
  if (processedSeries.length > maxSeries) {
    console.warn(`Too many series (${processedSeries.length}). Showing first ${maxSeries}.`)
    processedSeries = processedSeries.slice(0, maxSeries)
  }

  // Assign colors
  const seriesWithColors = processedSeries.map((s, i) => ({
    ...s,
    color: s.color || colorScheme[i % colorScheme.length]
  }))

  return {
    series: seriesWithColors,
    truncated: series.length > maxSeries,
    originalCount: series.length
  }
}

// Generate legend data for multi-line charts
export const generateLegendData = (series: TimeSeriesData[]) => {
  return series.map((s, i) => ({
    id: s.id,
    label: s.label,
    color: s.color || d3.schemeCategory10[i % 10],
    visible: true,
    dataCount: s.points.length,
    lastValue: s.points.length > 0 ? s.points[s.points.length - 1].value : null
  }))
}

// Calculate optimal line spacing for readability
export const calculateLineSpacing = (
  seriesCount: number,
  plotHeight: number,
  strokeWidth: number = 2
) => {
  const minSpacing = strokeWidth * 3 // Minimum 3x stroke width between lines
  const availableSpace = plotHeight * 0.8 // Use 80% of plot height
  const calculatedSpacing = availableSpace / Math.max(1, seriesCount - 1)
  
  return Math.max(minSpacing, calculatedSpacing)
}

// Manage line visibility and interaction states
export const manageLineInteraction = (
  series: TimeSeriesData[],
  interactionState: {
    hoveredSeriesId?: string | null
    selectedSeriesIds?: string[]
    hiddenSeriesIds?: string[]
  }
) => {
  const { hoveredSeriesId, selectedSeriesIds = [], hiddenSeriesIds = [] } = interactionState

  return series.map(s => ({
    ...s,
    isHovered: hoveredSeriesId === s.id,
    isSelected: selectedSeriesIds.includes(s.id),
    isHidden: hiddenSeriesIds.includes(s.id),
    opacity: (() => {
      if (hiddenSeriesIds.includes(s.id)) return 0
      if (hoveredSeriesId && hoveredSeriesId !== s.id) return 0.3
      if (selectedSeriesIds.length > 0 && !selectedSeriesIds.includes(s.id)) return 0.5
      return 1
    })(),
    strokeWidth: hoveredSeriesId === s.id ? 3 : 2,
    zIndex: hoveredSeriesId === s.id ? 100 : selectedSeriesIds.includes(s.id) ? 50 : 10
  }))
}

// Calculate data density for performance optimization
export const calculateDataDensity = (
  series: TimeSeriesData[],
  plotWidth: number
) => {
  const totalPoints = series.reduce((sum, s) => sum + s.points.length, 0)
  const pointsPerPixel = totalPoints / plotWidth
  
  return {
    totalPoints,
    pointsPerPixel,
    dense: pointsPerPixel > 2, // More than 2 points per pixel
    suggestion: pointsPerPixel > 2 ? 'Consider data sampling' : 'Optimal density'
  }
}

// Generate multi-line chart paths efficiently
export const generateMultiLinePaths = (
  series: TimeSeriesData[],
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear
) => {
  const lineGenerator = d3.line<{ date: Date; value: number }>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(curve)
    .defined(d => d.value != null && !isNaN(d.value))

  return series.map(s => ({
    seriesId: s.id,
    path: lineGenerator(s.points) || '',
    color: s.color,
    strokeWidth: 2
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateMultiLineLayout,
    getMultiLineScale,
    manageSeries,
    generateLegendData,
    calculateLineSpacing,
    manageLineInteraction,
    calculateDataDensity,
    generateMultiLinePaths
  }
}