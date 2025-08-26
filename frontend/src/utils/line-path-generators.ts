import * as d3 from 'd3'
import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'

// Generate SVG path for line chart
export const generateLinePath = (
  data: TimeSeriesDataPoint[],
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear
): string => {
  if (!data.length) return ''
  
  const lineGenerator = d3.line<TimeSeriesDataPoint>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(curve)
    .defined(d => d.value != null && !isNaN(d.value))
  
  return lineGenerator(data) || ''
}

// Generate SVG path for area chart
export const generateAreaPath = (
  data: TimeSeriesDataPoint[],
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear,
  baseline?: number
): string => {
  if (!data.length) return ''
  
  const areaGenerator = d3.area<TimeSeriesDataPoint>()
    .x(d => xScale(d.date))
    .y0(baseline !== undefined ? yScale(baseline) : yScale.range()[0])
    .y1(d => yScale(d.value))
    .curve(curve)
    .defined(d => d.value != null && !isNaN(d.value))
  
  return areaGenerator(data) || ''
}

// Generate multiple line paths for multi-series data
export const generateMultiLinePaths = (
  series: TimeSeriesData[],
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear
): Array<{ seriesId: string; path: string }> => {
  return series.map(s => ({
    seriesId: s.id,
    path: generateLinePath(s.points, xScale, yScale, curve)
  }))
}

// Generate stacked area paths
export const generateStackedAreaPaths = (
  stackedData: Array<{ seriesId: string; points: Array<{ date: Date; y0: number; y1: number }> }>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear
): Array<{ seriesId: string; path: string }> => {
  return stackedData.map(stack => ({
    seriesId: stack.seriesId,
    path: d3.area<{ date: Date; y0: number; y1: number }>()
      .x(d => xScale(d.date))
      .y0(d => yScale(d.y0))
      .y1(d => yScale(d.y1))
      .curve(curve)(stack.points) || ''
  }))
}

// Get curve interpolation function by name
export const getCurveInterpolation = (interpolation: string): d3.CurveFactory => {
  switch (interpolation) {
    case 'linear': return d3.curveLinear
    case 'monotone': return d3.curveMonotoneX
    case 'cardinal': return d3.curveCardinal
    case 'step': return d3.curveStep
    case 'basis': return d3.curveBasis
    case 'bundle': return d3.curveBundle
    case 'catmull-rom': return d3.curveCatmullRom
    default: return d3.curveLinear
  }
}

// Calculate path length for animation
export const calculatePathLength = (pathElement: SVGPathElement): number => {
  return pathElement.getTotalLength()
}

// Create path with dash array for animation
export const createAnimatedPath = (
  pathElement: SVGPathElement,
  duration: number = 1000
): void => {
  const length = calculatePathLength(pathElement)
  
  // Set up initial state for draw animation
  pathElement.style.strokeDasharray = `${length} ${length}`
  pathElement.style.strokeDashoffset = String(length)
  
  // Animate the stroke-dashoffset
  d3.select(pathElement)
    .transition()
    .duration(duration)
    .ease(d3.easeLinear)
    .style('stroke-dashoffset', '0')
}

// Generate gradient definition for area charts
export const generateAreaGradient = (
  id: string,
  color: string,
  opacity: { start: number; end: number } = { start: 0.8, end: 0.1 }
): string => {
  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:${opacity.start}" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:${opacity.end}" />
    </linearGradient>
  `
}

// Calculate smooth transitions between data updates
export const morphPath = (
  fromPath: string,
  toPath: string,
  pathElement: SVGPathElement,
  duration: number = 500
): void => {
  d3.select(pathElement)
    .transition()
    .duration(duration)
    .ease(d3.easeQuadInOut)
    .attrTween('d', function() {
      return d3.interpolatePath(fromPath, toPath)
    })
}

// Create path with gaps for missing data
export const generatePathWithGaps = (
  data: TimeSeriesDataPoint[],
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  curve: d3.CurveFactory = d3.curveLinear,
  gapThreshold: number = 86400000 // 24 hours
): string[] => {
  if (!data.length) return []
  
  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime())
  const segments: TimeSeriesDataPoint[][] = []
  let currentSegment: TimeSeriesDataPoint[] = [sortedData[0]]
  
  for (let i = 1; i < sortedData.length; i++) {
    const timeDiff = sortedData[i].date.getTime() - sortedData[i - 1].date.getTime()
    
    if (timeDiff > gapThreshold) {
      segments.push(currentSegment)
      currentSegment = [sortedData[i]]
    } else {
      currentSegment.push(sortedData[i])
    }
  }
  
  if (currentSegment.length > 0) {
    segments.push(currentSegment)
  }
  
  return segments.map(segment => generateLinePath(segment, xScale, yScale, curve))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateLinePath,
    generateAreaPath,
    generateMultiLinePaths,
    generateStackedAreaPaths,
    getCurveInterpolation,
    calculatePathLength,
    createAnimatedPath,
    generateAreaGradient,
    morphPath,
    generatePathWithGaps
  }
}