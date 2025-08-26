import { PieSlice } from '../types/pie-chart'

/**
 * Handle legend item click interactions
 */
export const handleLegendClick = (
  slice: PieSlice,
  event: MouseEvent,
  config: {
    toggleMode?: 'hide' | 'highlight' | 'isolate'
    onToggle?: (slice: PieSlice, visible: boolean) => void
    multiSelect?: boolean
  } = {}
) => {
  const {
    toggleMode = 'hide',
    onToggle,
    multiSelect = false
  } = config

  event.preventDefault()
  event.stopPropagation()

  switch (toggleMode) {
    case 'hide':
      // Toggle slice visibility
      slice.isVisible = !slice.isVisible
      onToggle?.(slice, slice.isVisible)
      break

    case 'highlight':
      // Toggle slice highlight
      slice.isHighlighted = !slice.isHighlighted
      onToggle?.(slice, slice.isHighlighted)
      break

    case 'isolate':
      // Show only this slice (unless already isolated)
      const wasIsolated = slice.isVisible && !slice.isHighlighted
      slice.isVisible = !wasIsolated
      slice.isHighlighted = !wasIsolated
      onToggle?.(slice, slice.isVisible)
      break
  }

  return {
    slice,
    toggleMode,
    visible: slice.isVisible,
    highlighted: slice.isHighlighted,
    event
  }
}

/**
 * Handle legend item hover interactions
 */
export const handleLegendHover = (
  slice: PieSlice,
  event: MouseEvent,
  config: {
    highlightSlice?: boolean
    dimOthers?: boolean
    showTooltip?: boolean
    onHover?: (slice: PieSlice, isHovering: boolean) => void
  } = {}
) => {
  const {
    highlightSlice = true,
    dimOthers = true,
    showTooltip = false,
    onHover
  } = config

  const isEntering = event.type === 'mouseenter'
  
  if (highlightSlice) {
    slice.isHighlighted = isEntering
  }

  onHover?.(slice, isEntering)

  return {
    slice,
    isHovering: isEntering,
    shouldHighlight: highlightSlice,
    shouldDimOthers: dimOthers,
    event
  }
}

/**
 * Toggle slice visibility with animation support
 */
export const toggleSliceVisibility = (
  slice: PieSlice,
  element: SVGElement,
  config: {
    animationDuration?: number
    hideOpacity?: number
    showOpacity?: number
    onComplete?: (slice: PieSlice, visible: boolean) => void
  } = {}
) => {
  const {
    animationDuration = 300,
    hideOpacity = 0.1,
    showOpacity = 1.0,
    onComplete
  } = config

  slice.isVisible = !slice.isVisible
  const targetOpacity = slice.isVisible ? showOpacity : hideOpacity

  // Apply animation (would use D3 transitions in real implementation)
  if (element) {
    element.style.transition = `opacity ${animationDuration}ms ease-in-out`
    element.style.opacity = targetOpacity.toString()

    setTimeout(() => {
      onComplete?.(slice, slice.isVisible)
    }, animationDuration)
  }

  return {
    slice,
    visible: slice.isVisible,
    targetOpacity,
    duration: animationDuration
  }
}

/**
 * Create legend manager for handling multiple legend interactions
 */
export const createLegendManager = (
  slices: PieSlice[],
  config: {
    enableMultiSelect?: boolean
    enableIsolation?: boolean
    syncWithChart?: boolean
  } = {}
) => {
  const {
    enableMultiSelect = true,
    enableIsolation = true,
    syncWithChart = true
  } = config

  let hiddenSlices = new Set<number>()
  let highlightedSlices = new Set<number>()
  let isolatedSlice: number | null = null

  return {
    toggleVisibility: (sliceIndex: number) => {
      const slice = slices[sliceIndex]
      if (!slice) return null

      if (hiddenSlices.has(sliceIndex)) {
        hiddenSlices.delete(sliceIndex)
        slice.isVisible = true
      } else {
        hiddenSlices.add(sliceIndex)
        slice.isVisible = false
      }

      return {
        slice,
        visible: slice.isVisible,
        hiddenCount: hiddenSlices.size
      }
    },

    toggleHighlight: (sliceIndex: number) => {
      const slice = slices[sliceIndex]
      if (!slice) return null

      if (highlightedSlices.has(sliceIndex)) {
        highlightedSlices.delete(sliceIndex)
        slice.isHighlighted = false
      } else {
        if (!enableMultiSelect) {
          // Clear other highlights in single-select mode
          highlightedSlices.clear()
          slices.forEach(s => { s.isHighlighted = false })
        }
        highlightedSlices.add(sliceIndex)
        slice.isHighlighted = true
      }

      return {
        slice,
        highlighted: slice.isHighlighted,
        highlightedCount: highlightedSlices.size
      }
    },

    isolateSlice: (sliceIndex: number) => {
      if (!enableIsolation) return null

      const slice = slices[sliceIndex]
      if (!slice) return null

      if (isolatedSlice === sliceIndex) {
        // Un-isolate - show all slices
        isolatedSlice = null
        slices.forEach(s => { s.isVisible = true })
        hiddenSlices.clear()
      } else {
        // Isolate this slice - hide all others
        isolatedSlice = sliceIndex
        slices.forEach((s, index) => {
          s.isVisible = index === sliceIndex
          if (index !== sliceIndex) {
            hiddenSlices.add(index)
          } else {
            hiddenSlices.delete(index)
          }
        })
      }

      return {
        isolatedSlice,
        visibleSlices: slices.filter(s => s.isVisible).length
      }
    },

    showAll: () => {
      hiddenSlices.clear()
      isolatedSlice = null
      slices.forEach(s => { s.isVisible = true })

      return {
        visibleSlices: slices.length,
        hiddenSlices: 0
      }
    },

    hideAll: () => {
      hiddenSlices = new Set(slices.map((_, index) => index))
      isolatedSlice = null
      slices.forEach(s => { s.isVisible = false })

      return {
        visibleSlices: 0,
        hiddenSlices: slices.length
      }
    },

    clearHighlights: () => {
      highlightedSlices.clear()
      slices.forEach(s => { s.isHighlighted = false })

      return {
        highlightedSlices: 0
      }
    },

    getState: () => ({
      hiddenSlices: Array.from(hiddenSlices),
      highlightedSlices: Array.from(highlightedSlices),
      isolatedSlice,
      visibleCount: slices.filter(s => s.isVisible).length,
      highlightedCount: highlightedSlices.size
    }),

    applyState: (state: {
      hiddenSlices?: number[]
      highlightedSlices?: number[]
      isolatedSlice?: number | null
    }) => {
      if (state.hiddenSlices) {
        hiddenSlices = new Set(state.hiddenSlices)
        slices.forEach((s, index) => {
          s.isVisible = !hiddenSlices.has(index)
        })
      }

      if (state.highlightedSlices) {
        highlightedSlices = new Set(state.highlightedSlices)
        slices.forEach((s, index) => {
          s.isHighlighted = highlightedSlices.has(index)
        })
      }

      if (state.isolatedSlice !== undefined) {
        isolatedSlice = state.isolatedSlice
      }

      return this.getState()
    }
  }
}

/**
 * Create interactive legend with keyboard support
 */
export const createInteractiveLegend = (
  slices: PieSlice[],
  container: HTMLElement,
  config: {
    layout?: 'horizontal' | 'vertical'
    showValues?: boolean
    showPercentages?: boolean
    enableKeyboardNav?: boolean
  } = {}
) => {
  const {
    layout = 'horizontal',
    showValues = true,
    showPercentages = true,
    enableKeyboardNav = true
  } = config

  const legendItems: HTMLElement[] = []
  let focusedIndex = -1

  // Create legend items
  slices.forEach((slice, index) => {
    const item = document.createElement('div')
    item.className = 'pie-legend-item'
    item.style.cssText = `
      display: ${layout === 'horizontal' ? 'inline-flex' : 'flex'};
      align-items: center;
      margin: 4px 8px;
      padding: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    `

    if (enableKeyboardNav) {
      item.tabIndex = 0
      item.setAttribute('role', 'button')
      item.setAttribute('aria-label', 
        `${slice.data.label}: ${slice.data.value}${
          showPercentages && slice.data.percentage 
            ? ` (${slice.data.percentage.toFixed(1)}%)` 
            : ''
        }`
      )
    }

    // Color indicator
    const colorIndicator = document.createElement('div')
    colorIndicator.style.cssText = `
      width: 12px;
      height: 12px;
      background-color: ${slice.color};
      margin-right: 8px;
      border-radius: 2px;
      flex-shrink: 0;
    `
    item.appendChild(colorIndicator)

    // Text content
    const textContent = document.createElement('span')
    let text = slice.data.label
    if (showValues) text += `: ${slice.data.value}`
    if (showPercentages && slice.data.percentage) {
      text += ` (${slice.data.percentage.toFixed(1)}%)`
    }
    textContent.textContent = text
    textContent.style.fontSize = '12px'
    item.appendChild(textContent)

    // Event handlers
    item.addEventListener('click', (event) => {
      handleLegendClick(slice, event)
      // Update visual state
      item.style.opacity = slice.isVisible ? '1' : '0.5'
    })

    item.addEventListener('mouseenter', (event) => {
      handleLegendHover(slice, event)
      item.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
    })

    item.addEventListener('mouseleave', (event) => {
      handleLegendHover(slice, event)
      item.style.backgroundColor = 'transparent'
    })

    if (enableKeyboardNav) {
      item.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault()
            handleLegendClick(slice, event as any)
            break
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault()
            this.focusNext()
            break
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault()
            this.focusPrevious()
            break
        }
      })

      item.addEventListener('focus', () => {
        focusedIndex = index
      })
    }

    container.appendChild(item)
    legendItems.push(item)
  })

  return {
    items: legendItems,
    
    focusNext: () => {
      const nextIndex = (focusedIndex + 1) % legendItems.length
      legendItems[nextIndex]?.focus()
      return nextIndex
    },

    focusPrevious: () => {
      const prevIndex = (focusedIndex - 1 + legendItems.length) % legendItems.length
      legendItems[prevIndex]?.focus()
      return prevIndex
    },

    updateItem: (index: number, slice: PieSlice) => {
      const item = legendItems[index]
      if (!item) return false

      // Update color
      const colorIndicator = item.querySelector('div') as HTMLElement
      if (colorIndicator) {
        colorIndicator.style.backgroundColor = slice.color
      }

      // Update visibility
      item.style.opacity = slice.isVisible ? '1' : '0.5'

      // Update highlight
      item.style.backgroundColor = slice.isHighlighted 
        ? 'rgba(0, 123, 255, 0.1)' 
        : 'transparent'

      return true
    },

    destroy: () => {
      legendItems.forEach(item => {
        if (item.parentNode) {
          item.parentNode.removeChild(item)
        }
      })
      legendItems.length = 0
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleLegendClick,
    handleLegendHover,
    toggleSliceVisibility,
    createLegendManager,
    createInteractiveLegend
  }
}