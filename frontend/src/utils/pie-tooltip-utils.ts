import { PieSlice, PieTooltipData } from '../types/pie-chart'

/**
 * Format pie chart tooltip content
 */
export const formatPieTooltip = (
  slice: PieSlice,
  config: {
    showLabel?: boolean
    showValue?: boolean
    showPercentage?: boolean
    showCategory?: boolean
    valueFormatter?: (value: number) => string
    percentageFormatter?: (percentage: number) => string
    template?: string
  } = {}
) => {
  const {
    showLabel = true,
    showValue = true,
    showPercentage = true,
    showCategory = false,
    valueFormatter = (v) => v.toString(),
    percentageFormatter = (p) => `${p.toFixed(1)}%`,
    template
  } = config

  // Use custom template if provided
  if (template) {
    return template
      .replace('{label}', slice.data.label)
      .replace('{value}', valueFormatter(slice.data.value))
      .replace('{percentage}', percentageFormatter(slice.data.percentage || 0))
      .replace('{category}', slice.data.category || '')
  }

  // Build default tooltip content
  const parts: string[] = []

  if (showLabel) {
    parts.push(`<strong>${slice.data.label}</strong>`)
  }

  if (showValue) {
    parts.push(`Value: ${valueFormatter(slice.data.value)}`)
  }

  if (showPercentage && slice.data.percentage !== undefined) {
    parts.push(`Percentage: ${percentageFormatter(slice.data.percentage)}`)
  }

  if (showCategory && slice.data.category) {
    parts.push(`Category: ${slice.data.category}`)
  }

  return parts.join('<br>')
}

/**
 * Position tooltip relative to slice and viewport
 */
export const positionPieTooltip = (
  slice: PieSlice,
  mouseEvent: MouseEvent,
  tooltipElement: HTMLElement,
  config: {
    offset?: { x: number; y: number }
    preferredSide?: 'top' | 'right' | 'bottom' | 'left' | 'auto'
    boundaryPadding?: number
    centerX?: number
    centerY?: number
  } = {}
) => {
  const {
    offset = { x: 10, y: -10 },
    preferredSide = 'auto',
    boundaryPadding = 10,
    centerX = 0,
    centerY = 0
  } = config

  // Get viewport dimensions
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Get tooltip dimensions
  const tooltipRect = tooltipElement.getBoundingClientRect()
  const tooltipWidth = tooltipRect.width
  const tooltipHeight = tooltipRect.height

  // Get mouse position
  let x = mouseEvent.clientX + offset.x
  let y = mouseEvent.clientY + offset.y

  // Auto-positioning logic
  if (preferredSide === 'auto') {
    // Determine best position based on slice location and viewport bounds
    const sliceAngle = (slice.startAngle + slice.endAngle) / 2
    const normalizedAngle = ((sliceAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
    
    // Quadrant-based positioning
    if (normalizedAngle < Math.PI / 2) {
      // Top-right quadrant
      x = mouseEvent.clientX + offset.x
      y = mouseEvent.clientY + offset.y
    } else if (normalizedAngle < Math.PI) {
      // Bottom-right quadrant
      x = mouseEvent.clientX + offset.x
      y = mouseEvent.clientY - tooltipHeight + offset.y
    } else if (normalizedAngle < 3 * Math.PI / 2) {
      // Bottom-left quadrant
      x = mouseEvent.clientX - tooltipWidth + offset.x
      y = mouseEvent.clientY - tooltipHeight + offset.y
    } else {
      // Top-left quadrant
      x = mouseEvent.clientX - tooltipWidth + offset.x
      y = mouseEvent.clientY + offset.y
    }
  } else {
    // Manual positioning
    switch (preferredSide) {
      case 'top':
        x = mouseEvent.clientX - tooltipWidth / 2
        y = mouseEvent.clientY - tooltipHeight - Math.abs(offset.y)
        break
      case 'right':
        x = mouseEvent.clientX + offset.x
        y = mouseEvent.clientY - tooltipHeight / 2
        break
      case 'bottom':
        x = mouseEvent.clientX - tooltipWidth / 2
        y = mouseEvent.clientY + offset.y
        break
      case 'left':
        x = mouseEvent.clientX - tooltipWidth - Math.abs(offset.x)
        y = mouseEvent.clientY - tooltipHeight / 2
        break
    }
  }

  // Boundary checking and adjustment
  if (x < boundaryPadding) {
    x = boundaryPadding
  } else if (x + tooltipWidth > viewportWidth - boundaryPadding) {
    x = viewportWidth - tooltipWidth - boundaryPadding
  }

  if (y < boundaryPadding) {
    y = boundaryPadding
  } else if (y + tooltipHeight > viewportHeight - boundaryPadding) {
    y = viewportHeight - tooltipHeight - boundaryPadding
  }

  return {
    x,
    y,
    adjustedX: x !== mouseEvent.clientX + offset.x,
    adjustedY: y !== mouseEvent.clientY + offset.y
  }
}

/**
 * Create tooltip data from slice information
 */
export const createTooltipData = (
  slice: PieSlice,
  mouseEvent: MouseEvent,
  additionalData?: Record<string, any>
): PieTooltipData => {
  return {
    label: slice.data.label,
    value: slice.data.value,
    percentage: slice.data.percentage || 0,
    color: slice.color,
    position: {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    },
    category: slice.data.category,
    additionalData: {
      ...slice.data.metadata,
      ...additionalData,
      sliceIndex: slice.index,
      startAngle: slice.startAngle,
      endAngle: slice.endAngle,
      centroid: slice.centroid
    }
  }
}

/**
 * Create advanced tooltip with rich content
 */
export const createRichTooltip = (
  slice: PieSlice,
  config: {
    includeChart?: boolean
    includeComparison?: boolean
    includeHistory?: boolean
    customFields?: Array<{
      label: string
      value: string | number
      formatter?: (value: any) => string
    }>
  } = {}
) => {
  const {
    includeChart = false,
    includeComparison = false,
    includeHistory = false,
    customFields = []
  } = config

  const content = {
    header: {
      title: slice.data.label,
      subtitle: slice.data.category || undefined,
      color: slice.color
    },
    metrics: [
      { label: 'Value', value: slice.data.value, type: 'number' },
      { label: 'Percentage', value: slice.data.percentage || 0, type: 'percentage' }
    ],
    customFields,
    features: {
      chart: includeChart,
      comparison: includeComparison,
      history: includeHistory
    }
  }

  return content
}

/**
 * Tooltip manager for handling multiple tooltips
 */
export const createTooltipManager = (
  config: {
    maxVisible?: number
    hideDelay?: number
    animationDuration?: number
  } = {}
) => {
  const {
    maxVisible = 1,
    hideDelay = 100,
    animationDuration = 200
  } = config

  const activeTooltips = new Map<string, {
    element: HTMLElement
    hideTimer?: NodeJS.Timeout
    slice: PieSlice
  }>()

  return {
    show: (
      slice: PieSlice,
      mouseEvent: MouseEvent,
      content: string,
      tooltipId?: string
    ) => {
      const id = tooltipId || `tooltip-${slice.index}`
      
      // Hide excess tooltips if necessary
      if (activeTooltips.size >= maxVisible) {
        const firstTooltip = activeTooltips.values().next().value
        if (firstTooltip) {
          this.hide(firstTooltip.slice.index.toString())
        }
      }

      // Create tooltip element (simplified - in real implementation would create DOM)
      const tooltipElement = document.createElement('div')
      tooltipElement.className = 'pie-tooltip'
      tooltipElement.innerHTML = content
      tooltipElement.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity ${animationDuration}ms ease-in-out;
      `

      document.body.appendChild(tooltipElement)

      // Position tooltip
      const position = positionPieTooltip(slice, mouseEvent, tooltipElement)
      tooltipElement.style.left = `${position.x}px`
      tooltipElement.style.top = `${position.y}px`

      // Animate in
      requestAnimationFrame(() => {
        tooltipElement.style.opacity = '1'
      })

      // Store tooltip
      activeTooltips.set(id, {
        element: tooltipElement,
        slice
      })

      return {
        id,
        element: tooltipElement,
        position
      }
    },

    hide: (tooltipId: string) => {
      const tooltip = activeTooltips.get(tooltipId)
      if (!tooltip) return false

      // Clear any existing hide timer
      if (tooltip.hideTimer) {
        clearTimeout(tooltip.hideTimer)
      }

      // Animate out and remove
      tooltip.element.style.opacity = '0'
      
      setTimeout(() => {
        if (tooltip.element.parentNode) {
          tooltip.element.parentNode.removeChild(tooltip.element)
        }
      }, animationDuration)

      activeTooltips.delete(tooltipId)
      return true
    },

    hideWithDelay: (tooltipId: string, delay?: number) => {
      const tooltip = activeTooltips.get(tooltipId)
      if (!tooltip) return false

      const hideTimer = setTimeout(() => {
        this.hide(tooltipId)
      }, delay || hideDelay)

      tooltip.hideTimer = hideTimer
      return true
    },

    update: (tooltipId: string, content: string) => {
      const tooltip = activeTooltips.get(tooltipId)
      if (!tooltip) return false

      tooltip.element.innerHTML = content
      return true
    },

    move: (tooltipId: string, mouseEvent: MouseEvent) => {
      const tooltip = activeTooltips.get(tooltipId)
      if (!tooltip) return false

      const position = positionPieTooltip(tooltip.slice, mouseEvent, tooltip.element)
      tooltip.element.style.left = `${position.x}px`
      tooltip.element.style.top = `${position.y}px`

      return { tooltipId, position }
    },

    hideAll: () => {
      const ids = Array.from(activeTooltips.keys())
      ids.forEach(id => this.hide(id))
      return ids
    },

    getActive: () => Array.from(activeTooltips.keys())
  }
}

/**
 * Create tooltip with fade transition
 */
export const createFadeTooltip = (
  slice: PieSlice,
  config: {
    fadeInDuration?: number
    fadeOutDuration?: number
    content?: string
  } = {}
) => {
  const {
    fadeInDuration = 150,
    fadeOutDuration = 100,
    content = formatPieTooltip(slice)
  } = config

  return {
    show: (mouseEvent: MouseEvent) => {
      const tooltipElement = document.createElement('div')
      tooltipElement.innerHTML = content
      tooltipElement.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transform: translateY(4px);
        transition: all ${fadeInDuration}ms ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `

      document.body.appendChild(tooltipElement)

      const position = positionPieTooltip(slice, mouseEvent, tooltipElement)
      tooltipElement.style.left = `${position.x}px`
      tooltipElement.style.top = `${position.y}px`

      // Trigger fade in
      requestAnimationFrame(() => {
        tooltipElement.style.opacity = '1'
        tooltipElement.style.transform = 'translateY(0)'
      })

      return tooltipElement
    },

    hide: (tooltipElement: HTMLElement) => {
      tooltipElement.style.transition = `all ${fadeOutDuration}ms ease-in`
      tooltipElement.style.opacity = '0'
      tooltipElement.style.transform = 'translateY(-4px)'

      setTimeout(() => {
        if (tooltipElement.parentNode) {
          tooltipElement.parentNode.removeChild(tooltipElement)
        }
      }, fadeOutDuration)
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatPieTooltip,
    positionPieTooltip,
    createTooltipData,
    createRichTooltip,
    createTooltipManager,
    createFadeTooltip
  }
}