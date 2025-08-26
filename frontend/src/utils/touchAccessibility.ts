export interface TouchTargetOptions {
  minSize: number
  padding: number
  spacing: number
}

export const DEFAULT_TOUCH_TARGET_SIZE = 44 // 44px minimum touch target size per WCAG

export const ensureTouchTargetSize = (
  element: HTMLElement,
  options: TouchTargetOptions = {
    minSize: DEFAULT_TOUCH_TARGET_SIZE,
    padding: 8,
    spacing: 8
  }
): void => {
  const { minSize, padding } = options
  const rect = element.getBoundingClientRect()
  
  // Ensure minimum touch target size
  if (rect.width < minSize) {
    element.style.minWidth = `${minSize}px`
  }
  
  if (rect.height < minSize) {
    element.style.minHeight = `${minSize}px`
  }
  
  // Add padding for easier interaction
  element.style.padding = `${padding}px`
  
  // Ensure element is focusable for keyboard navigation
  if (element.tabIndex === -1 && element.tagName !== 'DIV') {
    element.tabIndex = 0
  }
}

export const makeTouchFriendly = (element: HTMLElement): void => {
  ensureTouchTargetSize(element)
  
  // Add touch event support
  element.style.touchAction = 'manipulation'
  element.style.userSelect = 'none'
  
  // Add visual feedback
  element.addEventListener('touchstart', () => {
    element.style.opacity = '0.7'
  })
  
  element.addEventListener('touchend', () => {
    element.style.opacity = '1'
  })
  
  element.addEventListener('touchcancel', () => {
    element.style.opacity = '1'
  })
}

export const checkTouchTargetCompliance = (elements: HTMLElement[]): boolean => {
  return elements.every(element => {
    const rect = element.getBoundingClientRect()
    return rect.width >= DEFAULT_TOUCH_TARGET_SIZE && rect.height >= DEFAULT_TOUCH_TARGET_SIZE
  })
}

export default ensureTouchTargetSize