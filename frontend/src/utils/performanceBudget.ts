export interface PerformanceBudget {
  renderTime: {
    target: number
    warning: number
    error: number
  }
  frameRate: {
    target: number
    warning: number
    error: number
  }
  memoryUsage: {
    target: number // in MB
    warning: number
    error: number
  }
  bundleSize: {
    target: number // in KB
    warning: number
    error: number
  }
  dataProcessing: {
    target: number // per 1000 items in ms
    warning: number
    error: number
  }
}

export interface BudgetValidationResult {
  metric: string
  value: number
  budget: number
  status: 'pass' | 'warning' | 'error'
  message: string
  suggestions?: string[]
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  renderTime: {
    target: 16.67, // 60fps
    warning: 33.33, // 30fps
    error: 100 // 10fps
  },
  frameRate: {
    target: 60,
    warning: 30,
    error: 15
  },
  memoryUsage: {
    target: 25, // 25MB
    warning: 50, // 50MB
    error: 100 // 100MB
  },
  bundleSize: {
    target: 50, // 50KB
    warning: 100, // 100KB
    error: 200 // 200KB
  },
  dataProcessing: {
    target: 10, // 10ms per 1000 items
    warning: 50, // 50ms per 1000 items
    error: 200 // 200ms per 1000 items
  }
}

export const validatePerformanceBudget = (
  metrics: {
    renderTime?: number
    frameRate?: number
    memoryUsage?: number
    bundleSize?: number
    dataProcessingTime?: number
    dataPointCount?: number
  },
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
): BudgetValidationResult[] => {
  const results: BudgetValidationResult[] = []

  // Validate render time
  if (metrics.renderTime !== undefined) {
    const status = metrics.renderTime <= budget.renderTime.target ? 'pass' :
                  metrics.renderTime <= budget.renderTime.warning ? 'warning' : 'error'
    
    results.push({
      metric: 'renderTime',
      value: metrics.renderTime,
      budget: budget.renderTime.target,
      status,
      message: `Render time: ${metrics.renderTime.toFixed(2)}ms (target: ${budget.renderTime.target}ms)`,
      suggestions: status !== 'pass' ? [
        'Consider reducing the number of DOM elements',
        'Optimize D3.js selection and data binding',
        'Enable virtualization for large datasets',
        'Use requestAnimationFrame for animations'
      ] : undefined
    })
  }

  // Validate frame rate
  if (metrics.frameRate !== undefined) {
    const status = metrics.frameRate >= budget.frameRate.target ? 'pass' :
                  metrics.frameRate >= budget.frameRate.warning ? 'warning' : 'error'
    
    results.push({
      metric: 'frameRate',
      value: metrics.frameRate,
      budget: budget.frameRate.target,
      status,
      message: `Frame rate: ${metrics.frameRate}fps (target: ${budget.frameRate.target}fps)`,
      suggestions: status !== 'pass' ? [
        'Reduce the complexity of animations',
        'Use CSS transforms instead of changing layout properties',
        'Throttle render updates',
        'Consider using Web Workers for data processing'
      ] : undefined
    })
  }

  // Validate memory usage
  if (metrics.memoryUsage !== undefined) {
    const memoryMB = metrics.memoryUsage / (1024 * 1024)
    const status = memoryMB <= budget.memoryUsage.target ? 'pass' :
                  memoryMB <= budget.memoryUsage.warning ? 'warning' : 'error'
    
    results.push({
      metric: 'memoryUsage',
      value: memoryMB,
      budget: budget.memoryUsage.target,
      status,
      message: `Memory usage: ${memoryMB.toFixed(2)}MB (target: ${budget.memoryUsage.target}MB)`,
      suggestions: status !== 'pass' ? [
        'Clear unused chart instances',
        'Implement data pagination',
        'Use object pooling for frequently created objects',
        'Enable garbage collection hints'
      ] : undefined
    })
  }

  // Validate data processing time
  if (metrics.dataProcessingTime !== undefined && metrics.dataPointCount !== undefined) {
    const normalizedTime = (metrics.dataProcessingTime / metrics.dataPointCount) * 1000
    const status = normalizedTime <= budget.dataProcessing.target ? 'pass' :
                  normalizedTime <= budget.dataProcessing.warning ? 'warning' : 'error'
    
    results.push({
      metric: 'dataProcessing',
      value: normalizedTime,
      budget: budget.dataProcessing.target,
      status,
      message: `Data processing: ${normalizedTime.toFixed(2)}ms/1000 items (target: ${budget.dataProcessing.target}ms)`,
      suggestions: status !== 'pass' ? [
        'Move data processing to Web Workers',
        'Implement data streaming',
        'Use more efficient data structures',
        'Add data caching layer'
      ] : undefined
    })
  }

  return results
}

export const generateBudgetReport = (results: BudgetValidationResult[]) => {
  const passed = results.filter(r => r.status === 'pass').length
  const warnings = results.filter(r => r.status === 'warning').length
  const errors = results.filter(r => r.status === 'error').length
  const total = results.length

  return {
    summary: {
      total,
      passed,
      warnings,
      errors,
      score: Math.round((passed / total) * 100)
    },
    results,
    recommendations: results
      .filter(r => r.suggestions)
      .flatMap(r => r.suggestions!)
      .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index) // Remove duplicates
  }
}

export const createBudgetMonitor = (budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET) => {
  let isMonitoring = false
  const violations: BudgetValidationResult[] = []

  return {
    start: () => {
      isMonitoring = true
      violations.length = 0
    },

    stop: () => {
      isMonitoring = false
    },

    checkMetrics: (metrics: Parameters<typeof validatePerformanceBudget>[0]) => {
      if (!isMonitoring) return

      const results = validatePerformanceBudget(metrics, budget)
      const newViolations = results.filter(r => r.status !== 'pass')
      
      violations.push(...newViolations)

      if (newViolations.length > 0) {
        console.warn('Performance budget violations detected:', newViolations)
      }
    },

    getViolations: () => [...violations],

    generateReport: () => {
      const allResults = [...violations]
      return generateBudgetReport(allResults)
    }
  }
}

export default validatePerformanceBudget