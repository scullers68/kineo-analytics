import React from 'react'
import { BarChart } from '../BarChart'
import { ChartDataPoint } from '../../../types/store'
import { ChartSeries, StackedChartConfig } from '../../../types/chart-variants'
import { DataSeriesManager } from '../../../utils/data-series-manager'
import { applyGroupColors } from '../../../utils/variant-colors'
import { getStackedData } from '../../../utils/stacked-chart'

export interface StackedBarChartProps {
  data: ChartDataPoint[] | ChartSeries[]
  config?: StackedChartConfig
  width?: number
  height?: number
  orientation?: 'horizontal' | 'vertical'
  onBarClick?: (data: ChartDataPoint, seriesId?: string) => void
  onBarHover?: (data: ChartDataPoint | null, seriesId?: string) => void
  className?: string
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  config = {},
  width = 400,
  height = 300,
  orientation = 'horizontal',
  onBarClick,
  onBarHover,
  className = ''
}) => {
  // Process data into series format
  const seriesData = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0]
      
      // Check if data is already in ChartSeries format
      if ('id' in firstItem && 'label' in firstItem && 'data' in firstItem) {
        return applyGroupColors(data as ChartSeries[], undefined, 'light')
      }
      
      // Convert ChartDataPoint[] to ChartSeries[]
      const manager = DataSeriesManager.fromFlatData(data as ChartDataPoint[])
      return applyGroupColors(manager.getAllSeries(), undefined, 'light')
    }
    
    return []
  }, [data])

  // Get stacked data with configured order/offset
  const stackedResult = React.useMemo(() => {
    if (!seriesData.length) return null
    
    return getStackedData(
      seriesData,
      config.stackOrder,
      config.stackOffset
    )
  }, [seriesData, config.stackOrder, config.stackOffset])

  // Calculate totals for each x value (for total labels)
  const totals = React.useMemo(() => {
    if (!stackedResult) return {}
    
    const totalsMap: Record<string, number> = {}
    stackedResult.xValues.forEach(xValue => {
      const total = seriesData.reduce((sum, series) => {
        const dataPoint = series.data.find(d => String(d.x) === xValue)
        return sum + (dataPoint ? dataPoint.y : 0)
      }, 0)
      totalsMap[xValue] = total
    })
    
    return totalsMap
  }, [stackedResult, seriesData])

  // Flatten and transform data for the main component with stacking information
  const flattenedData = React.useMemo(() => {
    if (!stackedResult) return []
    
    const stackedPoints: ChartDataPoint[] = []
    
    stackedResult.stackedData.forEach(layer => {
      layer.forEach(stackPoint => {
        const originalDataPoint = seriesData
          .find(s => s.id === layer.key)
          ?.data.find(d => String(d.x) === String(stackPoint.data.x))
        
        if (originalDataPoint) {
          stackedPoints.push({
            ...originalDataPoint,
            y: stackPoint[1] - stackPoint[0], // Use the segment height, not cumulative
            metadata: {
              ...originalDataPoint.metadata,
              series: layer.key,
              seriesLabel: seriesData.find(s => s.id === layer.key)?.label || layer.key,
              color: seriesData.find(s => s.id === layer.key)?.color,
              stackBottom: stackPoint[0],
              stackTop: stackPoint[1],
              stackHeight: stackPoint[1] - stackPoint[0],
              total: totals[String(stackPoint.data.x)]
            }
          })
        }
      })
    })
    
    return stackedPoints
  }, [stackedResult, seriesData, totals])

  // Convert StackedChartConfig to BarChartConfig
  const barChartConfig = {
    barPadding: 0.1,
    groupPadding: 0.05,
    showLabels: true,
    labelPosition: 'outside' as const,
    sortBy: 'custom' as const,
    sortOrder: 'asc' as const,
    theme: config.theme,
    animation: config.animation,
    accessibility: config.accessibility
  }

  // Enhanced click handler with series information
  const handleBarClick = React.useCallback((dataPoint: ChartDataPoint) => {
    const seriesId = dataPoint.metadata?.series
    onBarClick?.(dataPoint, seriesId)
  }, [onBarClick])

  // Enhanced hover handler with series information
  const handleBarHover = React.useCallback((dataPoint: ChartDataPoint | null) => {
    const seriesId = dataPoint?.metadata?.series
    onBarHover?.(dataPoint, seriesId)
  }, [onBarHover])

  if (!stackedResult) {
    return (
      <div className={`stacked-bar-chart ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No data to display</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`stacked-bar-chart ${className}`}>
      {/* Legend */}
      {seriesData.length > 1 && (
        <div className="chart-legend chart-legend-top mb-2">
          <div className="flex flex-wrap gap-4 justify-center">
            {seriesData.map(series => (
              <div key={series.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: series.color }}
                  aria-hidden="true"
                />
                <span className="text-sm">{series.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals display */}
      {config.showTotals && (
        <div className="chart-totals mb-2">
          <div className="text-sm text-gray-600">
            {stackedResult.xValues.map(xValue => (
              <span key={xValue} className="inline-block mr-4">
                {xValue}: {totals[xValue].toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main chart */}
      <BarChart
        data={flattenedData}
        config={barChartConfig}
        variant="stacked"
        orientation={orientation}
        width={width}
        height={height}
        onBarClick={handleBarClick}
        onBarHover={handleBarHover}
        className="stacked-bar-chart-content"
      />
    </div>
  )
}

export default StackedBarChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StackedBarChart, default: StackedBarChart }
}