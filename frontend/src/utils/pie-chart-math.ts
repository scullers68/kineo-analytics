import * as d3 from 'd3'
import { PieDataPoint, PieSlice } from '../types/pie-chart'

/**
 * Calculate the optimal radius for a pie chart based on available space
 */
export const calculateRadius = (width: number, height: number, margin: number = 20): number => {
  const availableWidth = width - (margin * 2)
  const availableHeight = height - (margin * 2)
  const minDimension = Math.min(availableWidth, availableHeight)
  return Math.max(minDimension / 2, 10) // Minimum radius of 10
}

/**
 * Calculate inner radius for donut charts
 */
export const calculateInnerRadius = (outerRadius: number, ratio: number = 0.5): number => {
  return Math.max(outerRadius * ratio, 0)
}

/**
 * Convert angle and radius to x,y coordinates
 */
export const angleToCoordinates = (
  angle: number, 
  radius: number, 
  centerX: number = 0, 
  centerY: number = 0
): [number, number] => {
  const x = centerX + radius * Math.cos(angle)
  const y = centerY + radius * Math.sin(angle)
  return [x, y]
}

/**
 * Calculate the centroid of a pie slice for label positioning
 */
export const calculateSliceCentroid = (slice: PieSlice): [number, number] => {
  const angle = (slice.startAngle + slice.endAngle) / 2
  const radius = (slice.innerRadius + slice.outerRadius) / 2
  return angleToCoordinates(angle, radius)
}

/**
 * Calculate label position outside the pie chart
 */
export const calculateLabelPosition = (
  slice: PieSlice, 
  labelDistance: number = 10
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } => {
  const angle = (slice.startAngle + slice.endAngle) / 2
  const radius = slice.outerRadius + labelDistance
  const [x, y] = angleToCoordinates(angle, radius)
  
  // Determine text anchor based on angle
  let anchor: 'start' | 'middle' | 'end' = 'middle'
  const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
  
  if (normalizedAngle > Math.PI / 6 && normalizedAngle < 5 * Math.PI / 6) {
    anchor = 'start'
  } else if (normalizedAngle > 7 * Math.PI / 6 && normalizedAngle < 11 * Math.PI / 6) {
    anchor = 'end'
  }
  
  return { x, y, anchor }
}

/**
 * Check if two labels collide
 */
export const labelsCollide = (
  label1: { x: number; y: number; width: number; height: number },
  label2: { x: number; y: number; width: number; height: number },
  padding: number = 4
): boolean => {
  return !(
    label1.x + label1.width + padding < label2.x ||
    label2.x + label2.width + padding < label1.x ||
    label1.y + label1.height + padding < label2.y ||
    label2.y + label2.height + padding < label1.y
  )
}

/**
 * Calculate explode offset for a slice
 */
export const calculateExplodeOffset = (
  slice: PieSlice, 
  explodeDistance: number
): { dx: number; dy: number } => {
  const angle = (slice.startAngle + slice.endAngle) / 2
  const dx = Math.cos(angle) * explodeDistance
  const dy = Math.sin(angle) * explodeDistance
  return { dx, dy }
}

/**
 * Calculate the percentage each slice represents
 */
export const calculatePercentages = (data: PieDataPoint[]): PieDataPoint[] => {
  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0)
  
  if (total === 0) return data
  
  return data.map(d => ({
    ...d,
    percentage: Math.abs(d.value) / total * 100
  }))
}

/**
 * Sort pie data by value (descending by default)
 */
export const sortPieData = (
  data: PieDataPoint[], 
  ascending: boolean = false
): PieDataPoint[] => {
  return [...data].sort((a, b) => {
    const comparison = Math.abs(b.value) - Math.abs(a.value)
    return ascending ? -comparison : comparison
  })
}

/**
 * Group small slices into "Others" category
 */
export const groupSmallSlices = (
  data: PieDataPoint[], 
  threshold: number = 5, // percentage
  othersLabel: string = 'Others'
): PieDataPoint[] => {
  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0)
  const thresholdValue = (threshold / 100) * total
  
  const largeSlices = data.filter(d => Math.abs(d.value) >= thresholdValue)
  const smallSlices = data.filter(d => Math.abs(d.value) < thresholdValue)
  
  if (smallSlices.length <= 1) {
    return data // No need to group if only one small slice or none
  }
  
  const othersValue = smallSlices.reduce((sum, d) => sum + d.value, 0)
  const othersSlice: PieDataPoint = {
    x: othersLabel,
    y: 0,
    value: othersValue,
    label: othersLabel,
    category: 'grouped',
    metadata: {
      originalSlices: smallSlices,
      count: smallSlices.length
    }
  }
  
  return [...largeSlices, othersSlice]
}

/**
 * Calculate arc path for custom rendering
 */
export const calculateArcPath = (
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number = 0
): string => {
  const arc = d3.arc<PieSlice>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)
  
  const arcData = {
    startAngle,
    endAngle,
    innerRadius,
    outerRadius
  } as any
  
  return arc(arcData) || ''
}

/**
 * Calculate the best font size for slice labels
 */
export const calculateLabelFontSize = (
  sliceAngle: number,
  radius: number,
  maxFontSize: number = 14,
  minFontSize: number = 8
): number => {
  // Estimate available space based on arc length
  const arcLength = sliceAngle * radius
  const estimatedCharWidth = 6 // Rough estimate for character width
  const availableChars = arcLength / estimatedCharWidth
  
  // Scale font size based on available space
  let fontSize = Math.min(maxFontSize, availableChars * 1.5)
  fontSize = Math.max(minFontSize, fontSize)
  
  return Math.round(fontSize)
}

/**
 * Determine if a label should be visible based on slice size
 */
export const shouldShowLabel = (
  slice: PieSlice,
  minAngle: number = 0.1, // radians
  minPercentage: number = 2 // percent
): boolean => {
  const sliceAngle = slice.endAngle - slice.startAngle
  const slicePercentage = (sliceAngle / (2 * Math.PI)) * 100
  
  return sliceAngle >= minAngle && slicePercentage >= minPercentage
}

/**
 * Calculate responsive dimensions based on container size
 */
export const calculateResponsiveDimensions = (
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 1,
  minSize: number = 200,
  maxSize: number = 800
): { width: number; height: number; radius: number } => {
  let width = Math.min(containerWidth, maxSize)
  let height = width / aspectRatio
  
  if (height > containerHeight) {
    height = Math.min(containerHeight, maxSize)
    width = height * aspectRatio
  }
  
  width = Math.max(width, minSize)
  height = Math.max(height, minSize)
  
  const radius = calculateRadius(width, height)
  
  return { width, height, radius }
}

/**
 * Normalize angles to 0-2π range
 */
export const normalizeAngle = (angle: number): number => {
  return ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
}

/**
 * Check if point is inside a pie slice
 */
export const pointInSlice = (
  x: number,
  y: number,
  slice: PieSlice,
  centerX: number = 0,
  centerY: number = 0
): boolean => {
  const dx = x - centerX
  const dy = y - centerY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const normalizedAngle = normalizeAngle(angle)
  
  // Check if point is within radius bounds
  if (distance < slice.innerRadius || distance > slice.outerRadius) {
    return false
  }
  
  // Check if point is within angle bounds
  const normalizedStart = normalizeAngle(slice.startAngle)
  const normalizedEnd = normalizeAngle(slice.endAngle)
  
  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
  } else {
    // Handle wrap-around case
    return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRadius,
    calculateInnerRadius,
    angleToCoordinates,
    calculateSliceCentroid,
    calculateLabelPosition,
    labelsCollide,
    calculateExplodeOffset,
    calculatePercentages,
    sortPieData,
    groupSmallSlices,
    calculateArcPath,
    calculateLabelFontSize,
    shouldShowLabel,
    calculateResponsiveDimensions,
    normalizeAngle,
    pointInSlice
  }
}