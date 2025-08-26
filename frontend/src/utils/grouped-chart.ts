import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { ChartSeries } from '../types/chart-variants'

// Calculate layout for grouped bar/column charts
export const calculateGroupedLayout = (
  series: ChartSeries[],
  width: number,
  height: number,
  groupPadding: number = 0.05,
  seriesPadding: number = 0.02,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  // Get all unique x values across all series
  const xValues = Array.from(new Set(
    series.flatMap(s => s.data.map(d => String(d.x)))
  )).sort()
  
  // Create main scale for groups
  const groupScale = d3.scaleBand()
    .domain(xValues)
    .range(orientation === 'vertical' ? [0, width] : [height, 0])
    .padding(groupPadding)
  
  // Create scale for series within each group
  const seriesScale = d3.scaleBand()
    .domain(series.map(s => s.id))
    .range([0, groupScale.bandwidth()])
    .padding(seriesPadding)
  
  // Calculate value scale
  const allValues = series.flatMap(s => s.data.map(d => d.y))
  const maxValue = d3.max(allValues) || 0
  const minValue = Math.min(0, d3.min(allValues) || 0)
  
  const valueScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range(orientation === 'vertical' ? [height, 0] : [0, width])
    .nice()
  
  return {
    groupScale,
    seriesScale,
    valueScale,
    groupBandwidth: groupScale.bandwidth(),
    seriesBandwidth: seriesScale.bandwidth()
  }
}

// Get scale for grouped charts
export const getGroupedScale = (
  series: ChartSeries[],
  containerDimensions: { width: number; height: number },
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  return calculateGroupedLayout(
    series,
    containerDimensions.width,
    containerDimensions.height,
    0.05, // groupPadding
    0.02, // seriesPadding
    orientation
  )
}

// Position individual bars/columns in grouped layout
export const getGroupedBarPosition = (
  dataPoint: ChartDataPoint,
  seriesId: string,
  scales: ReturnType<typeof calculateGroupedLayout>,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const { groupScale, seriesScale, valueScale } = scales
  
  const groupPosition = groupScale(String(dataPoint.x)) || 0
  const seriesOffset = seriesScale(seriesId) || 0
  const valuePosition = valueScale(dataPoint.y)
  const zeroPosition = valueScale(0)
  
  if (orientation === 'vertical') {
    return {
      x: groupPosition + seriesOffset,
      y: Math.min(zeroPosition, valuePosition),
      width: seriesScale.bandwidth(),
      height: Math.abs(valuePosition - zeroPosition)
    }
  } else {
    return {
      x: Math.min(zeroPosition, valuePosition),
      y: groupPosition + seriesOffset,
      width: Math.abs(valuePosition - zeroPosition),
      height: seriesScale.bandwidth()
    }
  }
}

// Generate color scheme for grouped chart series
export const getGroupedColorScheme = (
  seriesCount: number,
  baseColors: string[] = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
): string[] => {
  if (seriesCount <= baseColors.length) {
    return baseColors.slice(0, seriesCount)
  }
  
  // Generate additional colors using d3 color schemes
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  return Array.from({ length: seriesCount }, (_, i) => 
    i < baseColors.length ? baseColors[i] : colorScale(i.toString())
  )
}

// Transform data into grouped series format
export const transformToGroupedSeries = (
  data: ChartDataPoint[],
  groupByKey: string = 'series'
): ChartSeries[] => {
  const groups = data.reduce((acc, item) => {
    const groupKey = item.metadata?.[groupByKey] || 'default'
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, ChartDataPoint[]>)
  
  return Object.entries(groups).map(([key, groupData], index) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    data: groupData,
    visible: true
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateGroupedLayout,
    getGroupedScale,
    getGroupedBarPosition,
    getGroupedColorScheme,
    transformToGroupedSeries
  }
}