import { PieDataPoint } from '../types/pie-chart'
import { groupSmallSlices } from './pie-chart-math'

/**
 * Handle small slices with various strategies
 */
export const handleSmallSlices = (
  data: PieDataPoint[],
  config: {
    strategy?: 'group' | 'hide' | 'callout' | 'expand'
    threshold?: number
    othersLabel?: string
    maxSmallSlices?: number
    preserveSmallSlices?: string[]
  } = {}
) => {
  const {
    strategy = 'group',
    threshold = 3,
    othersLabel = 'Others',
    maxSmallSlices = 5,
    preserveSmallSlices = []
  } = config

  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0)
  const thresholdValue = (threshold / 100) * total

  switch (strategy) {
    case 'group':
      return groupSmallSlices(data, threshold, othersLabel)

    case 'hide':
      return data.filter(d => 
        Math.abs(d.value) >= thresholdValue || 
        preserveSmallSlices.includes(d.label)
      )

    case 'callout':
      return data.map(d => ({
        ...d,
        isSmall: Math.abs(d.value) < thresholdValue && !preserveSmallSlices.includes(d.label),
        needsCallout: Math.abs(d.value) < thresholdValue && !preserveSmallSlices.includes(d.label)
      }))

    case 'expand':
      // Artificially expand small slices to minimum visual size
      const minVisualValue = thresholdValue * 0.5
      return data.map(d => {
        if (Math.abs(d.value) < minVisualValue && !preserveSmallSlices.includes(d.label)) {
          return {
            ...d,
            value: d.value < 0 ? -minVisualValue : minVisualValue,
            originalValue: d.value,
            isExpanded: true
          }
        }
        return d
      })

    default:
      return data
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleSmallSlices }
}