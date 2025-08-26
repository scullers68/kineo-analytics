import React, { useMemo } from 'react'
import { useChartPerformance } from '../../hooks/useChartPerformance'
import { PerformanceConfig, ChartDataset } from '../../types/store'

interface PerformantChartProps {
  data: ChartDataset[]
  performance?: PerformanceConfig
  children?: React.ReactNode
  className?: string
}

export const PerformantChart: React.FC<PerformantChartProps> = ({
  data,
  performance = {
    enableVirtualization: true,
    maxDataPoints: 1000,
    enableWebWorkers: false,
    cacheSize: 100,
    renderThrottle: 16
  },
  children,
  className = ''
}) => {
  const { startPerformanceMonitoring, metrics } = useChartPerformance(performance)

  // Optimize data based on performance config
  const optimizedData = useMemo(() => {
    if (!data.length) return data

    const flatData = data.flatMap(dataset => dataset.data)
    
    if (flatData.length <= performance.maxDataPoints) {
      return data
    }

    // Simple data reduction strategy
    const reduceRatio = performance.maxDataPoints / flatData.length
    
    return data.map(dataset => ({
      ...dataset,
      data: dataset.data.filter((_, index) => 
        index % Math.ceil(1 / reduceRatio) === 0
      )
    }))
  }, [data, performance.maxDataPoints])

  React.useEffect(() => {
    startPerformanceMonitoring()
  }, [startPerformanceMonitoring])

  return (
    <div 
      className={`performant-chart ${className}`}
      data-performance-enabled={performance.enableVirtualization}
    >
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { 
              data: optimizedData,
              performance: metrics
            } as any)
          : child
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-debug text-xs text-gray-500">
          FPS: {metrics.fps} | Render: {metrics.renderTime}ms
        </div>
      )}
    </div>
  )
}

export default PerformantChart