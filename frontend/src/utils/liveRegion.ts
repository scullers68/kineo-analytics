export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off'

export interface LiveRegionOptions {
  politeness?: LiveRegionPoliteness
  atomic?: boolean
  relevant?: string
  busy?: boolean
}

export const createLiveRegion = (
  message: string,
  options: LiveRegionOptions = {}
): HTMLElement => {
  const {
    politeness = 'polite',
    atomic = true,
    relevant = 'additions text',
    busy = false
  } = options

  const liveRegion = document.createElement('div')
  
  // Set ARIA live region attributes
  liveRegion.setAttribute('aria-live', politeness)
  liveRegion.setAttribute('aria-atomic', atomic.toString())
  liveRegion.setAttribute('aria-relevant', relevant)
  liveRegion.setAttribute('aria-busy', busy.toString())
  
  // Hide visually but keep accessible to screen readers
  liveRegion.className = 'sr-only'
  liveRegion.style.cssText = `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  
  liveRegion.textContent = message
  
  return liveRegion
}

export const announceLive = (
  message: string,
  politeness: LiveRegionPoliteness = 'polite',
  duration: number = 1000
): void => {
  const liveRegion = createLiveRegion(message, { politeness })
  
  document.body.appendChild(liveRegion)
  
  // Clean up after announcement
  setTimeout(() => {
    if (document.body.contains(liveRegion)) {
      document.body.removeChild(liveRegion)
    }
  }, duration)
}

export const updateLiveRegion = (
  element: HTMLElement,
  message: string,
  busy: boolean = false
): void => {
  element.setAttribute('aria-busy', busy.toString())
  
  if (busy) {
    setTimeout(() => {
      element.textContent = message
      element.setAttribute('aria-busy', 'false')
    }, 100)
  } else {
    element.textContent = message
  }
}

export default createLiveRegion