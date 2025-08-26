import * as d3 from 'd3'
import { PieSlice } from '../types/pie-chart'

/**
 * Create comprehensive interaction handlers for pie chart slices
 */
export const createInteractionHandlers = (
  config: {
    onHover?: (slice: PieSlice | null, event: MouseEvent) => void
    onClick?: (slice: PieSlice, event: MouseEvent) => void
    onDoubleClick?: (slice: PieSlice, event: MouseEvent) => void
    onRightClick?: (slice: PieSlice, event: MouseEvent) => void
    onFocus?: (slice: PieSlice) => void
    onBlur?: (slice: PieSlice) => void
    enableTooltip?: boolean
    enableKeyboard?: boolean
    enableTouch?: boolean
  } = {}
) => {
  const {
    onHover,
    onClick,
    onDoubleClick,
    onRightClick,
    onFocus,
    onBlur,
    enableTooltip = true,
    enableKeyboard = true,
    enableTouch = true
  } = config

  let lastClickTime = 0
  let clickTimeout: NodeJS.Timeout | null = null
  const doubleClickThreshold = 300

  return {
    // Mouse event handlers
    mouseEnter: (slice: PieSlice, element: SVGElement) => (event: MouseEvent) => {
      onHover?.(slice, event)
      
      if (enableTooltip) {
        // Tooltip would be shown here
        element.setAttribute('data-tooltip-active', 'true')
      }
    },

    mouseLeave: (slice: PieSlice, element: SVGElement) => (event: MouseEvent) => {
      onHover?.(null, event)
      
      if (enableTooltip) {
        element.removeAttribute('data-tooltip-active')
      }
    },

    mouseMove: (slice: PieSlice, element: SVGElement) => (event: MouseEvent) => {
      // Update tooltip position if active
      if (enableTooltip && element.getAttribute('data-tooltip-active')) {
        // Tooltip position update would happen here
      }
    },

    click: (slice: PieSlice, element: SVGElement) => (event: MouseEvent) => {
      const now = Date.now()
      const timeSinceLastClick = now - lastClickTime

      if (timeSinceLastClick < doubleClickThreshold && clickTimeout) {
        // This is a double click
        clearTimeout(clickTimeout)
        clickTimeout = null
        lastClickTime = 0
        onDoubleClick?.(slice, event)
      } else {
        // This might be a single click, wait to see if double click follows
        lastClickTime = now
        clickTimeout = setTimeout(() => {
          onClick?.(slice, event)
          clickTimeout = null
        }, doubleClickThreshold)
      }
    },

    contextMenu: (slice: PieSlice) => (event: MouseEvent) => {
      if (onRightClick) {
        event.preventDefault()
        onRightClick(slice, event)
      }
    },

    // Keyboard event handlers
    keyDown: (slice: PieSlice, element: SVGElement) => (event: KeyboardEvent) => {
      if (!enableKeyboard) return

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          // Simulate click
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          })
          onClick?.(slice, clickEvent)
          break

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          // Focus previous slice (would be implemented with navigation manager)
          break

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          // Focus next slice (would be implemented with navigation manager)
          break
      }
    },

    focus: (slice: PieSlice) => () => {
      onFocus?.(slice)
    },

    blur: (slice: PieSlice) => () => {
      onBlur?.(slice)
    },

    // Touch event handlers for mobile
    touchStart: (slice: PieSlice, element: SVGElement) => (event: TouchEvent) => {
      if (!enableTouch) return

      // Mark touch start time for long press detection
      element.setAttribute('data-touch-start', Date.now().toString())
    },

    touchEnd: (slice: PieSlice, element: SVGElement) => (event: TouchEvent) => {
      if (!enableTouch) return

      const touchStart = element.getAttribute('data-touch-start')
      if (touchStart) {
        const touchDuration = Date.now() - parseInt(touchStart)
        element.removeAttribute('data-touch-start')

        if (touchDuration < 500) {
          // Short touch - treat as click
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true
          })
          onClick?.(slice, clickEvent)
        } else {
          // Long touch - treat as right click
          const rightClickEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true
          })
          onRightClick?.(slice, rightClickEvent)
        }
      }
    },

    touchCancel: (slice: PieSlice, element: SVGElement) => () => {
      element.removeAttribute('data-touch-start')
    }
  }
}

/**
 * Bind all interaction events to slice elements
 */
export const bindSliceEvents = (
  slices: PieSlice[],
  sliceElements: SVGElement[],
  handlers: ReturnType<typeof createInteractionHandlers>
) => {
  const unbindFunctions: (() => void)[] = []

  slices.forEach((slice, index) => {
    const element = sliceElements[index]
    if (!element) return

    // Create bound handlers
    const boundHandlers = {
      mouseenter: handlers.mouseEnter(slice, element),
      mouseleave: handlers.mouseLeave(slice, element),
      mousemove: handlers.mouseMove(slice, element),
      click: handlers.click(slice, element),
      contextmenu: handlers.contextMenu(slice),
      keydown: handlers.keyDown(slice, element),
      focus: handlers.focus(slice),
      blur: handlers.blur(slice),
      touchstart: handlers.touchStart(slice, element),
      touchend: handlers.touchEnd(slice, element),
      touchcancel: handlers.touchCancel(slice, element)
    }

    // Bind events
    Object.entries(boundHandlers).forEach(([eventType, handler]) => {
      element.addEventListener(eventType as keyof SVGElementEventMap, handler as any)
    })

    // Make element focusable for keyboard navigation
    element.setAttribute('tabindex', '-1')
    element.setAttribute('role', 'button')
    element.setAttribute('aria-label', 
      `${slice.data.label}: ${slice.data.value} (${(slice.data.percentage || 0).toFixed(1)}%)`
    )

    // Store unbind function
    unbindFunctions.push(() => {
      Object.entries(boundHandlers).forEach(([eventType, handler]) => {
        element.removeEventListener(eventType as keyof SVGElementEventMap, handler as any)
      })
      element.removeAttribute('tabindex')
      element.removeAttribute('role')
      element.removeAttribute('aria-label')
    })
  })

  return {
    unbind: () => {
      unbindFunctions.forEach(fn => fn())
    }
  }
}

/**
 * Create advanced event manager with delegation
 */
export const createEventManager = (
  chartContainer: SVGElement | HTMLElement,
  config: {
    useEventDelegation?: boolean
    enableTouchGestures?: boolean
    enableMouseGestures?: boolean
    gestureThreshold?: number
  } = {}
) => {
  const {
    useEventDelegation = true,
    enableTouchGestures = true,
    enableMouseGestures = false,
    gestureThreshold = 10
  } = config

  const eventListeners = new Map<string, EventListener>()
  let isActive = false

  const findSliceElement = (target: Element): SVGElement | null => {
    let current = target
    while (current && current !== chartContainer) {
      if (current.classList.contains('slice') || current.getAttribute('data-slice-index')) {
        return current as SVGElement
      }
      current = current.parentElement!
    }
    return null
  }

  const getSliceFromElement = (element: SVGElement): { slice: PieSlice; index: number } | null => {
    const indexAttr = element.getAttribute('data-slice-index')
    if (indexAttr) {
      const index = parseInt(indexAttr)
      // In real implementation, would get slice from data
      return { slice: {} as PieSlice, index }
    }
    return null
  }

  return {
    initialize: (
      onSliceEvent: (eventType: string, slice: PieSlice, event: Event) => void
    ) => {
      if (isActive) return

      if (useEventDelegation) {
        // Set up delegated event listeners
        const delegatedHandler = (eventType: string) => (event: Event) => {
          const sliceElement = findSliceElement(event.target as Element)
          if (sliceElement) {
            const sliceData = getSliceFromElement(sliceElement)
            if (sliceData) {
              onSliceEvent(eventType, sliceData.slice, event)
            }
          }
        }

        const eventTypes = [
          'click', 'dblclick', 'contextmenu',
          'mouseenter', 'mouseleave', 'mousemove',
          'keydown', 'keyup',
          'touchstart', 'touchend', 'touchmove', 'touchcancel',
          'focus', 'blur'
        ]

        eventTypes.forEach(eventType => {
          const handler = delegatedHandler(eventType)
          eventListeners.set(eventType, handler)
          chartContainer.addEventListener(eventType, handler)
        })
      }

      isActive = true
    },

    destroy: () => {
      eventListeners.forEach((handler, eventType) => {
        chartContainer.removeEventListener(eventType, handler)
      })
      eventListeners.clear()
      isActive = false
    },

    isActive: () => isActive,

    // Gesture recognition methods
    recognizeGesture: (
      touchEvents: TouchEvent[],
      gestureType: 'swipe' | 'pinch' | 'tap' | 'long-press'
    ) => {
      // Simplified gesture recognition
      if (gestureType === 'swipe' && touchEvents.length >= 2) {
        const start = touchEvents[0]
        const end = touchEvents[touchEvents.length - 1]
        
        if (start.touches.length === 1 && end.changedTouches.length === 1) {
          const startTouch = start.touches[0]
          const endTouch = end.changedTouches[0]
          
          const deltaX = endTouch.clientX - startTouch.clientX
          const deltaY = endTouch.clientY - startTouch.clientY
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          
          if (distance > gestureThreshold) {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
            return {
              type: 'swipe',
              direction: Math.abs(angle) < 45 ? 'horizontal' : 'vertical',
              distance,
              angle,
              duration: end.timeStamp - start.timeStamp
            }
          }
        }
      }

      return null
    }
  }
}

/**
 * Create interaction state manager
 */
export const createInteractionStateManager = () => {
  const state = {
    hoveredSlice: null as PieSlice | null,
    focusedSlice: null as PieSlice | null,
    selectedSlices: [] as PieSlice[],
    pressedSlice: null as PieSlice | null,
    draggedSlice: null as PieSlice | null
  }

  const listeners: Array<(state: typeof state) => void> = []

  const notifyChange = () => {
    listeners.forEach(listener => listener({ ...state }))
  }

  return {
    getState: () => ({ ...state }),

    setHovered: (slice: PieSlice | null) => {
      if (state.hoveredSlice !== slice) {
        state.hoveredSlice = slice
        notifyChange()
      }
    },

    setFocused: (slice: PieSlice | null) => {
      if (state.focusedSlice !== slice) {
        state.focusedSlice = slice
        notifyChange()
      }
    },

    toggleSelected: (slice: PieSlice) => {
      const index = state.selectedSlices.findIndex(s => s.index === slice.index)
      if (index >= 0) {
        state.selectedSlices.splice(index, 1)
      } else {
        state.selectedSlices.push(slice)
      }
      notifyChange()
    },

    setPressed: (slice: PieSlice | null) => {
      if (state.pressedSlice !== slice) {
        state.pressedSlice = slice
        notifyChange()
      }
    },

    setDragged: (slice: PieSlice | null) => {
      if (state.draggedSlice !== slice) {
        state.draggedSlice = slice
        notifyChange()
      }
    },

    clearAll: () => {
      const hasChanges = state.hoveredSlice || state.focusedSlice || 
                        state.selectedSlices.length > 0 || state.pressedSlice || state.draggedSlice

      if (hasChanges) {
        state.hoveredSlice = null
        state.focusedSlice = null
        state.selectedSlices.length = 0
        state.pressedSlice = null
        state.draggedSlice = null
        notifyChange()
      }
    },

    subscribe: (listener: (state: typeof state) => void) => {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index >= 0) {
          listeners.splice(index, 1)
        }
      }
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createInteractionHandlers,
    bindSliceEvents,
    createEventManager,
    createInteractionStateManager
  }
}