import React, { useState, useCallback } from 'react'
import { AreaChart } from './AreaChart'
import { LineChart } from './LineChart'
import { useBrushSelection } from '../../hooks/useBrushSelection'
import { TimeSeriesData } from '../../types/time-series'
import { AreaChartConfig } from '../../types/area-chart'
import { LineChartConfig } from '../../types/line-chart'
import * as d3 from 'd3'

export interface BrushChartProps {
  data: TimeSeriesData[]
  config?: AreaChartConfig | LineChartConfig
  chartType?: 'area' | 'line'
  variant?: string
  width?: number
  height?: number
  brushHeight?: number
  onSelectionChange?: (domain: [Date, Date] | null) => void
  onPointClick?: (point: any, series: TimeSeriesData) => void
  onPointHover?: (point: any, series?: TimeSeriesData) => void
  className?: string
}

export const BrushChart: React.FC<BrushChartProps> = ({
  data,
  config = {},
  chartType = 'area',
  variant = 'simple',
  width = 800,
  height = 400,
  brushHeight = 60,
  onSelectionChange,
  onPointClick,
  onPointHover,
  className = ''
}) => {
  const [selectedDomain, setSelectedDomain] = useState<[Date, Date] | null>(null)
  
  // Chart dimensions
  const margins = { top: 20, right: 30, bottom: 60, left: 60 }
  const mainChartHeight = height - brushHeight - 40 // Leave space for brush
  const brushMargins = { top: 10, right: 30, bottom: 20, left: 60 }

  // Create time scale for brush coordination
  const timeScale = React.useMemo(() => {
    if (!data.length) return null

    // Calculate time domain
    let minDate: Date | null = null
    let maxDate: Date | null = null

    data.forEach(series => {
      series.points.forEach(point => {
        if (!minDate || point.date < minDate) minDate = point.date
        if (!maxDate || point.date > maxDate) maxDate = point.date
      })
    })

    if (!minDate || !maxDate) return null

    const chartWidth = width - margins.left - margins.right
    return d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, chartWidth])
  }, [data, width, margins])

  // Brush selection handlers
  const handleBrushEnd = useCallback((selection: [number, number] | null) => {
    if (!selection || !timeScale) {
      setSelectedDomain(null)
      onSelectionChange?.(null)
      return
    }

    const domain = [
      timeScale.invert(selection[0]),
      timeScale.invert(selection[1])
    ] as [Date, Date]
    
    setSelectedDomain(domain)
    onSelectionChange?.(domain)
  }, [timeScale, onSelectionChange])

  // Brush selection hook
  const {
    brushRef,
    state: brushState,
    clearSelection,
    chartWidth
  } = useBrushSelection({
    width,
    height: brushHeight,
    margins: brushMargins,
    onBrushEnd: handleBrushEnd,
    brushHeight,
    enabled: true
  })

  // Filter data based on selection
  const filteredData = React.useMemo(() => {
    if (!selectedDomain) return data

    return data.map(series => ({
      ...series,
      points: series.points.filter(point => 
        point.date >= selectedDomain[0] && point.date <= selectedDomain[1]
      )
    }))
  }, [data, selectedDomain])

  // Create brush overview data (simplified)
  const overviewData = React.useMemo(() => {
    return data.map(series => ({
      ...series,
      points: series.points.filter((_, index) => index % Math.max(1, Math.floor(series.points.length / 100)) === 0)
    }))
  }, [data])

  const resetZoom = useCallback(() => {
    clearSelection()
    setSelectedDomain(null)
    onSelectionChange?.(null)
  }, [clearSelection, onSelectionChange])

  return (
    <div className={`brush-chart-container ${className}`}>
      {/* Main chart */}
      <div className="main-chart" style={{ marginBottom: '20px' }}>
        {chartType === 'area' ? (
          <AreaChart
            data={filteredData}
            config={config as AreaChartConfig}
            variant={variant}
            width={width}
            height={mainChartHeight}
            onPointClick={onPointClick}
            onPointHover={onPointHover}
            className="brush-main-chart"
          />
        ) : (
          <LineChart
            data={filteredData}
            config={config as LineChartConfig}
            variant={variant}
            width={width}
            height={mainChartHeight}
            onPointClick={onPointClick}
            onPointHover={onPointHover}
            className="brush-main-chart"
          />
        )}
      </div>

      {/* Brush overview */}
      <div className="brush-overview-container">
        <div className="brush-overview" style={{ position: 'relative' }}>
          {/* Overview chart */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: brushHeight }}>
            {chartType === 'area' ? (
              <AreaChart
                data={overviewData}
                config={{
                  ...config,
                  showPoints: false,
                  showGrid: false,
                  showLegend: false,
                  animation: { ...config.animation, enabled: false },
                  areaOpacity: 0.3
                } as AreaChartConfig}
                variant="simple"
                width={width}
                height={brushHeight}
                className="brush-overview-chart"
              />
            ) : (
              <LineChart
                data={overviewData}
                config={{
                  ...config,
                  showPoints: false,
                  showGrid: false,
                  showLegend: false,
                  animation: { ...config.animation, enabled: false },
                  strokeWidth: 1
                } as LineChartConfig}
                variant="simple"
                width={width}
                height={brushHeight}
                className="brush-overview-chart"
              />
            )}
          </div>

          {/* Brush overlay */}
          <svg
            width={width}
            height={brushHeight}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <g
              ref={brushRef}
              transform={`translate(${brushMargins.left},${brushMargins.top})`}
              style={{ pointerEvents: 'all' }}
            />
          </svg>
        </div>

        {/* Controls */}
        <div className="brush-controls mt-2 flex justify-between items-center">
          <div className="brush-info text-sm text-gray-600">
            {selectedDomain ? (
              <span>
                Selected: {selectedDomain[0].toLocaleDateString()} - {selectedDomain[1].toLocaleDateString()}
                {' '}({Math.ceil((selectedDomain[1].getTime() - selectedDomain[0].getTime()) / (1000 * 60 * 60 * 24))} days)
              </span>
            ) : (
              <span>Drag on the timeline below to zoom the main chart</span>
            )}
          </div>
          
          {selectedDomain && (
            <button
              onClick={resetZoom}
              className="reset-zoom-btn px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border"
            >
              Reset Zoom
            </button>
          )}
        </div>
      </div>

      {/* Accessibility info */}
      <div className="sr-only">
        Brush chart with timeline selection. 
        {selectedDomain ? (
          `Currently viewing data from ${selectedDomain[0].toLocaleDateString()} to ${selectedDomain[1].toLocaleDateString()}.`
        ) : (
          `Showing full dataset with ${data.length} series.`
        )}
        Use the timeline at the bottom to select a time range for the main chart.
      </div>
    </div>
  )
}

export default BrushChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BrushChart, default: BrushChart }
}