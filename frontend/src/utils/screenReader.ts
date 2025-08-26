export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  // Create a live region element for screen reader announcements
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('aria-live', priority)
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.setAttribute('class', 'sr-only')
  liveRegion.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `
  
  document.body.appendChild(liveRegion)
  
  // Add the message
  liveRegion.textContent = message
  
  // Remove after announcement (cleanup)
  setTimeout(() => {
    document.body.removeChild(liveRegion)
  }, 1000)
}

export const createScreenReaderSummary = (data: any[]) => {
  const count = data.length
  const dataType = typeof data[0] === 'object' ? 'data points' : 'values'
  
  return `Chart contains ${count} ${dataType}. Use arrow keys to navigate and Enter to select.`
}

export const formatDataForScreenReader = (dataPoint: any, index: number, total: number) => {
  if (typeof dataPoint === 'object') {
    const value = dataPoint.y || dataPoint.value || 'unknown'
    const label = dataPoint.label || dataPoint.x || `Point ${index + 1}`
    return `${label}: ${value}. Item ${index + 1} of ${total}.`
  }
  
  return `Value: ${dataPoint}. Item ${index + 1} of ${total}.`
}

export default announceToScreenReader