export interface MemoryStats {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const cleanupChartResources = (chartId: string) => {
  // Remove any cached data for the chart
  const cacheKey = `chart_${chartId}`
  
  // Clear localStorage cache if exists
  if (typeof window !== 'undefined') {
    localStorage.removeItem(cacheKey)
    sessionStorage.removeItem(cacheKey)
  }
  
  // Force garbage collection in development
  if (process.env.NODE_ENV === 'development' && (window as any).gc) {
    (window as any).gc()
  }
}

export const getMemoryUsage = (): MemoryStats | null => {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null
  }
  
  const memory = (performance as any).memory
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit
  }
}

export const isMemoryPressureHigh = (threshold: number = 0.85): boolean => {
  const memory = getMemoryUsage()
  if (!memory) return false
  
  const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit
  return usageRatio > threshold
}

export const createMemoryMonitor = (
  callback: (stats: MemoryStats) => void,
  interval: number = 5000
) => {
  let intervalId: NodeJS.Timeout | null = null
  
  const start = () => {
    if (intervalId) return
    
    intervalId = setInterval(() => {
      const stats = getMemoryUsage()
      if (stats) {
        callback(stats)
      }
    }, interval)
  }
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
  
  return { start, stop }
}

export const optimizeMemoryUsage = () => {
  // Clear any temporary caches
  if (typeof window !== 'undefined') {
    // Clear temporary data from sessionStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('temp_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  }
  
  // Suggest garbage collection if available
  if ((window as any).gc) {
    (window as any).gc()
  }
}

export const createMemoryBudgetMonitor = (budgetMB: number = 50) => {
  const budgetBytes = budgetMB * 1024 * 1024
  
  return {
    checkBudget: (): { withinBudget: boolean; usage: number; budget: number } => {
      const memory = getMemoryUsage()
      const usage = memory?.usedJSHeapSize || 0
      
      return {
        withinBudget: usage <= budgetBytes,
        usage: usage / (1024 * 1024), // Convert to MB
        budget: budgetMB
      }
    },
    
    enforceCleanup: () => {
      const { withinBudget } = module.exports.checkBudget()
      if (!withinBudget) {
        optimizeMemoryUsage()
      }
    }
  }
}

export default cleanupChartResources