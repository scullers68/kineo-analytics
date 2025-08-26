import { PieSlice } from '../types/pie-chart'

/**
 * Handle touch start events
 */
export const handleTouchStart = (
  slice: PieSlice,
  element: SVGElement,
  event: TouchEvent,
  config: {
    enableLongPress?: boolean
    longPressThreshold?: number
    enableMultiTouch?: boolean
    onTouchStart?: (slice: PieSlice, touchData: any) => void
  } = {}
) => {
  const {
    enableLongPress = true,
    longPressThreshold = 500,
    enableMultiTouch = false,
    onTouchStart
  } = config

  const touch = event.touches[0]
  if (!touch) return null

  const touchData = {
    identifier: touch.identifier,
    startTime: Date.now(),
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    currentY: touch.clientY,
    element,
    slice
  }

  // Store touch data on element
  element.setAttribute('data-touch-start', JSON.stringify({
    time: touchData.startTime,
    x: touchData.startX,
    y: touchData.startY,
    identifier: touchData.identifier
  }))

  // Set up long press detection
  if (enableLongPress) {
    const longPressTimer = setTimeout(() => {
      const isStillPressed = element.getAttribute('data-touch-start')
      if (isStillPressed) {
        // Trigger long press
        const longPressEvent = new CustomEvent('longpress', {
          detail: { slice, touchData, originalEvent: event }
        })
        element.dispatchEvent(longPressEvent)
      }
    }, longPressThreshold)

    element.setAttribute('data-long-press-timer', longPressTimer.toString())
  }

  onTouchStart?.(slice, touchData)

  return touchData
}

/**
 * Handle touch move events
 */
export const handleTouchMove = (
  slice: PieSlice,
  element: SVGElement,
  event: TouchEvent,
  config: {
    moveThreshold?: number
    enableSwipeDetection?: boolean
    onTouchMove?: (slice: PieSlice, touchData: any) => void
  } = {}
) => {
  const {
    moveThreshold = 10,
    enableSwipeDetection = true,
    onTouchMove
  } = config

  const touch = event.touches[0]
  if (!touch) return null

  const touchStartData = element.getAttribute('data-touch-start')
  if (!touchStartData) return null

  const startData = JSON.parse(touchStartData)
  const currentTime = Date.now()
  
  const touchData = {
    identifier: touch.identifier,
    startTime: startData.time,
    startX: startData.x,
    startY: startData.y,
    currentX: touch.clientX,
    currentY: touch.clientY,
    deltaX: touch.clientX - startData.x,
    deltaY: touch.clientY - startData.y,
    duration: currentTime - startData.time,
    distance: Math.sqrt(
      Math.pow(touch.clientX - startData.x, 2) + 
      Math.pow(touch.clientY - startData.y, 2)
    )
  }

  // Check if movement exceeds threshold (cancels tap/long press)
  if (touchData.distance > moveThreshold) {
    const longPressTimer = element.getAttribute('data-long-press-timer')
    if (longPressTimer) {
      clearTimeout(parseInt(longPressTimer))
      element.removeAttribute('data-long-press-timer')
    }
    
    element.setAttribute('data-touch-moved', 'true')
  }

  // Swipe detection
  if (enableSwipeDetection && touchData.distance > moveThreshold) {
    const angle = Math.atan2(touchData.deltaY, touchData.deltaX) * 180 / Math.PI
    let swipeDirection: string | null = null

    if (Math.abs(touchData.deltaX) > Math.abs(touchData.deltaY)) {
      swipeDirection = touchData.deltaX > 0 ? 'right' : 'left'
    } else {
      swipeDirection = touchData.deltaY > 0 ? 'down' : 'up'
    }

    const swipeData = {
      ...touchData,
      direction: swipeDirection,
      angle,
      velocity: touchData.distance / touchData.duration
    }

    element.setAttribute('data-swipe-data', JSON.stringify(swipeData))
  }

  onTouchMove?.(slice, touchData)

  return touchData
}

/**
 * Handle touch end events
 */
export const handleTouchEnd = (
  slice: PieSlice,
  element: SVGElement,
  event: TouchEvent,
  config: {
    tapThreshold?: number
    swipeThreshold?: number
    onTap?: (slice: PieSlice, touchData: any) => void
    onLongPress?: (slice: PieSlice, touchData: any) => void
    onSwipe?: (slice: PieSlice, swipeData: any) => void
    onTouchEnd?: (slice: PieSlice, touchData: any) => void
  } = {}
) => {
  const {
    tapThreshold = 200,
    swipeThreshold = 50,
    onTap,
    onLongPress,
    onSwipe,
    onTouchEnd
  } = config

  const touch = event.changedTouches[0]
  if (!touch) return null

  const touchStartData = element.getAttribute('data-touch-start')
  const touchMoved = element.getAttribute('data-touch-moved') === 'true'
  const swipeData = element.getAttribute('data-swipe-data')
  const longPressTimer = element.getAttribute('data-long-press-timer')

  // Clean up stored data
  element.removeAttribute('data-touch-start')
  element.removeAttribute('data-touch-moved')
  element.removeAttribute('data-swipe-data')
  
  if (longPressTimer) {
    clearTimeout(parseInt(longPressTimer))
    element.removeAttribute('data-long-press-timer')
  }

  if (!touchStartData) return null

  const startData = JSON.parse(touchStartData)
  const endTime = Date.now()
  const duration = endTime - startData.time

  const touchData = {
    identifier: touch.identifier,
    startTime: startData.time,
    endTime,
    duration,
    startX: startData.x,
    startY: startData.y,
    endX: touch.clientX,
    endY: touch.clientY,
    deltaX: touch.clientX - startData.x,
    deltaY: touch.clientY - startData.y,
    distance: Math.sqrt(
      Math.pow(touch.clientX - startData.x, 2) + 
      Math.pow(touch.clientY - startData.y, 2)
    )
  }

  // Determine gesture type
  if (swipeData) {
    const parsedSwipeData = JSON.parse(swipeData)
    if (parsedSwipeData.distance > swipeThreshold) {
      onSwipe?.(slice, parsedSwipeData)
      onTouchEnd?.(slice, { ...touchData, gesture: 'swipe', swipeData: parsedSwipeData })
      return touchData
    }
  }

  if (!touchMoved) {
    if (duration < tapThreshold) {
      // Short tap
      onTap?.(slice, touchData)
      onTouchEnd?.(slice, { ...touchData, gesture: 'tap' })
    } else {
      // Long press (if not already triggered)
      onLongPress?.(slice, touchData)
      onTouchEnd?.(slice, { ...touchData, gesture: 'longpress' })
    }
  } else {
    // Touch with movement but no swipe
    onTouchEnd?.(slice, { ...touchData, gesture: 'move' })
  }

  return touchData
}

/**
 * Create touch gesture recognizer
 */
export const createTouchGestureRecognizer = (
  config: {
    tapThreshold?: number
    longPressThreshold?: number
    swipeThreshold?: number
    swipeVelocityThreshold?: number
    pinchThreshold?: number
    enableMultiTouch?: boolean
  } = {}
) => {
  const {
    tapThreshold = 200,
    longPressThreshold = 500,
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.5,
    pinchThreshold = 10,
    enableMultiTouch = false
  } = config

  const activeTouches = new Map<number, any>()

  return {
    recognizeGesture: (touches: TouchList, eventType: string, timestamp: number) => {
      const gestures: any[] = []

      if (eventType === 'touchstart') {
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i]
          activeTouches.set(touch.identifier, {
            identifier: touch.identifier,
            startTime: timestamp,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
          })
        }
      } else if (eventType === 'touchmove') {
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i]
          const activeTouch = activeTouches.get(touch.identifier)
          if (activeTouch) {
            activeTouch.currentX = touch.clientX
            activeTouch.currentY = touch.clientY
          }
        }

        // Multi-touch gestures
        if (enableMultiTouch && activeTouches.size === 2) {
          const touchArray = Array.from(activeTouches.values())
          const [touch1, touch2] = touchArray

          const currentDistance = Math.sqrt(
            Math.pow(touch2.currentX - touch1.currentX, 2) + 
            Math.pow(touch2.currentY - touch1.currentY, 2)
          )

          const startDistance = Math.sqrt(
            Math.pow(touch2.startX - touch1.startX, 2) + 
            Math.pow(touch2.startY - touch1.startY, 2)
          )

          const distanceChange = currentDistance - startDistance

          if (Math.abs(distanceChange) > pinchThreshold) {
            gestures.push({
              type: distanceChange > 0 ? 'pinch-out' : 'pinch-in',
              scale: currentDistance / startDistance,
              centerX: (touch1.currentX + touch2.currentX) / 2,
              centerY: (touch1.currentY + touch2.currentY) / 2,
              distance: Math.abs(distanceChange)
            })
          }
        }
      } else if (eventType === 'touchend') {
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i]
          const activeTouch = activeTouches.get(touch.identifier)
          
          if (activeTouch) {
            const duration = timestamp - activeTouch.startTime
            const deltaX = touch.clientX - activeTouch.startX
            const deltaY = touch.clientY - activeTouch.startY
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

            // Determine gesture
            if (distance < 10 && duration < tapThreshold) {
              gestures.push({
                type: 'tap',
                x: touch.clientX,
                y: touch.clientY,
                duration
              })
            } else if (distance < 10 && duration >= longPressThreshold) {
              gestures.push({
                type: 'longpress',
                x: touch.clientX,
                y: touch.clientY,
                duration
              })
            } else if (distance > swipeThreshold) {
              const velocity = distance / duration
              if (velocity > swipeVelocityThreshold) {
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
                let direction: string

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  direction = deltaX > 0 ? 'right' : 'left'
                } else {
                  direction = deltaY > 0 ? 'down' : 'up'
                }

                gestures.push({
                  type: 'swipe',
                  direction,
                  angle,
                  distance,
                  velocity,
                  deltaX,
                  deltaY
                })
              }
            }

            activeTouches.delete(touch.identifier)
          }
        }
      }

      return gestures
    },

    reset: () => {
      activeTouches.clear()
    },

    getActiveTouches: () => Array.from(activeTouches.values())
  }
}

/**
 * Create touch interaction manager for pie chart
 */
export const createTouchInteractionManager = (
  slices: PieSlice[],
  sliceElements: SVGElement[],
  config: {
    enableTap?: boolean
    enableLongPress?: boolean
    enableSwipe?: boolean
    enablePinch?: boolean
    onTap?: (slice: PieSlice) => void
    onLongPress?: (slice: PieSlice) => void
    onSwipe?: (slice: PieSlice, direction: string) => void
    onPinch?: (scale: number) => void
  } = {}
) => {
  const {
    enableTap = true,
    enableLongPress = true,
    enableSwipe = false,
    enablePinch = false,
    onTap,
    onLongPress,
    onSwipe,
    onPinch
  } = config

  const gestureRecognizer = createTouchGestureRecognizer()
  const boundHandlers = new Map<SVGElement, any>()

  const bindTouchEvents = () => {
    slices.forEach((slice, index) => {
      const element = sliceElements[index]
      if (!element) return

      const handlers = {
        touchstart: (event: TouchEvent) => {
          handleTouchStart(slice, element, event, {
            enableLongPress,
            onTouchStart: (s, touchData) => {
              // Store for later use
              element.setAttribute('data-current-slice', JSON.stringify(s))
            }
          })
        },

        touchmove: (event: TouchEvent) => {
          handleTouchMove(slice, element, event)
        },

        touchend: (event: TouchEvent) => {
          handleTouchEnd(slice, element, event, {
            onTap: enableTap ? (s) => onTap?.(s) : undefined,
            onLongPress: enableLongPress ? (s) => onLongPress?.(s) : undefined,
            onSwipe: enableSwipe ? (s, swipeData) => onSwipe?.(s, swipeData.direction) : undefined
          })
        },

        touchcancel: () => {
          // Clean up stored data
          element.removeAttribute('data-touch-start')
          element.removeAttribute('data-touch-moved')
          element.removeAttribute('data-swipe-data')
          element.removeAttribute('data-current-slice')
          
          const longPressTimer = element.getAttribute('data-long-press-timer')
          if (longPressTimer) {
            clearTimeout(parseInt(longPressTimer))
            element.removeAttribute('data-long-press-timer')
          }
        }
      }

      // Bind events
      Object.entries(handlers).forEach(([eventType, handler]) => {
        element.addEventListener(eventType as any, handler)
      })

      boundHandlers.set(element, handlers)
    })
  }

  const unbindTouchEvents = () => {
    boundHandlers.forEach((handlers, element) => {
      Object.entries(handlers).forEach(([eventType, handler]) => {
        element.removeEventListener(eventType as any, handler)
      })
    })
    boundHandlers.clear()
  }

  // Initialize
  bindTouchEvents()

  return {
    rebind: (newSlices: PieSlice[], newElements: SVGElement[]) => {
      unbindTouchEvents()
      slices.length = 0
      slices.push(...newSlices)
      sliceElements.length = 0
      sliceElements.push(...newElements)
      bindTouchEvents()
    },

    destroy: () => {
      unbindTouchEvents()
      gestureRecognizer.reset()
    },

    getGestureRecognizer: () => gestureRecognizer
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    createTouchGestureRecognizer,
    createTouchInteractionManager
  }
}