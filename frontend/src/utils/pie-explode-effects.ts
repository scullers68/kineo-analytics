import * as d3 from 'd3'
import { PieSlice } from '../types/pie-chart'

/**
 * Explode a slice outward from the center
 */
export const explodeSlice = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    distance?: number
    duration?: number
    easing?: string
    onComplete?: () => void
  } = {}
) => {
  const {
    distance = 12,
    duration = 300,
    easing = 'ease-out',
    onComplete
  } = config

  const angle = (slice.startAngle + slice.endAngle) / 2
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance

  const selection = d3.select(element)
  
  selection
    .transition()
    .duration(duration)
    .ease(d3.easeBackOut.overshoot(1.4))
    .attr('transform', `translate(${dx},${dy})`)
    .on('end', () => {
      onComplete?.()
    })

  return {
    element: selection.node(),
    transform: `translate(${dx},${dy})`,
    distance,
    angle
  }
}

/**
 * Implode a slice back to center position
 */
export const implodeSlice = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    duration?: number
    easing?: string
    onComplete?: () => void
  } = {}
) => {
  const {
    duration = 200,
    easing = 'ease-in',
    onComplete
  } = config

  const selection = d3.select(element)
  
  selection
    .transition()
    .duration(duration)
    .ease(d3.easeQuadIn)
    .attr('transform', 'translate(0,0)')
    .on('end', () => {
      onComplete?.()
    })

  return {
    element: selection.node(),
    transform: 'translate(0,0)'
  }
}

/**
 * Calculate optimal explode distance based on slice size
 */
export const calculateExplodeDistance = (
  slice: PieSlice,
  config: {
    baseDistance?: number
    sizeMultiplier?: number
    minDistance?: number
    maxDistance?: number
  } = {}
) => {
  const {
    baseDistance = 10,
    sizeMultiplier = 0.1,
    minDistance = 5,
    maxDistance = 20
  } = config

  // Calculate slice angle in degrees
  const sliceAngle = (slice.endAngle - slice.startAngle) * (180 / Math.PI)
  
  // Base distance modified by slice size
  const sizeAdjustment = sliceAngle * sizeMultiplier
  let distance = baseDistance + sizeAdjustment

  // Apply constraints
  distance = Math.max(minDistance, Math.min(maxDistance, distance))

  return {
    distance,
    sliceAngle,
    baseDistance,
    sizeAdjustment
  }
}

/**
 * Create a staggered explode effect for multiple slices
 */
export const createStaggeredExplode = (
  slices: PieSlice[],
  elements: SVGElement[],
  config: {
    baseDistance?: number
    staggerDelay?: number
    duration?: number
    direction?: 'clockwise' | 'counterclockwise' | 'random'
  } = {}
) => {
  const {
    baseDistance = 12,
    staggerDelay = 50,
    duration = 300,
    direction = 'clockwise'
  } = config

  // Determine explode order
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

  const results = orderedIndices.map((originalIndex, orderIndex) => {
    const slice = slices[originalIndex]
    const element = elements[originalIndex]
    const delay = orderIndex * staggerDelay

    setTimeout(() => {
      explodeSlice(slice, element, {
        distance: baseDistance,
        duration,
        onComplete: () => {
          console.log(`Slice ${originalIndex} exploded`)
        }
      })
    }, delay)

    return {
      sliceIndex: originalIndex,
      orderIndex,
      delay,
      element
    }
  })

  return {
    results,
    totalDuration: duration + (orderedIndices.length - 1) * staggerDelay,
    direction
  }
}

/**
 * Create a pulsing explode effect
 */
export const createPulseExplode = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    pulseCount?: number
    pulseDistance?: number
    pulseDuration?: number
    finalDistance?: number
  } = {}
) => {
  const {
    pulseCount = 3,
    pulseDistance = 6,
    pulseDuration = 150,
    finalDistance = 12
  } = config

  const selection = d3.select(element)
  const angle = (slice.startAngle + slice.endAngle) / 2

  let currentPulse = 0

  const doPulse = () => {
    if (currentPulse < pulseCount) {
      // Pulse out
      const dx = Math.cos(angle) * pulseDistance
      const dy = Math.sin(angle) * pulseDistance
      
      selection
        .transition()
        .duration(pulseDuration / 2)
        .ease(d3.easeQuadOut)
        .attr('transform', `translate(${dx},${dy})`)
        .transition()
        .duration(pulseDuration / 2)
        .ease(d3.easeQuadIn)
        .attr('transform', 'translate(0,0)')
        .on('end', () => {
          currentPulse++
          doPulse()
        })
    } else {
      // Final explode
      const finalDx = Math.cos(angle) * finalDistance
      const finalDy = Math.sin(angle) * finalDistance
      
      selection
        .transition()
        .duration(pulseDuration * 2)
        .ease(d3.easeBackOut.overshoot(1.2))
        .attr('transform', `translate(${finalDx},${finalDy})`)
    }
  }

  doPulse()

  return {
    element: selection.node(),
    totalDuration: pulseCount * pulseDuration + pulseDuration * 2
  }
}

/**
 * Create a spring-based explode effect
 */
export const createSpringExplode = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    distance?: number
    springTension?: number
    springFriction?: number
    overshoot?: number
  } = {}
) => {
  const {
    distance = 15,
    springTension = 200,
    springFriction = 15,
    overshoot = 1.5
  } = config

  const selection = d3.select(element)
  const angle = (slice.startAngle + slice.endAngle) / 2
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance

  // Simulate spring physics with multiple steps
  const steps = 20
  const stepDuration = 300 / steps

  selection
    .transition()
    .duration(150)
    .ease(d3.easeQuadOut)
    .attr('transform', `translate(${dx * overshoot},${dy * overshoot})`)
    .transition()
    .duration(100)
    .ease(d3.easeBackIn)
    .attr('transform', `translate(${dx * 0.8},${dy * 0.8})`)
    .transition()
    .duration(50)
    .ease(d3.easeQuadOut)
    .attr('transform', `translate(${dx},${dy})`)

  return {
    element: selection.node(),
    totalDuration: 300,
    springConfig: { tension: springTension, friction: springFriction }
  }
}

/**
 * Create an explode effect with rotation
 */
export const createRotatingExplode = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    distance?: number
    rotationAngle?: number
    duration?: number
  } = {}
) => {
  const {
    distance = 12,
    rotationAngle = 180,
    duration = 400
  } = config

  const selection = d3.select(element)
  const angle = (slice.startAngle + slice.endAngle) / 2
  const dx = Math.cos(angle) * distance
  const dy = Math.sin(angle) * distance

  selection
    .transition()
    .duration(duration)
    .ease(d3.easeBackOut)
    .attr('transform', `translate(${dx},${dy}) rotate(${rotationAngle})`)

  return {
    element: selection.node(),
    transform: `translate(${dx},${dy}) rotate(${rotationAngle})`,
    duration
  }
}

/**
 * Create an explode manager for handling multiple slices
 */
export const createExplodeManager = () => {
  const explodedSlices = new Map<number, {
    element: SVGElement
    originalTransform: string
    isExploded: boolean
  }>()

  return {
    explode: (slice: PieSlice, element: SVGElement, config = {}) => {
      // Store original state
      const originalTransform = element.getAttribute('transform') || 'translate(0,0)'
      explodedSlices.set(slice.index, {
        element,
        originalTransform,
        isExploded: true
      })

      return explodeSlice(slice, element, config)
    },

    implode: (slice: PieSlice, config = {}) => {
      const sliceState = explodedSlices.get(slice.index)
      if (!sliceState) return null

      const result = implodeSlice(slice, sliceState.element, config)
      sliceState.isExploded = false
      
      return result
    },

    toggle: (slice: PieSlice, element: SVGElement, config = {}) => {
      const sliceState = explodedSlices.get(slice.index)
      
      if (sliceState && sliceState.isExploded) {
        return this.implode(slice, config)
      } else {
        return this.explode(slice, element, config)
      }
    },

    implodeAll: (config = {}) => {
      const results = []
      
      for (const [sliceIndex, sliceState] of explodedSlices) {
        if (sliceState.isExploded) {
          // Create a mock slice for imploding
          const mockSlice = { index: sliceIndex } as PieSlice
          const result = this.implode(mockSlice, config)
          if (result) results.push(result)
        }
      }

      return results
    },

    getExploded: () => {
      return Array.from(explodedSlices.entries())
        .filter(([_, state]) => state.isExploded)
        .map(([index]) => index)
    },

    isExploded: (sliceIndex: number) => {
      const state = explodedSlices.get(sliceIndex)
      return state ? state.isExploded : false
    },

    clear: () => {
      explodedSlices.clear()
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    explodeSlice,
    implodeSlice,
    calculateExplodeDistance,
    createStaggeredExplode,
    createPulseExplode,
    createSpringExplode,
    createRotatingExplode,
    createExplodeManager
  }
}