import { useState, useEffect, useRef, useCallback } from 'react'
import { PerformanceConfig, PerformanceMetrics, ChartPerformanceConfig, DEFAULT_CHART_PERFORMANCE } from '../types/performance'

export const useChartPerformance = (
  config: PerformanceConfig = {
    enableVirtualization: true,
    maxDataPoints: 1000,
    enableWebWorkers: false,
    cacheSize: 100,
    renderThrottle: 16
  },
  chartConfig: ChartPerformanceConfig = DEFAULT_CHART_PERFORMANCE
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    dataPointsRendered: 0,
    isOptimized: true
  })

  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const renderTimesRef = useRef<number[]>([])
  const isMonitoringRef = useRef<boolean>(false)

  const startPerformanceMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return

    isMonitoringRef.current = true
    lastTimeRef.current = performance.now()

    const monitor = (currentTime: number) => {
      if (!isMonitoringRef.current) return

      frameRef.current++
      const deltaTime = currentTime - lastTimeRef.current

      if (deltaTime >= 1000) {
        const fps = Math.round((frameRef.current * 1000) / deltaTime)
        const avgRenderTime = renderTimesRef.current.length > 0
          ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
          : 0

        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime: avgRenderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          isOptimized: fps >= chartConfig.targetFPS && avgRenderTime <= chartConfig.maxRenderTime
        }))

        frameRef.current = 0
        lastTimeRef.current = currentTime
        renderTimesRef.current = []
      }

      requestAnimationFrame(monitor)
    }

    requestAnimationFrame(monitor)
  }, [chartConfig])

  const stopPerformanceMonitoring = useCallback(() => {
    isMonitoringRef.current = false
  }, [])

  const trackRender = useCallback((renderTime: number, dataPointCount: number) => {
    renderTimesRef.current.push(renderTime)
    setMetrics(prev => ({
      ...prev,
      dataPointsRendered: dataPointCount
    }))

    // Log performance warnings in development
    if (process.env.NODE_ENV === 'development' && chartConfig.debugMode) {
      if (renderTime > chartConfig.maxRenderTime * 2) {
        console.warn(`Slow render detected: ${renderTime}ms for ${dataPointCount} data points`)
      }
    }
  }, [chartConfig])

  const optimizeDataForRendering = useCallback((data: any[]) => {
    if (data.length <= config.maxDataPoints) {
      return data
    }

    // Simple sampling for performance
    const step = Math.ceil(data.length / config.maxDataPoints)
    return data.filter((_, index) => index % step === 0)
  }, [config.maxDataPoints])

  useEffect(() => {
    return () => {
      stopPerformanceMonitoring()
    }
  }, [stopPerformanceMonitoring])

  return {
    metrics,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    trackRender,
    optimizeDataForRendering,
    isOptimized: metrics.isOptimized
  }
}

export default useChartPerformance