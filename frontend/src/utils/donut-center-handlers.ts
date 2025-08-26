import { DonutCenterContent } from '../types/donut-chart'
import { PieSlice } from '../types/pie-chart'

/**
 * Update center content with animation
 */
export const updateCenterContent = (
  centerElement: SVGGElement | HTMLElement,
  newContent: DonutCenterContent,
  config: {
    animationDuration?: number
    animationType?: 'fade' | 'scale' | 'slide' | 'none'
    easing?: string
  } = {}
) => {
  const {
    animationDuration = 300,
    animationType = 'fade',
    easing = 'ease-in-out'
  } = config

  const updateContent = () => {
    // Update title
    const titleElement = centerElement.querySelector('.center-title')
    if (titleElement && newContent.title) {
      titleElement.textContent = newContent.title
    }

    // Update value
    const valueElement = centerElement.querySelector('.center-value')
    if (valueElement && newContent.value !== undefined) {
      valueElement.textContent = String(newContent.value)
    }

    // Update subtitle
    const subtitleElement = centerElement.querySelector('.center-subtitle')
    if (subtitleElement && newContent.subtitle) {
      subtitleElement.textContent = newContent.subtitle
    }

    // Update icon
    const iconElement = centerElement.querySelector('.center-icon')
    if (iconElement && newContent.icon) {
      if (typeof newContent.icon === 'string') {
        iconElement.textContent = newContent.icon
      }
    }

    // Update trend
    const trendElement = centerElement.querySelector('.trend-indicator')
    if (trendElement && newContent.trend) {
      const { direction, value, label = '' } = newContent.trend
      const trendColor = direction === 'up' ? '#28a745' : 
                        direction === 'down' ? '#dc3545' : '#6c757d'
      
      const arrowElement = trendElement.querySelector('.trend-arrow')
      const valueElement = trendElement.querySelector('.trend-value')
      
      if (arrowElement) {
        arrowElement.textContent = direction === 'up' ? '▲' : 
                                  direction === 'down' ? '▼' : '●'
        ;(arrowElement as HTMLElement).style.color = trendColor
      }
      
      if (valueElement) {
        valueElement.textContent = `${value}${label}`
        ;(valueElement as HTMLElement).style.color = trendColor
      }
    }
  }

  if (animationType === 'none') {
    updateContent()
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const element = centerElement as HTMLElement
    
    // Apply exit animation
    switch (animationType) {
      case 'fade':
        element.style.transition = `opacity ${animationDuration / 2}ms ${easing}`
        element.style.opacity = '0'
        break
        
      case 'scale':
        element.style.transition = `transform ${animationDuration / 2}ms ${easing}`
        element.style.transform = 'scale(0.8)'
        element.style.opacity = '0.5'
        break
        
      case 'slide':
        element.style.transition = `transform ${animationDuration / 2}ms ${easing}`
        element.style.transform = 'translateY(-10px)'
        element.style.opacity = '0'
        break
    }

    setTimeout(() => {
      // Update content
      updateContent()

      // Apply enter animation
      switch (animationType) {
        case 'fade':
          element.style.opacity = '1'
          break
          
        case 'scale':
          element.style.transform = 'scale(1)'
          element.style.opacity = '1'
          break
          
        case 'slide':
          element.style.transform = 'translateY(0)'
          element.style.opacity = '1'
          break
      }

      setTimeout(() => {
        // Clean up transition styles
        element.style.transition = ''
        resolve()
      }, animationDuration / 2)

    }, animationDuration / 2)
  })
}

/**
 * Format center content data for display
 */
export const formatCenterData = (
  slice: PieSlice | null,
  totalValue: number,
  config: {
    showTotal?: boolean
    showAverage?: boolean
    showPercentage?: boolean
    valueFormatter?: (value: number) => string
    percentageFormatter?: (percentage: number) => string
    emptyStateContent?: DonutCenterContent
  } = {}
): DonutCenterContent => {
  const {
    showTotal = false,
    showAverage = false,
    showPercentage = true,
    valueFormatter = (v) => v.toLocaleString(),
    percentageFormatter = (p) => `${p.toFixed(1)}%`,
    emptyStateContent = {
      title: 'No Selection',
      subtitle: 'Hover or click a slice',
      value: ''
    }
  } = config

  if (!slice) {
    if (showTotal && totalValue > 0) {
      return {
        title: 'Total',
        value: valueFormatter(totalValue),
        subtitle: 'All slices'
      }
    }
    return emptyStateContent
  }

  const content: DonutCenterContent = {
    title: slice.data.label,
    value: valueFormatter(slice.data.value)
  }

  if (showPercentage && slice.data.percentage !== undefined) {
    content.subtitle = percentageFormatter(slice.data.percentage)
  }

  // Add trend information if available
  if (slice.data.metadata?.trend) {
    content.trend = {
      direction: slice.data.metadata.trend.direction,
      value: slice.data.metadata.trend.value,
      label: slice.data.metadata.trend.label
    }
  }

  // Add category information
  if (slice.data.category) {
    content.footer = slice.data.category
  }

  return content
}

/**
 * Create center content manager for dynamic updates
 */
export const createCenterContentManager = (
  centerElement: SVGGElement | HTMLElement,
  config: {
    defaultContent?: DonutCenterContent
    animationDuration?: number
    updateOnHover?: boolean
    updateOnClick?: boolean
    resetDelay?: number
  } = {}
) => {
  const {
    defaultContent = { title: 'Total', value: '', subtitle: '' },
    animationDuration = 300,
    updateOnHover = true,
    updateOnClick = true,
    resetDelay = 2000
  } = config

  let currentContent = { ...defaultContent }
  let resetTimer: NodeJS.Timeout | null = null

  const scheduleReset = () => {
    if (resetTimer) {
      clearTimeout(resetTimer)
    }
    
    resetTimer = setTimeout(() => {
      updateCenterContent(centerElement, defaultContent, { animationDuration })
      currentContent = { ...defaultContent }
    }, resetDelay)
  }

  return {
    update: (newContent: Partial<DonutCenterContent>, temporary = false) => {
      const fullContent = { ...currentContent, ...newContent }
      
      updateCenterContent(centerElement, fullContent, { animationDuration })
      
      if (!temporary) {
        currentContent = fullContent
      }

      if (temporary) {
        scheduleReset()
      }

      return fullContent
    },

    reset: () => {
      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
      }
      
      updateCenterContent(centerElement, defaultContent, { animationDuration })
      currentContent = { ...defaultContent }
    },

    setDefault: (newDefault: DonutCenterContent) => {
      Object.assign(defaultContent, newDefault)
      if (JSON.stringify(currentContent) === JSON.stringify(defaultContent)) {
        this.reset()
      }
    },

    getCurrent: () => ({ ...currentContent }),

    getDefault: () => ({ ...defaultContent }),

    onSliceHover: (slice: PieSlice | null, totalValue: number) => {
      if (!updateOnHover) return

      if (slice) {
        const hoverContent = formatCenterData(slice, totalValue, {
          showPercentage: true
        })
        this.update(hoverContent, true)
      } else {
        this.reset()
      }
    },

    onSliceClick: (slice: PieSlice, totalValue: number) => {
      if (!updateOnClick) return

      const clickContent = formatCenterData(slice, totalValue, {
        showPercentage: true
      })
      this.update(clickContent, false)
    },

    destroy: () => {
      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
      }
    }
  }
}

/**
 * Create animated counter for center values
 */
export const createAnimatedCounter = (
  element: HTMLElement | SVGTextElement,
  config: {
    duration?: number
    easing?: (t: number) => number
    formatter?: (value: number) => string
  } = {}
) => {
  const {
    duration = 1000,
    easing = (t: number) => t * t * (3 - 2 * t), // smoothstep
    formatter = (v) => Math.round(v).toLocaleString()
  } = config

  let animationId: number | null = null
  let currentValue = 0

  return {
    animateTo: (targetValue: number, fromValue?: number) => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      const startValue = fromValue !== undefined ? fromValue : currentValue
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)

        currentValue = startValue + (targetValue - startValue) * easedProgress
        element.textContent = formatter(currentValue)

        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        } else {
          currentValue = targetValue
          element.textContent = formatter(targetValue)
          animationId = null
        }
      }

      animationId = requestAnimationFrame(animate)
    },

    setValue: (value: number, animate = true) => {
      if (animate) {
        this.animateTo(value)
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
        currentValue = value
        element.textContent = formatter(value)
      }
    },

    getCurrentValue: () => currentValue,

    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    }
  }
}

/**
 * Create center content with rich formatting
 */
export const createRichCenterContent = (
  content: DonutCenterContent,
  config: {
    enableHTML?: boolean
    maxTitleLength?: number
    maxSubtitleLength?: number
    truncateWithEllipsis?: boolean
  } = {}
) => {
  const {
    enableHTML = false,
    maxTitleLength = 20,
    maxSubtitleLength = 30,
    truncateWithEllipsis = true
  } = config

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return truncateWithEllipsis 
      ? text.substring(0, maxLength - 3) + '...'
      : text.substring(0, maxLength)
  }

  const formattedContent: DonutCenterContent = {
    ...content,
    title: truncateText(content.title, maxTitleLength)
  }

  if (content.subtitle) {
    formattedContent.subtitle = truncateText(content.subtitle, maxSubtitleLength)
  }

  // Format value with appropriate units
  if (typeof content.value === 'number') {
    if (content.value >= 1000000) {
      formattedContent.value = `${(content.value / 1000000).toFixed(1)}M`
    } else if (content.value >= 1000) {
      formattedContent.value = `${(content.value / 1000).toFixed(1)}K`
    } else {
      formattedContent.value = content.value.toLocaleString()
    }
  }

  return formattedContent
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateCenterContent,
    formatCenterData,
    createCenterContentManager,
    createAnimatedCounter,
    createRichCenterContent
  }
}