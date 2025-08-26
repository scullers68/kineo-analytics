import * as d3 from 'd3'
import { PieSlice } from '../types/pie-chart'

/**
 * Handle slice hover interactions
 */
export const handleSliceHover = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    highlightColor?: string
    originalColor?: string
    explodeDistance?: number
    enableExplode?: boolean
    duration?: number
  } = {}
) => {
  const {
    highlightColor = '#007bff',
    explodeDistance = 8,
    enableExplode = true,
    duration = 200
  } = config

  const selection = d3.select(element)
  
  // Apply highlight color
  selection
    .select('path')
    .transition()
    .duration(duration)
    .attr('fill', highlightColor)
    .style('filter', 'brightness(1.1)')
    .style('cursor', 'pointer')

  // Apply explode effect
  if (enableExplode) {
    const angle = (slice.startAngle + slice.endAngle) / 2
    const dx = Math.cos(angle) * explodeDistance
    const dy = Math.sin(angle) * explodeDistance
    
    selection
      .transition()
      .duration(duration)
      .attr('transform', `translate(${dx},${dy})`)
  }

  return { element: selection.node(), isHovered: true }
}

/**
 * Reset slice hover state
 */
export const resetSliceHover = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    originalColor?: string
    duration?: number
  } = {}
) => {
  const { originalColor = slice.color, duration = 200 } = config

  const selection = d3.select(element)
  
  // Reset color and effects
  selection
    .select('path')
    .transition()
    .duration(duration)
    .attr('fill', originalColor)
    .style('filter', null)

  // Reset position
  selection
    .transition()
    .duration(duration)
    .attr('transform', 'translate(0,0)')

  return { element: selection.node(), isHovered: false }
}

/**
 * Create hover effect with customizable animations
 */
export const createHoverEffect = (
  config: {
    type?: 'highlight' | 'explode' | 'both'
    highlightColor?: string
    explodeDistance?: number
    duration?: number
    easing?: string
  } = {}
) => {
  const {
    type = 'both',
    highlightColor = '#007bff',
    explodeDistance = 8,
    duration = 200,
    easing = 'ease-in-out'
  } = config

  return {
    onHover: (slice: PieSlice, element: SVGElement) => {
      const selection = d3.select(element)
      
      if (type === 'highlight' || type === 'both') {
        selection
          .select('path')
          .transition()
          .duration(duration)
          .ease(d3.easeQuadOut)
          .attr('fill', highlightColor)
          .style('filter', 'brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
      }

      if (type === 'explode' || type === 'both') {
        const angle = (slice.startAngle + slice.endAngle) / 2
        const dx = Math.cos(angle) * explodeDistance
        const dy = Math.sin(angle) * explodeDistance
        
        selection
          .transition()
          .duration(duration)
          .ease(d3.easeBackOut.overshoot(1.2))
          .attr('transform', `translate(${dx},${dy})`)
      }

      return selection.node()
    },

    onLeave: (slice: PieSlice, element: SVGElement) => {
      const selection = d3.select(element)
      
      selection
        .select('path')
        .transition()
        .duration(duration)
        .ease(d3.easeQuadIn)
        .attr('fill', slice.color)
        .style('filter', null)

      selection
        .transition()
        .duration(duration)
        .ease(d3.easeQuadIn)
        .attr('transform', 'translate(0,0)')

      return selection.node()
    }
  }
}

/**
 * Advanced hover handler with ripple effect
 */
export const createRippleHoverEffect = (
  config: {
    rippleColor?: string
    rippleDuration?: number
    rippleRadius?: number
  } = {}
) => {
  const {
    rippleColor = 'rgba(0, 123, 255, 0.3)',
    rippleDuration = 600,
    rippleRadius = 30
  } = config

  return {
    onHover: (slice: PieSlice, element: SVGElement, svgElement: SVGSVGElement) => {
      const svg = d3.select(svgElement)
      const [centerX, centerY] = slice.centroid
      
      // Create ripple effect
      const ripple = svg
        .select('g')
        .append('circle')
        .attr('class', 'hover-ripple')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .attr('fill', rippleColor)
        .style('pointer-events', 'none')

      ripple
        .transition()
        .duration(rippleDuration)
        .ease(d3.easeCircleOut)
        .attr('r', rippleRadius)
        .style('opacity', 0)
        .remove()

      // Apply standard hover effect
      const selection = d3.select(element)
      selection
        .select('path')
        .transition()
        .duration(200)
        .style('filter', 'brightness(1.15)')

      return selection.node()
    },

    onLeave: (slice: PieSlice, element: SVGElement) => {
      const selection = d3.select(element)
      selection
        .select('path')
        .transition()
        .duration(200)
        .style('filter', null)

      return selection.node()
    }
  }
}

/**
 * Batch hover handler for multiple slices
 */
export const createBatchHoverHandler = () => {
  let currentHoveredElement: SVGElement | null = null
  let currentHoveredSlice: PieSlice | null = null

  return {
    handleHover: (slice: PieSlice, element: SVGElement, config = {}) => {
      // Reset previous hover if different element
      if (currentHoveredElement && currentHoveredElement !== element) {
        if (currentHoveredSlice) {
          resetSliceHover(currentHoveredSlice, currentHoveredElement, config)
        }
      }

      // Apply new hover
      handleSliceHover(slice, element, config)
      currentHoveredElement = element
      currentHoveredSlice = slice

      return { current: element, previous: currentHoveredElement }
    },

    resetAll: (config = {}) => {
      if (currentHoveredElement && currentHoveredSlice) {
        resetSliceHover(currentHoveredSlice, currentHoveredElement, config)
        currentHoveredElement = null
        currentHoveredSlice = null
      }
    },

    getCurrentHovered: () => ({
      element: currentHoveredElement,
      slice: currentHoveredSlice
    })
  }
}

/**
 * Hover effect with label enhancement
 */
export const createLabelEnhancedHover = (
  config: {
    showValue?: boolean
    showPercentage?: boolean
    labelColor?: string
    backgroundColor?: string
  } = {}
) => {
  const {
    showValue = true,
    showPercentage = true,
    labelColor = '#333',
    backgroundColor = 'rgba(255, 255, 255, 0.9)'
  } = config

  return {
    onHover: (slice: PieSlice, element: SVGElement, svgElement: SVGSVGElement) => {
      const svg = d3.select(svgElement)
      const [labelX, labelY] = slice.centroid

      // Create enhanced label
      const labelGroup = svg
        .select('g')
        .append('g')
        .attr('class', 'enhanced-label')
        .attr('transform', `translate(${labelX}, ${labelY})`)

      // Background
      labelGroup
        .append('rect')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', backgroundColor)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)

      // Text elements
      let yOffset = -10
      
      // Label text
      labelGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('y', yOffset)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', labelColor)
        .text(slice.data.label)

      yOffset += 15

      // Value text
      if (showValue) {
        labelGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', yOffset)
          .style('font-size', '11px')
          .style('fill', labelColor)
          .text(`Value: ${slice.data.value}`)
        
        yOffset += 15
      }

      // Percentage text
      if (showPercentage && slice.data.percentage) {
        labelGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', yOffset)
          .style('font-size', '11px')
          .style('fill', labelColor)
          .text(`${slice.data.percentage.toFixed(1)}%`)
      }

      // Adjust background size
      const bbox = (labelGroup.node() as SVGGElement).getBBox()
      labelGroup
        .select('rect')
        .attr('x', bbox.x - 4)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 8)
        .attr('height', bbox.height + 4)

      // Animate in
      labelGroup
        .style('opacity', 0)
        .transition()
        .duration(200)
        .style('opacity', 1)

      return labelGroup.node()
    },

    onLeave: (slice: PieSlice, element: SVGElement, svgElement: SVGSVGElement) => {
      const svg = d3.select(svgElement)
      svg
        .selectAll('.enhanced-label')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove()
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleSliceHover,
    resetSliceHover,
    createHoverEffect,
    createRippleHoverEffect,
    createBatchHoverHandler,
    createLabelEnhancedHover
  }
}