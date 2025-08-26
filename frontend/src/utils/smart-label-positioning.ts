import { PieSlice, PieLabelData } from '../types/pie-chart'
import { calculateLabelPosition, labelsCollide, shouldShowLabel } from './pie-chart-math'

/**
 * Smart label positioning algorithm to avoid overlaps
 */
export const positionLabelsSmartly = (
  slices: PieSlice[],
  config: {
    maxIterations?: number
    minimumGap?: number
    labelHeight?: number
    labelPadding?: number
    preferredDistance?: number
    allowExternalLines?: boolean
  } = {}
): PieLabelData[] => {
  const {
    maxIterations = 50,
    minimumGap = 4,
    labelHeight = 14,
    labelPadding = 2,
    preferredDistance = 20,
    allowExternalLines = true
  } = config

  // Filter slices that should show labels
  const visibleSlices = slices.filter(slice => shouldShowLabel(slice))
  
  if (visibleSlices.length === 0) return []

  // Initial label positioning
  let labels: PieLabelData[] = visibleSlices.map(slice => {
    const position = calculateLabelPosition(slice, preferredDistance)
    return {
      text: slice.data.label,
      x: position.x,
      y: position.y,
      angle: (slice.startAngle + slice.endAngle) / 2,
      slice,
      anchor: position.anchor,
      isVisible: true
    }
  })

  // Collision detection and resolution
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasCollisions = false

    for (let i = 0; i < labels.length - 1; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const label1 = labels[i]
        const label2 = labels[j]

        const collision = labelsCollide(
          {
            x: label1.x,
            y: label1.y,
            width: label1.text.length * 8, // Estimate width
            height: labelHeight
          },
          {
            x: label2.x,
            y: label2.y,
            width: label2.text.length * 8,
            height: labelHeight
          },
          minimumGap
        )

        if (collision) {
          hasCollisions = true
          
          // Resolve collision by adjusting positions
          const angle1 = label1.angle
          const angle2 = label2.angle
          
          // Move labels away from each other
          const adjustment = minimumGap + labelHeight / 2
          
          if (Math.abs(angle1 - angle2) < Math.PI) {
            // Labels on same side, adjust radially
            const avgAngle = (angle1 + angle2) / 2
            if (angle1 < avgAngle) {
              label1.y -= adjustment
            } else {
              label1.y += adjustment
            }
            if (angle2 < avgAngle) {
              label2.y -= adjustment
            } else {
              label2.y += adjustment
            }
          } else {
            // Labels on opposite sides, adjust vertically
            if (label1.y < label2.y) {
              label1.y -= adjustment / 2
              label2.y += adjustment / 2
            } else {
              label1.y += adjustment / 2
              label2.y -= adjustment / 2
            }
          }
        }
      }
    }

    if (!hasCollisions) break
  }

  return labels
}

/**
 * Create label positioning strategy based on chart type
 */
export const createLabelStrategy = (
  chartType: 'pie' | 'donut' | 'semi-circle',
  sliceCount: number
) => {
  switch (chartType) {
    case 'pie':
      return {
        strategy: sliceCount > 8 ? 'external' : 'internal',
        showLeaderLines: sliceCount > 12,
        hideSmallLabels: sliceCount > 15,
        minSlicePercentage: sliceCount > 10 ? 3 : 1
      }
    
    case 'donut':
      return {
        strategy: 'external',
        showLeaderLines: sliceCount > 8,
        hideSmallLabels: sliceCount > 12,
        minSlicePercentage: sliceCount > 8 ? 4 : 2
      }
    
    case 'semi-circle':
      return {
        strategy: 'external',
        showLeaderLines: sliceCount > 6,
        hideSmallLabels: sliceCount > 10,
        minSlicePercentage: sliceCount > 6 ? 5 : 2
      }
    
    default:
      return {
        strategy: 'external',
        showLeaderLines: true,
        hideSmallLabels: false,
        minSlicePercentage: 1
      }
  }
}

/**
 * Generate leader lines for external labels
 */
export const generateLeaderLines = (
  labels: PieLabelData[],
  config: {
    lineColor?: string
    lineWidth?: number
    bendRadius?: number
    minLineLength?: number
  } = {}
) => {
  const {
    lineColor = '#999',
    lineWidth = 1,
    bendRadius = 3,
    minLineLength = 10
  } = config

  return labels.map(label => {
    const slice = label.slice
    const centroid = slice.centroid
    const labelPoint = { x: label.x, y: label.y }
    
    // Calculate intermediate point for bent line
    const angle = label.angle
    const intermediateDistance = slice.outerRadius + minLineLength
    const intermediateX = Math.cos(angle) * intermediateDistance
    const intermediateY = Math.sin(angle) * intermediateDistance

    return {
      label,
      path: `M${centroid[0]},${centroid[1]} L${intermediateX},${intermediateY} L${labelPoint.x},${labelPoint.y}`,
      color: lineColor,
      width: lineWidth
    }
  })
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    positionLabelsSmartly,
    createLabelStrategy,
    generateLeaderLines
  }
}