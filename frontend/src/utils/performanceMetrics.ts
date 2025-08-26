export interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: 'render' | 'data-processing' | 'animation' | 'user-interaction'
  metadata?: Record<string, any>
}

export interface RenderMetrics {
  renderCount: number
  averageRenderTime: number
  minRenderTime: number
  maxRenderTime: number
  totalRenderTime: number
}

export const trackRenderPerformance = (chartId: string, renderFn: () => void) => {
  const startTime = performance.now()
  
  try {
    renderFn()
  } finally {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    const entry: PerformanceEntry = {
      name: `chart-render-${chartId}`,
      startTime,
      duration,
      type: 'render',
      metadata: { chartId }
    }
    
    // Store in performance buffer
    storePerformanceEntry(entry)
    
    // Log warning for slow renders
    if (duration > 50) {
      console.warn(`Slow render detected for chart ${chartId}: ${duration}ms`)
    }
    
    return duration
  }
}

export const trackDataProcessing = (operation: string, processFn: () => any) => {
  const startTime = performance.now()
  
  try {
    return processFn()
  } finally {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    storePerformanceEntry({
      name: `data-processing-${operation}`,
      startTime,
      duration,
      type: 'data-processing',
      metadata: { operation }
    })
  }
}

export const trackUserInteraction = (action: string, interactionFn: () => void) => {
  const startTime = performance.now()
  
  try {
    interactionFn()
  } finally {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    storePerformanceEntry({
      name: `interaction-${action}`,
      startTime,
      duration,
      type: 'user-interaction',
      metadata: { action }
    })
  }
}

let performanceBuffer: PerformanceEntry[] = []
const MAX_BUFFER_SIZE = 100

const storePerformanceEntry = (entry: PerformanceEntry) => {
  performanceBuffer.push(entry)
  
  // Keep buffer size manageable
  if (performanceBuffer.length > MAX_BUFFER_SIZE) {
    performanceBuffer = performanceBuffer.slice(-MAX_BUFFER_SIZE)
  }
}

export const getRenderMetrics = (chartId?: string): RenderMetrics => {
  const renderEntries = performanceBuffer.filter(entry => 
    entry.type === 'render' && 
    (!chartId || entry.metadata?.chartId === chartId)
  )
  
  if (renderEntries.length === 0) {
    return {
      renderCount: 0,
      averageRenderTime: 0,
      minRenderTime: 0,
      maxRenderTime: 0,
      totalRenderTime: 0
    }
  }
  
  const durations = renderEntries.map(entry => entry.duration)
  const totalRenderTime = durations.reduce((sum, duration) => sum + duration, 0)
  
  return {
    renderCount: renderEntries.length,
    averageRenderTime: totalRenderTime / renderEntries.length,
    minRenderTime: Math.min(...durations),
    maxRenderTime: Math.max(...durations),
    totalRenderTime
  }
}

export const getPerformanceReport = (): {
  renders: RenderMetrics
  dataProcessing: PerformanceEntry[]
  interactions: PerformanceEntry[]
  summary: {
    totalEntries: number
    timespan: number
    averageOperationTime: number
  }
} => {
  const renders = getRenderMetrics()
  const dataProcessing = performanceBuffer.filter(entry => entry.type === 'data-processing')
  const interactions = performanceBuffer.filter(entry => entry.type === 'user-interaction')
  
  const allDurations = performanceBuffer.map(entry => entry.duration)
  const timespan = performanceBuffer.length > 0 
    ? Math.max(...performanceBuffer.map(entry => entry.startTime)) - 
      Math.min(...performanceBuffer.map(entry => entry.startTime))
    : 0
  
  return {
    renders,
    dataProcessing,
    interactions,
    summary: {
      totalEntries: performanceBuffer.length,
      timespan,
      averageOperationTime: allDurations.length > 0 
        ? allDurations.reduce((sum, duration) => sum + duration, 0) / allDurations.length
        : 0
    }
  }
}

export const clearPerformanceBuffer = () => {
  performanceBuffer = []
}

export const createPerformanceMonitor = (chartId: string) => {
  let isMonitoring = false
  const metrics = new Map<string, number>()
  
  return {
    start: () => {
      isMonitoring = true
      metrics.clear()
    },
    
    stop: () => {
      isMonitoring = false
    },
    
    trackRender: (fn: () => void) => {
      if (!isMonitoring) return fn()
      return trackRenderPerformance(chartId, fn)
    },
    
    getMetrics: () => {
      return Object.fromEntries(metrics)
    },
    
    isActive: () => isMonitoring
  }
}

export default trackRenderPerformance