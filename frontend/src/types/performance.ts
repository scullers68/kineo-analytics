export interface PerformanceConfig {
  enableVirtualization: boolean
  maxDataPoints: number
  enableWebWorkers: boolean
  cacheSize: number
  renderThrottle: number
}

export interface PerformanceMetrics {
  fps: number
  renderTime: number
  memoryUsage: number
  dataPointsRendered: number
  isOptimized: boolean
}

export interface ChartPerformanceConfig {
  targetFPS: number
  maxRenderTime: number
  memoryLimit: number
  enableProfiling: boolean
  debugMode: boolean
}

export interface RenderingStats {
  totalRenderCalls: number
  averageRenderTime: number
  slowRenderCount: number
  frameDropCount: number
  lastRenderTime: number
}

export interface DataProcessingConfig {
  chunkSize: number
  useWebWorkers: boolean
  enableCaching: boolean
  compressionEnabled: boolean
  samplingThreshold: number
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableVirtualization: true,
  maxDataPoints: 1000,
  enableWebWorkers: false,
  cacheSize: 100,
  renderThrottle: 16
}

export const DEFAULT_CHART_PERFORMANCE: ChartPerformanceConfig = {
  targetFPS: 60,
  maxRenderTime: 16.67, // 60fps = 16.67ms per frame
  memoryLimit: 50 * 1024 * 1024, // 50MB
  enableProfiling: process.env.NODE_ENV === 'development',
  debugMode: false
}

export const PERFORMANCE_BUDGETS = {
  RENDER_TIME_WARNING: 50, // ms
  RENDER_TIME_ERROR: 100, // ms
  FPS_WARNING: 30,
  FPS_ERROR: 15,
  MEMORY_WARNING: 25 * 1024 * 1024, // 25MB
  MEMORY_ERROR: 50 * 1024 * 1024 // 50MB
} as const