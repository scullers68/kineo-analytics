import { ChartDataPoint } from '../types/store'

// Determine optimal chart orientation based on data characteristics
export const getOptimalOrientation = (
  data: ChartDataPoint[],
  containerWidth: number = 800,
  containerHeight: number = 400
): 'horizontal' | 'vertical' => {
  // If no data, default to vertical
  if (!data.length) return 'vertical'
  
  // Calculate average label length
  const averageLabelLength = data.reduce((sum, item) => {
    const label = item.label || String(item.x)
    return sum + label.length
  }, 0) / data.length
  
  // Calculate number of data points
  const dataPointCount = data.length
  
  // Determine if labels are likely to overlap in vertical orientation
  const estimatedLabelWidth = averageLabelLength * 8 // Rough estimate: 8px per character
  const availableWidthPerBar = containerWidth / dataPointCount
  
  // Use horizontal if labels are too long or too many data points
  if (estimatedLabelWidth > availableWidthPerBar || dataPointCount > 15) {
    return 'horizontal'
  }
  
  // Check aspect ratio preference
  const aspectRatio = containerWidth / containerHeight
  if (aspectRatio > 2) {
    return 'horizontal' // Wide containers favor horizontal bars
  }
  
  return 'vertical' // Default to vertical columns
}

// Check if horizontal orientation should be used
export const shouldUseHorizontal = (
  data: ChartDataPoint[],
  options: {
    containerWidth?: number
    containerHeight?: number
    maxLabelLength?: number
    maxDataPoints?: number
  } = {}
): boolean => {
  const {
    containerWidth = 800,
    containerHeight = 400,
    maxLabelLength = 20,
    maxDataPoints = 15
  } = options
  
  if (!data.length) return false
  
  // Check for long labels
  const hasLongLabels = data.some(item => {
    const label = item.label || String(item.x)
    return label.length > maxLabelLength
  })
  
  // Check for too many data points
  const hasTooManyPoints = data.length > maxDataPoints
  
  // Check aspect ratio
  const aspectRatio = containerWidth / containerHeight
  const isWideContainer = aspectRatio > 2
  
  return hasLongLabels || hasTooManyPoints || isWideContainer
}

// Get recommended dimensions based on orientation
export const getRecommendedDimensions = (
  data: ChartDataPoint[],
  orientation: 'horizontal' | 'vertical',
  containerWidth?: number,
  containerHeight?: number
) => {
  const dataPointCount = data.length
  
  if (orientation === 'horizontal') {
    // Horizontal bars need more height for more data points
    const recommendedHeight = Math.max(300, dataPointCount * 30 + 100)
    const recommendedWidth = containerWidth || 800
    
    return {
      width: recommendedWidth,
      height: Math.min(recommendedHeight, 800) // Cap at 800px
    }
  } else {
    // Vertical columns need more width for more data points  
    const recommendedWidth = Math.max(400, dataPointCount * 50 + 100)
    const recommendedHeight = containerHeight || 400
    
    return {
      width: Math.min(recommendedWidth, 1200), // Cap at 1200px
      height: recommendedHeight
    }
  }
}

// Estimate label rotation needs for vertical orientation
export const shouldRotateLabels = (
  data: ChartDataPoint[],
  availableWidth: number
): { shouldRotate: boolean; rotation: number } => {
  if (!data.length) return { shouldRotate: false, rotation: 0 }
  
  const averageLabelLength = data.reduce((sum, item) => {
    const label = item.label || String(item.x)
    return sum + label.length
  }, 0) / data.length
  
  const estimatedLabelWidth = averageLabelLength * 8
  const availableWidthPerLabel = availableWidth / data.length
  
  if (estimatedLabelWidth <= availableWidthPerLabel) {
    return { shouldRotate: false, rotation: 0 }
  }
  
  // Try 45 degree rotation first
  const diagonalWidth = estimatedLabelWidth * Math.cos(Math.PI / 4)
  if (diagonalWidth <= availableWidthPerLabel) {
    return { shouldRotate: true, rotation: -45 }
  }
  
  // Use 90 degree rotation for very long labels
  return { shouldRotate: true, rotation: -90 }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getOptimalOrientation,
    shouldUseHorizontal,
    getRecommendedDimensions,
    shouldRotateLabels
  }
}