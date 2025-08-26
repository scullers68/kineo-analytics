import * as d3 from 'd3'
import { PieSlice } from '../types/pie-chart'

/**
 * Highlight a slice with visual effects
 */
export const highlightSlice = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    highlightColor?: string
    highlightOpacity?: number
    shadowBlur?: number
    shadowColor?: string
    strokeWidth?: number
    strokeColor?: string
    scaleAmount?: number
    duration?: number
    easing?: string
  } = {}
) => {
  const {
    highlightColor,
    highlightOpacity = 1.0,
    shadowBlur = 8,
    shadowColor = 'rgba(0, 0, 0, 0.3)',
    strokeWidth = 2,
    strokeColor = '#ffffff',
    scaleAmount = 1.05,
    duration = 200,
    easing = 'ease-out'
  } = config

  const selection = d3.select(element)
  const pathElement = selection.select('path')

  // Store original styles
  const originalFill = pathElement.attr('fill') || slice.color
  const originalStrokeWidth = pathElement.attr('stroke-width') || '1'
  const originalStroke = pathElement.attr('stroke') || strokeColor

  element.setAttribute('data-original-fill', originalFill)
  element.setAttribute('data-original-stroke-width', originalStrokeWidth)
  element.setAttribute('data-original-stroke', originalStroke)

  // Apply highlight effects
  pathElement
    .transition()
    .duration(duration)
    .ease(d3.easeQuadOut)
    .attr('fill', highlightColor || originalFill)
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)
    .style('opacity', highlightOpacity)
    .style('filter', `drop-shadow(0 0 ${shadowBlur}px ${shadowColor})`)

  // Apply scale effect
  if (scaleAmount !== 1) {
    selection
      .transition()
      .duration(duration)
      .ease(d3.easeQuadOut)
      .attr('transform', (d: any) => {
        const centroid = slice.centroid
        return `translate(${centroid[0] * (scaleAmount - 1)}, ${centroid[1] * (scaleAmount - 1)}) scale(${scaleAmount})`
      })
  }

  return {
    element: selection.node(),
    originalStyles: { fill: originalFill, strokeWidth: originalStrokeWidth, stroke: originalStroke },
    isHighlighted: true
  }
}

/**
 * Remove highlight effects from a slice
 */
export const unhighlightSlice = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    duration?: number
    easing?: string
    restoreOriginal?: boolean
  } = {}
) => {
  const {
    duration = 200,
    easing = 'ease-in',
    restoreOriginal = true
  } = config

  const selection = d3.select(element)
  const pathElement = selection.select('path')

  // Get original styles
  const originalFill = element.getAttribute('data-original-fill') || slice.color
  const originalStrokeWidth = element.getAttribute('data-original-stroke-width') || '1'
  const originalStroke = element.getAttribute('data-original-stroke') || '#ffffff'

  // Restore original styles
  if (restoreOriginal) {
    pathElement
      .transition()
      .duration(duration)
      .ease(d3.easeQuadIn)
      .attr('fill', originalFill)
      .attr('stroke', originalStroke)
      .attr('stroke-width', originalStrokeWidth)
      .style('opacity', null)
      .style('filter', null)

    // Reset scale
    selection
      .transition()
      .duration(duration)
      .ease(d3.easeQuadIn)
      .attr('transform', 'translate(0,0) scale(1)')
  }

  // Clean up stored attributes
  element.removeAttribute('data-original-fill')
  element.removeAttribute('data-original-stroke-width')
  element.removeAttribute('data-original-stroke')

  return {
    element: selection.node(),
    isHighlighted: false
  }
}

/**
 * Apply highlight style with customizable effects
 */
export const applyHighlightStyle = (
  slice: PieSlice,
  element: SVGElement,
  styleConfig: {
    type?: 'glow' | 'outline' | 'brightness' | 'scale' | 'pulse' | 'gradient'
    intensity?: number
    color?: string
    duration?: number
    persistent?: boolean
  } = {}
) => {
  const {
    type = 'glow',
    intensity = 1.0,
    color = '#007bff',
    duration = 300,
    persistent = false
  } = styleConfig

  const selection = d3.select(element)
  const pathElement = selection.select('path')

  switch (type) {
    case 'glow':
      pathElement
        .transition()
        .duration(duration)
        .style('filter', `drop-shadow(0 0 ${8 * intensity}px ${color})`)
        .style('opacity', 0.9 + (0.1 * intensity))
      break

    case 'outline':
      pathElement
        .transition()
        .duration(duration)
        .attr('stroke', color)
        .attr('stroke-width', 2 * intensity)
        .style('stroke-opacity', intensity)
      break

    case 'brightness':
      pathElement
        .transition()
        .duration(duration)
        .style('filter', `brightness(${1 + (0.3 * intensity)})`)
      break

    case 'scale':
      selection
        .transition()
        .duration(duration)
        .attr('transform', () => {
          const scale = 1 + (0.1 * intensity)
          const centroid = slice.centroid
          return `translate(${centroid[0] * (scale - 1)}, ${centroid[1] * (scale - 1)}) scale(${scale})`
        })
      break

    case 'pulse':
      const pulseElement = pathElement.node()
      if (pulseElement) {
        const pulse = () => {
          pathElement
            .transition()
            .duration(duration / 2)
            .style('opacity', 0.6)
            .transition()
            .duration(duration / 2)
            .style('opacity', 1)
            .on('end', () => {
              if (persistent) {
                setTimeout(pulse, duration)
              }
            })
        }
        pulse()
      }
      break

    case 'gradient':
      // Create gradient definition
      const svgElement = element.closest('svg')
      if (svgElement) {
        const defs = d3.select(svgElement).select('defs').empty() 
          ? d3.select(svgElement).append('defs')
          : d3.select(svgElement).select('defs')
        
        const gradientId = `highlight-gradient-${slice.index}`
        
        const gradient = defs.append('radialGradient')
          .attr('id', gradientId)
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '50%')

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', intensity)

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', slice.color)
          .attr('stop-opacity', 0.8)

        pathElement
          .transition()
          .duration(duration)
          .attr('fill', `url(#${gradientId})`)
      }
      break
  }

  return {
    element: selection.node(),
    type,
    intensity,
    color,
    duration
  }
}

/**
 * Create highlight manager for managing multiple highlighted slices
 */
export const createHighlightManager = (
  config: {
    maxHighlighted?: number
    autoUnhighlight?: boolean
    unhighlightDelay?: number
    exclusiveMode?: boolean
  } = {}
) => {
  const {
    maxHighlighted = 3,
    autoUnhighlight = true,
    unhighlightDelay = 3000,
    exclusiveMode = false
  } = config

  const highlightedSlices = new Map<number, {
    slice: PieSlice
    element: SVGElement
    timer?: NodeJS.Timeout
  }>()

  return {
    highlight: (slice: PieSlice, element: SVGElement, styleConfig = {}) => {
      // In exclusive mode, unhighlight all others first
      if (exclusiveMode) {
        this.unhighlightAll()
      }

      // Check max highlighted limit
      if (highlightedSlices.size >= maxHighlighted && !highlightedSlices.has(slice.index)) {
        // Remove oldest highlighted slice
        const firstEntry = highlightedSlices.entries().next().value
        if (firstEntry) {
          this.unhighlight(firstEntry[0])
        }
      }

      // Clear existing timer for this slice
      const existing = highlightedSlices.get(slice.index)
      if (existing?.timer) {
        clearTimeout(existing.timer)
      }

      // Apply highlight
      const result = applyHighlightStyle(slice, element, styleConfig)

      // Set up auto-unhighlight timer
      let timer: NodeJS.Timeout | undefined
      if (autoUnhighlight) {
        timer = setTimeout(() => {
          this.unhighlight(slice.index)
        }, unhighlightDelay)
      }

      // Store highlighted slice
      highlightedSlices.set(slice.index, {
        slice,
        element,
        timer
      })

      return result
    },

    unhighlight: (sliceIndex: number) => {
      const highlighted = highlightedSlices.get(sliceIndex)
      if (!highlighted) return false

      // Clear timer
      if (highlighted.timer) {
        clearTimeout(highlighted.timer)
      }

      // Remove highlight
      const result = unhighlightSlice(highlighted.slice, highlighted.element)

      // Remove from map
      highlightedSlices.delete(sliceIndex)

      return result
    },

    unhighlightAll: () => {
      const results = []
      for (const [sliceIndex] of highlightedSlices) {
        const result = this.unhighlight(sliceIndex)
        if (result) results.push(result)
      }
      return results
    },

    isHighlighted: (sliceIndex: number) => {
      return highlightedSlices.has(sliceIndex)
    },

    getHighlighted: () => {
      return Array.from(highlightedSlices.keys())
    },

    getHighlightedCount: () => {
      return highlightedSlices.size
    },

    toggle: (slice: PieSlice, element: SVGElement, styleConfig = {}) => {
      if (this.isHighlighted(slice.index)) {
        return this.unhighlight(slice.index)
      } else {
        return this.highlight(slice, element, styleConfig)
      }
    },

    refreshTimer: (sliceIndex: number) => {
      const highlighted = highlightedSlices.get(sliceIndex)
      if (!highlighted || !autoUnhighlight) return false

      // Clear existing timer
      if (highlighted.timer) {
        clearTimeout(highlighted.timer)
      }

      // Set new timer
      highlighted.timer = setTimeout(() => {
        this.unhighlight(sliceIndex)
      }, unhighlightDelay)

      return true
    },

    destroy: () => {
      // Clear all timers and highlights
      for (const [sliceIndex, highlighted] of highlightedSlices) {
        if (highlighted.timer) {
          clearTimeout(highlighted.timer)
        }
        unhighlightSlice(highlighted.slice, highlighted.element, { duration: 0 })
      }
      highlightedSlices.clear()
    }
  }
}

/**
 * Create animated highlight sequence
 */
export const createHighlightSequence = (
  slices: PieSlice[],
  elements: SVGElement[],
  config: {
    sequenceDelay?: number
    highlightDuration?: number
    staggered?: boolean
    direction?: 'clockwise' | 'counterclockwise' | 'random'
    onComplete?: () => void
  } = {}
) => {
  const {
    sequenceDelay = 200,
    highlightDuration = 500,
    staggered = true,
    direction = 'clockwise',
    onComplete
  } = config

  // Determine sequence order
  let orderedIndices: number[]
  
  switch (direction) {
    case 'clockwise':
      orderedIndices = slices
        .map((slice, index) => ({ slice, index }))
        .sort((a, b) => a.slice.startAngle - b.slice.startAngle)
        .map(item => item.index)
      break
    
    case 'counterclockwise':
      orderedIndices = slices
        .map((slice, index) => ({ slice, index }))
        .sort((a, b) => b.slice.startAngle - a.slice.startAngle)
        .map(item => item.index)
      break
    
    case 'random':
      orderedIndices = slices.map((_, index) => index)
      // Fisher-Yates shuffle
      for (let i = orderedIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[orderedIndices[i], orderedIndices[j]] = [orderedIndices[j], orderedIndices[i]]
      }
      break
    
    default:
      orderedIndices = slices.map((_, index) => index)
  }

  let completedCount = 0
  const totalDuration = staggered 
    ? (orderedIndices.length - 1) * sequenceDelay + highlightDuration
    : highlightDuration

  orderedIndices.forEach((originalIndex, sequenceIndex) => {
    const slice = slices[originalIndex]
    const element = elements[originalIndex]
    const delay = staggered ? sequenceIndex * sequenceDelay : 0

    setTimeout(() => {
      highlightSlice(slice, element, {
        duration: highlightDuration,
        scaleAmount: 1.1,
        shadowBlur: 12
      })

      setTimeout(() => {
        unhighlightSlice(slice, element, { duration: highlightDuration / 2 })
        completedCount++

        if (completedCount === orderedIndices.length) {
          onComplete?.()
        }
      }, highlightDuration)

    }, delay)
  })

  return {
    totalDuration,
    sequenceLength: orderedIndices.length,
    direction
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    highlightSlice,
    unhighlightSlice,
    applyHighlightStyle,
    createHighlightManager,
    createHighlightSequence
  }
}