import { PieSlice } from '../types/pie-chart'

/**
 * Handle slice click interactions
 */
export const handleSliceClick = (
  slice: PieSlice,
  event: MouseEvent,
  config: {
    enableMultiSelect?: boolean
    selectedSlices?: number[]
    onSelectionChange?: (selectedSlices: number[]) => void
    enableToggle?: boolean
  } = {}
) => {
  const {
    enableMultiSelect = false,
    selectedSlices = [],
    onSelectionChange,
    enableToggle = true
  } = config

  event.preventDefault()
  event.stopPropagation()

  let newSelection: number[]

  if (enableMultiSelect) {
    // Multi-select mode
    const isSelected = selectedSlices.includes(slice.index)
    
    if (isSelected && enableToggle) {
      // Remove from selection
      newSelection = selectedSlices.filter(index => index !== slice.index)
    } else if (!isSelected) {
      // Add to selection
      newSelection = [...selectedSlices, slice.index]
    } else {
      // No change if toggle disabled and already selected
      newSelection = selectedSlices
    }
  } else {
    // Single select mode
    const isSelected = selectedSlices.includes(slice.index)
    
    if (isSelected && enableToggle) {
      // Deselect
      newSelection = []
    } else {
      // Select this slice only
      newSelection = [slice.index]
    }
  }

  onSelectionChange?.(newSelection)

  return {
    selectedSlices: newSelection,
    clickedSlice: slice,
    isMultiSelect: enableMultiSelect,
    event
  }
}

/**
 * Handle drill-down navigation
 */
export const handleDrillDown = (
  slice: PieSlice,
  config: {
    drillDownData?: any
    maxDepth?: number
    currentDepth?: number
    onDrillDown?: (slice: PieSlice, depth: number) => void
    canDrillDown?: (slice: PieSlice) => boolean
  } = {}
) => {
  const {
    maxDepth = 3,
    currentDepth = 0,
    onDrillDown,
    canDrillDown = () => true
  } = config

  // Check if drill-down is possible
  if (currentDepth >= maxDepth) {
    return {
      success: false,
      reason: 'Maximum drill-down depth reached',
      currentDepth
    }
  }

  if (!canDrillDown(slice)) {
    return {
      success: false,
      reason: 'Slice does not support drill-down',
      currentDepth
    }
  }

  // Execute drill-down
  const newDepth = currentDepth + 1
  onDrillDown?.(slice, newDepth)

  return {
    success: true,
    slice,
    newDepth,
    previousDepth: currentDepth
  }
}

/**
 * Create click handler with debouncing
 */
export const createDebouncedClickHandler = (
  handler: (slice: PieSlice, event: MouseEvent) => void,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastClickTime = 0

  return (slice: PieSlice, event: MouseEvent) => {
    const now = Date.now()
    
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Check for double-click
    if (now - lastClickTime < delay) {
      // This is a double-click, execute immediately
      handler(slice, event)
      lastClickTime = 0
      return { type: 'double-click', executed: true }
    }

    // Set up delayed execution for single click
    timeoutId = setTimeout(() => {
      handler(slice, event)
      timeoutId = null
    }, delay)

    lastClickTime = now
    return { type: 'single-click', executed: false, delayed: true }
  }
}

/**
 * Create context menu handler
 */
export const createContextMenuHandler = (
  menuItems: Array<{
    label: string
    action: (slice: PieSlice) => void
    condition?: (slice: PieSlice) => boolean
    icon?: string
  }>
) => {
  return {
    onRightClick: (slice: PieSlice, event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      // Filter menu items based on conditions
      const availableItems = menuItems.filter(item => 
        !item.condition || item.condition(slice)
      )

      if (availableItems.length === 0) {
        return { success: false, reason: 'No menu items available' }
      }

      // Create context menu (simplified - in real implementation would create DOM element)
      const menu = {
        x: event.clientX,
        y: event.clientY,
        items: availableItems,
        slice,
        show: () => {
          // Implementation would show actual context menu
          console.log('Context menu would show at', event.clientX, event.clientY)
          return availableItems
        },
        hide: () => {
          // Implementation would hide context menu
          console.log('Context menu hidden')
        }
      }

      return { success: true, menu }
    },

    createDefaultMenu: (slice: PieSlice) => [
      {
        label: 'View Details',
        action: () => console.log('View details for', slice.data.label),
        icon: '👁️'
      },
      {
        label: 'Drill Down',
        action: () => console.log('Drill down from', slice.data.label),
        condition: () => slice.data.metadata?.hasChildren || false,
        icon: '🔍'
      },
      {
        label: 'Export Data',
        action: () => console.log('Export data for', slice.data.label),
        icon: '📥'
      }
    ]
  }
}

/**
 * Handle slice selection with visual feedback
 */
export const createSelectionHandler = (
  config: {
    selectedColor?: string
    unselectedOpacity?: number
    selectedOpacity?: number
    animationDuration?: number
  } = {}
) => {
  const {
    selectedColor = '#007bff',
    unselectedOpacity = 0.6,
    selectedOpacity = 1.0,
    animationDuration = 200
  } = config

  let selectedSlices = new Set<number>()

  return {
    select: (slice: PieSlice, element: SVGElement, isMultiSelect = false) => {
      if (!isMultiSelect) {
        selectedSlices.clear()
      }

      selectedSlices.add(slice.index)

      // Apply visual feedback (would use D3 in real implementation)
      return {
        success: true,
        selectedSlices: Array.from(selectedSlices),
        visualUpdate: {
          element,
          color: selectedColor,
          opacity: selectedOpacity
        }
      }
    },

    deselect: (slice: PieSlice, element: SVGElement) => {
      selectedSlices.delete(slice.index)

      return {
        success: true,
        selectedSlices: Array.from(selectedSlices),
        visualUpdate: {
          element,
          color: slice.color,
          opacity: selectedOpacity
        }
      }
    },

    toggle: (slice: PieSlice, element: SVGElement, isMultiSelect = false) => {
      const isSelected = selectedSlices.has(slice.index)
      
      if (isSelected) {
        return this.deselect(slice, element)
      } else {
        return this.select(slice, element, isMultiSelect)
      }
    },

    clear: () => {
      const previousSelection = Array.from(selectedSlices)
      selectedSlices.clear()
      
      return {
        success: true,
        previousSelection,
        selectedSlices: []
      }
    },

    getSelected: () => Array.from(selectedSlices),

    isSelected: (sliceIndex: number) => selectedSlices.has(sliceIndex)
  }
}

/**
 * Advanced click handler with gesture recognition
 */
export const createAdvancedClickHandler = (
  config: {
    singleClickDelay?: number
    doubleClickThreshold?: number
    longPressThreshold?: number
    enableGestures?: boolean
  } = {}
) => {
  const {
    singleClickDelay = 200,
    doubleClickThreshold = 300,
    longPressThreshold = 500,
    enableGestures = true
  } = config

  let clickState = {
    lastClickTime: 0,
    clickCount: 0,
    pressStartTime: 0,
    isLongPress: false,
    timeoutId: null as NodeJS.Timeout | null
  }

  return {
    onMouseDown: (slice: PieSlice, event: MouseEvent) => {
      clickState.pressStartTime = Date.now()
      clickState.isLongPress = false

      if (enableGestures) {
        // Set up long press detection
        setTimeout(() => {
          if (Date.now() - clickState.pressStartTime >= longPressThreshold) {
            clickState.isLongPress = true
            return { type: 'long-press', slice, event }
          }
        }, longPressThreshold)
      }

      return { type: 'mouse-down', slice, event }
    },

    onMouseUp: (slice: PieSlice, event: MouseEvent) => {
      const now = Date.now()
      const pressDuration = now - clickState.pressStartTime

      // Handle long press
      if (clickState.isLongPress) {
        return { type: 'long-press', slice, event, duration: pressDuration }
      }

      // Handle click
      const timeSinceLastClick = now - clickState.lastClickTime

      if (timeSinceLastClick < doubleClickThreshold) {
        // This might be a double click
        clickState.clickCount++
        
        if (clickState.clickCount >= 2) {
          // Double click confirmed
          clickState.clickCount = 0
          clickState.lastClickTime = 0
          
          if (clickState.timeoutId) {
            clearTimeout(clickState.timeoutId)
            clickState.timeoutId = null
          }

          return { type: 'double-click', slice, event }
        }
      } else {
        // Reset click count
        clickState.clickCount = 1
      }

      clickState.lastClickTime = now

      // Set up single click delay
      if (clickState.timeoutId) {
        clearTimeout(clickState.timeoutId)
      }

      clickState.timeoutId = setTimeout(() => {
        if (clickState.clickCount === 1) {
          clickState.clickCount = 0
          return { type: 'single-click', slice, event }
        }
      }, singleClickDelay)

      return { type: 'click-pending', slice, event }
    }
  }
}

/**
 * Create keyboard-accessible click handler
 */
export const createKeyboardClickHandler = () => {
  return {
    onKeyDown: (slice: PieSlice, event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        
        // Simulate click
        const mouseEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0
        })

        return { type: 'keyboard-click', slice, originalEvent: event, simulatedEvent: mouseEvent }
      }

      return { type: 'keyboard-other', slice, event }
    },

    makeSliceFocusable: (element: SVGElement, slice: PieSlice) => {
      element.setAttribute('tabindex', '0')
      element.setAttribute('role', 'button')
      element.setAttribute('aria-label', `${slice.data.label}: ${slice.data.value}`)
      
      return element
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleSliceClick,
    handleDrillDown,
    createDebouncedClickHandler,
    createContextMenuHandler,
    createSelectionHandler,
    createAdvancedClickHandler,
    createKeyboardClickHandler
  }
}