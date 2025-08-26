import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { ChartSeries } from '../types/chart-variants'

// Calculate layout for stacked bar/column charts
export const calculateStackedLayout = (
  series: ChartSeries[],
  width: number,
  height: number,
  barPadding: number = 0.1,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  // Get all unique x values
  const xValues = Array.from(new Set(
    series.flatMap(s => s.data.map(d => String(d.x)))
  )).sort()
  
  // Create band scale for x-axis
  const bandScale = d3.scaleBand()
    .domain(xValues)
    .range(orientation === 'vertical' ? [0, width] : [height, 0])
    .padding(barPadding)
  
  // Prepare data for d3.stack()
  const stackData = xValues.map(xValue => {
    const stackItem: any = { x: xValue }
    series.forEach(s => {
      const dataPoint = s.data.find(d => String(d.x) === xValue)
      stackItem[s.id] = dataPoint ? dataPoint.y : 0
    })
    return stackItem
  })
  
  // Create stack generator
  const stack = d3.stack<any>()
    .keys(series.map(s => s.id))
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)
  
  const stackedData = stack(stackData)
  
  // Calculate value scale from stacked totals
  const maxValue = d3.max(stackedData, layer => d3.max(layer, d => d[1])) || 0
  const minValue = d3.min(stackedData, layer => d3.min(layer, d => d[0])) || 0
  
  const valueScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range(orientation === 'vertical' ? [height, 0] : [0, width])
    .nice()
  
  return {
    bandScale,
    valueScale,
    stackedData,
    stackData,
    bandwidth: bandScale.bandwidth()
  }
}

// Get stacked data for rendering
export const getStackedData = (
  series: ChartSeries[],
  stackOrder: 'none' | 'ascending' | 'descending' | 'inside-out' = 'none',
  stackOffset: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle' = 'none'
) => {
  // Get all unique x values
  const xValues = Array.from(new Set(
    series.flatMap(s => s.data.map(d => String(d.x)))
  )).sort()
  
  // Prepare data for d3.stack()
  const stackData = xValues.map(xValue => {
    const stackItem: any = { x: xValue }
    series.forEach(s => {
      const dataPoint = s.data.find(d => String(d.x) === xValue)
      stackItem[s.id] = dataPoint ? dataPoint.y : 0
    })
    return stackItem
  })
  
  // Configure stack generator with options
  const stack = d3.stack<any>()
    .keys(series.map(s => s.id))
  
  // Set stack order
  switch (stackOrder) {
    case 'ascending':
      stack.order(d3.stackOrderAscending)
      break
    case 'descending':
      stack.order(d3.stackOrderDescending)
      break
    case 'inside-out':
      stack.order(d3.stackOrderInsideOut)
      break
    default:
      stack.order(d3.stackOrderNone)
  }
  
  // Set stack offset
  switch (stackOffset) {
    case 'expand':
      stack.offset(d3.stackOffsetExpand)
      break
    case 'diverging':
      stack.offset(d3.stackOffsetDiverging)
      break
    case 'silhouette':
      stack.offset(d3.stackOffsetSilhouette)
      break
    case 'wiggle':
      stack.offset(d3.stackOffsetWiggle)
      break
    default:
      stack.offset(d3.stackOffsetNone)
  }
  
  return {
    stackedData: stack(stackData),
    stackData,
    xValues
  }
}

// Position individual segments in stacked layout
export const getStackedBarPosition = (
  xValue: string,
  seriesId: string,
  stackedData: d3.Series<any, string>[],
  scales: { bandScale: d3.ScaleBand<string>; valueScale: d3.ScaleLinear<number, number> },
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const { bandScale, valueScale } = scales
  
  // Find the layer for this series
  const layer = stackedData.find(d => d.key === seriesId)
  if (!layer) {
    throw new Error(`Series ${seriesId} not found in stacked data`)
  }
  
  // Find the data point for this x value
  const dataPoint = layer.find(d => String(d.data.x) === xValue)
  if (!dataPoint) {
    throw new Error(`Data point for x=${xValue} not found`)
  }
  
  const bandPosition = bandScale(xValue) || 0
  const y0 = valueScale(dataPoint[0])
  const y1 = valueScale(dataPoint[1])
  
  if (orientation === 'vertical') {
    return {
      x: bandPosition,
      y: Math.min(y0, y1),
      width: bandScale.bandwidth(),
      height: Math.abs(y1 - y0)
    }
  } else {
    return {
      x: Math.min(y0, y1),
      y: bandPosition,
      width: Math.abs(y1 - y0),
      height: bandScale.bandwidth()
    }
  }
}

// Calculate totals for each stack
export const calculateStackTotals = (
  series: ChartSeries[]
): Record<string, number> => {
  const xValues = Array.from(new Set(
    series.flatMap(s => s.data.map(d => String(d.x)))
  ))
  
  return xValues.reduce((totals, xValue) => {
    const total = series.reduce((sum, s) => {
      const dataPoint = s.data.find(d => String(d.x) === xValue)
      return sum + (dataPoint ? dataPoint.y : 0)
    }, 0)
    totals[xValue] = total
    return totals
  }, {} as Record<string, number>)
}

// Transform data into stacked series format
export const transformToStackedSeries = (
  data: ChartDataPoint[],
  stackByKey: string = 'series'
): ChartSeries[] => {
  const groups = data.reduce((acc, item) => {
    const stackKey = item.metadata?.[stackByKey] || 'default'
    if (!acc[stackKey]) {
      acc[stackKey] = []
    }
    acc[stackKey].push(item)
    return acc
  }, {} as Record<string, ChartDataPoint[]>)
  
  return Object.entries(groups).map(([key, groupData]) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    data: groupData,
    visible: true
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateStackedLayout,
    getStackedData,
    getStackedBarPosition,
    calculateStackTotals,
    transformToStackedSeries
  }
}