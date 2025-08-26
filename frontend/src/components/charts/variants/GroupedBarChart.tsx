import React from 'react'
import { BarChart } from '../BarChart'
import { ChartDataPoint } from '../../../types/store'
import { ChartSeries, GroupedChartConfig } from '../../../types/chart-variants'
import { DataSeriesManager } from '../../../utils/data-series-manager'
import { applyGroupColors } from '../../../utils/variant-colors'

export interface GroupedBarChartProps {
  data: ChartDataPoint[] | ChartSeries[]
  config?: GroupedChartConfig
  width?: number
  height?: number
  orientation?: 'horizontal' | 'vertical'
  onBarClick?: (data: ChartDataPoint, seriesId?: string) => void
  onBarHover?: (data: ChartDataPoint | null, seriesId?: string) => void
  className?: string
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
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
        return applyGroupColors(data as ChartSeries[], config.colorScheme)
      }
      
      // Convert ChartDataPoint[] to ChartSeries[]
      const manager = DataSeriesManager.fromFlatData(data as ChartDataPoint[])
      return applyGroupColors(manager.getAllSeries(), config.colorScheme)
    }
    
    return []
  }, [data, config.colorScheme])

  // Flatten series data back to ChartDataPoint[] for the main component
  const flattenedData = React.useMemo(() => {
    return seriesData.flatMap(series => 
      series.data.map(point => ({
        ...point,
        metadata: {
          ...point.metadata,
          series: series.id,
          seriesLabel: series.label,
          color: series.color
        }
      }))
    )
  }, [seriesData])

  // Convert GroupedChartConfig to BarChartConfig
  const barChartConfig = {
    barPadding: 0.1,
    groupPadding: config.groupPadding || 0.05,
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

  return (
    <div className={`grouped-bar-chart ${className}`}>
      {/* Legend */}
      {config.showLegend !== false && seriesData.length > 1 && (
        <div className={`chart-legend chart-legend-${config.legendPosition || 'top'} mb-2`}>
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

      {/* Main chart */}
      <BarChart
        data={flattenedData}
        config={barChartConfig}
        variant="grouped"
        orientation={orientation}
        width={width}
        height={height}
        onBarClick={handleBarClick}
        onBarHover={handleBarHover}
        className="grouped-bar-chart-content"
      />
    </div>
  )
}

export default GroupedBarChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GroupedBarChart, default: GroupedBarChart }
}