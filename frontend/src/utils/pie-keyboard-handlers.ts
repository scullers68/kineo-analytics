import { PieSlice } from '../types/pie-chart'

/**
 * Handle keyboard navigation for pie chart slices
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  currentSliceIndex: number,
  totalSlices: number,
  config: {
    onSliceChange?: (newIndex: number) => void
    onSliceSelect?: (sliceIndex: number) => void
    onEscape?: () => void
    enableCircular?: boolean
  } = {}
) => {
  const {
    onSliceChange,
    onSliceSelect,
    onEscape,
    enableCircular = true
  } = config

  let newIndex = currentSliceIndex

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      newIndex = currentSliceIndex + 1
      if (newIndex >= totalSlices) {
        newIndex = enableCircular ? 0 : totalSlices - 1
      }
      break

    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      newIndex = currentSliceIndex - 1
      if (newIndex < 0) {
        newIndex = enableCircular ? totalSlices - 1 : 0
      }
      break

    case 'Enter':
    case ' ':
      event.preventDefault()
      onSliceSelect?.(currentSliceIndex)
      return { type: 'select', sliceIndex: currentSliceIndex }

    case 'Escape':
      event.preventDefault()
      onEscape?.()
      return { type: 'escape', sliceIndex: currentSliceIndex }

    case 'Home':
      event.preventDefault()
      newIndex = 0
      break

    case 'End':
      event.preventDefault()
      newIndex = totalSlices - 1
      break

    default:
      return { type: 'unhandled', key: event.key, sliceIndex: currentSliceIndex }
  }

  if (newIndex !== currentSliceIndex) {
    onSliceChange?.(newIndex)
    return { type: 'navigate', previousIndex: currentSliceIndex, newIndex }
  }

  return { type: 'no-change', sliceIndex: currentSliceIndex }
}

/**
 * Focus the next slice in the sequence
 */
export const focusNextSlice = (
  currentIndex: number,
  slices: PieSlice[],
  sliceElements: SVGElement[],
  config: {
    skipHidden?: boolean
    circular?: boolean
  } = {}
) => {
  const { skipHidden = true, circular = true } = config
  
  let nextIndex = currentIndex + 1
  let attempts = 0
  const maxAttempts = slices.length

  while (attempts < maxAttempts) {
    // Handle wraparound
    if (nextIndex >= slices.length) {
      nextIndex = circular ? 0 : slices.length - 1
      if (!circular) break
    }

    const slice = slices[nextIndex]
    const element = sliceElements[nextIndex]

    // Skip hidden slices if configured
    if (skipHidden && (!slice.isVisible || slice.isVisible === false)) {
      nextIndex++
      attempts++
      continue
    }

    // Focus the element
    if (element) {
      element.focus()
      return {
        success: true,
        previousIndex: currentIndex,
        newIndex: nextIndex,
        slice,
        element
      }
    }

    break
  }

  return {
    success: false,
    previousIndex: currentIndex,
    newIndex: currentIndex,
    reason: attempts >= maxAttempts ? 'no-focusable-slices' : 'element-not-found'
  }
}

/**
 * Focus the previous slice in the sequence
 */
export const focusPreviousSlice = (
  currentIndex: number,
  slices: PieSlice[],
  sliceElements: SVGElement[],
  config: {
    skipHidden?: boolean
    circular?: boolean
  } = {}
) => {
  const { skipHidden = true, circular = true } = config
  
  let prevIndex = currentIndex - 1
  let attempts = 0
  const maxAttempts = slices.length

  while (attempts < maxAttempts) {
    // Handle wraparound
    if (prevIndex < 0) {
      prevIndex = circular ? slices.length - 1 : 0
      if (!circular) break
    }

    const slice = slices[prevIndex]
    const element = sliceElements[prevIndex]

    // Skip hidden slices if configured
    if (skipHidden && (!slice.isVisible || slice.isVisible === false)) {
      prevIndex--
      attempts++
      continue
    }

    // Focus the element
    if (element) {
      element.focus()
      return {
        success: true,
        previousIndex: currentIndex,
        newIndex: prevIndex,
        slice,
        element
      }
    }

    break
  }

  return {
    success: false,
    previousIndex: currentIndex,
    newIndex: currentIndex,
    reason: attempts >= maxAttempts ? 'no-focusable-slices' : 'element-not-found'
  }
}

/**
 * Create keyboard navigation manager
 */
export const createKeyboardNavigationManager = (
  slices: PieSlice[],
  sliceElements: SVGElement[],
  config: {
    enableArrowKeys?: boolean
    enableEnterSelect?: boolean
    enableEscapeReset?: boolean
    enableHomeEnd?: boolean
    announceFocus?: boolean
  } = {}
) => {
  const {
    enableArrowKeys = true,
    enableEnterSelect = true,
    enableEscapeReset = true,
    enableHomeEnd = true,
    announceFocus = true
  } = config

  let currentFocusIndex = 0
  let isActive = false

  // Set up ARIA attributes for all slice elements
  const setupAccessibility = () => {
    sliceElements.forEach((element, index) => {
      element.setAttribute('tabindex', index === 0 ? '0' : '-1')
      element.setAttribute('role', 'button')
      element.setAttribute('aria-label', 
        `${slices[index].data.label}, ${slices[index].data.value}, ${
          (slices[index].data.percentage || 0).toFixed(1)
        }% of total`
      )
    })
  }

  const announceSlice = (slice: PieSlice) => {
    if (!announceFocus) return

    // Create or update announcement element
    let announcer = document.getElementById('pie-chart-announcer')
    if (!announcer) {
      announcer = document.createElement('div')
      announcer.id = 'pie-chart-announcer'
      announcer.className = 'sr-only'
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      document.body.appendChild(announcer)
    }

    announcer.textContent = `Focused on ${slice.data.label}, value ${slice.data.value}, ${
      (slice.data.percentage || 0).toFixed(1)
    }% of total`
  }

  return {
    initialize: () => {
      setupAccessibility()
      isActive = true
      
      // Add global keyboard listener
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isActive) return

        const result = handleKeyboardNavigation(
          event,
          currentFocusIndex,
          slices.length,
          {
            onSliceChange: (newIndex) => {
              this.focusSlice(newIndex)
            },
            onSliceSelect: (sliceIndex) => {
              // Trigger click event
              const element = sliceElements[sliceIndex]
              if (element) {
                element.dispatchEvent(new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true
                }))
              }
            },
            onEscape: () => {
              this.blur()
            }
          }
        )

        return result
      }

      document.addEventListener('keydown', handleKeyDown)
      
      return {
        cleanup: () => {
          document.removeEventListener('keydown', handleKeyDown)
        }
      }
    },

    focusSlice: (index: number) => {
      if (index < 0 || index >= slices.length) return false

      // Update tabindex
      sliceElements.forEach((element, i) => {
        element.setAttribute('tabindex', i === index ? '0' : '-1')
      })

      // Focus the element
      const element = sliceElements[index]
      const slice = slices[index]
      
      if (element && slice) {
        element.focus()
        currentFocusIndex = index
        announceSlice(slice)
        return true
      }

      return false
    },

    focusNext: () => {
      return focusNextSlice(currentFocusIndex, slices, sliceElements)
    },

    focusPrevious: () => {
      return focusPreviousSlice(currentFocusIndex, slices, sliceElements)
    },

    focusFirst: () => {
      return this.focusSlice(0)
    },

    focusLast: () => {
      return this.focusSlice(slices.length - 1)
    },

    getCurrentFocus: () => ({
      index: currentFocusIndex,
      slice: slices[currentFocusIndex],
      element: sliceElements[currentFocusIndex]
    }),

    blur: () => {
      const currentElement = sliceElements[currentFocusIndex]
      if (currentElement) {
        currentElement.blur()
      }
      isActive = false
    },

    activate: () => {
      isActive = true
      return this.focusSlice(currentFocusIndex)
    },

    isActive: () => isActive,

    updateSlices: (newSlices: PieSlice[], newElements: SVGElement[]) => {
      slices.length = 0
      slices.push(...newSlices)
      sliceElements.length = 0
      sliceElements.push(...newElements)
      
      // Adjust current focus if needed
      if (currentFocusIndex >= slices.length) {
        currentFocusIndex = Math.max(0, slices.length - 1)
      }
      
      setupAccessibility()
      return true
    }
  }
}

/**
 * Create enhanced keyboard handler with custom key mappings
 */
export const createCustomKeyboardHandler = (
  keyMappings: {
    select?: string[]
    next?: string[]
    previous?: string[]
    first?: string[]
    last?: string[]
    escape?: string[]
    toggle?: string[]
    info?: string[]
  } = {}
) => {
  const defaultMappings = {
    select: ['Enter', ' '],
    next: ['ArrowRight', 'ArrowDown'],
    previous: ['ArrowLeft', 'ArrowUp'],
    first: ['Home'],
    last: ['End'],
    escape: ['Escape'],
    toggle: ['t', 'T'],
    info: ['i', 'I']
  }

  const mappings = { ...defaultMappings, ...keyMappings }

  return {
    handleKey: (
      event: KeyboardEvent,
      context: {
        currentIndex: number
        totalSlices: number
        slice?: PieSlice
      },
      callbacks: {
        onNext?: () => void
        onPrevious?: () => void
        onSelect?: () => void
        onFirst?: () => void
        onLast?: () => void
        onEscape?: () => void
        onToggle?: () => void
        onInfo?: () => void
      } = {}
    ) => {
      const key = event.key

      if (mappings.select.includes(key)) {
        event.preventDefault()
        callbacks.onSelect?.()
        return { action: 'select', handled: true }
      }

      if (mappings.next.includes(key)) {
        event.preventDefault()
        callbacks.onNext?.()
        return { action: 'next', handled: true }
      }

      if (mappings.previous.includes(key)) {
        event.preventDefault()
        callbacks.onPrevious?.()
        return { action: 'previous', handled: true }
      }

      if (mappings.first.includes(key)) {
        event.preventDefault()
        callbacks.onFirst?.()
        return { action: 'first', handled: true }
      }

      if (mappings.last.includes(key)) {
        event.preventDefault()
        callbacks.onLast?.()
        return { action: 'last', handled: true }
      }

      if (mappings.escape.includes(key)) {
        event.preventDefault()
        callbacks.onEscape?.()
        return { action: 'escape', handled: true }
      }

      if (mappings.toggle.includes(key)) {
        event.preventDefault()
        callbacks.onToggle?.()
        return { action: 'toggle', handled: true }
      }

      if (mappings.info.includes(key)) {
        event.preventDefault()
        callbacks.onInfo?.()
        return { action: 'info', handled: true }
      }

      return { action: 'unhandled', handled: false, key }
    },

    getMappings: () => ({ ...mappings }),

    updateMappings: (newMappings: Partial<typeof mappings>) => {
      Object.assign(mappings, newMappings)
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleKeyboardNavigation,
    focusNextSlice,
    focusPreviousSlice,
    createKeyboardNavigationManager,
    createCustomKeyboardHandler
  }
}