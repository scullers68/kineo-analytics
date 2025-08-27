import React from 'react'
import { LineChartProps } from '../../types/line-chart'
import { useLineChart } from '../../hooks/useLineChart'
import { useTimeSeriesChart } from '../../hooks/useTimeSeriesChart'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export const LineChart: React.FC<LineChartProps> = ({
  data,
  config = {},
  variant = 'simple',
  width = 400,
  height = 300,
  onPointClick,
  onPointHover,
  onZoom,
  className = ''
}) => {
  // Respect user motion preferences
  const prefersReducedMotion = useReducedMotion()
  
  // Process time series data for optimization
  const {
    processedData,
    validationErrors,
    isProcessing,
    processingInfo
  } = useTimeSeriesChart({
    data,
    maxPoints: config.animation?.enabled && !prefersReducedMotion ? 1000 : 2000,
    enableDataResampling: true,
    interpolationMethod: config.missingData?.interpolationMethod || 'linear'
  })

  // Apply motion preferences to config
  const finalConfig = {
    ...config,
    animation: {
      ...config.animation,
      enabled: config.animation?.enabled && !prefersReducedMotion
    }
  }

  // Use main line chart hook
  const {
    svgRef,
    state,
    resetZoom,
    performance
  } = useLineChart({
    data: processedData,
    config: finalConfig,
    width,
    height,
    onPointClick,
    onPointHover,
    onZoom
  })

  // Show loading state
  if (isProcessing || state.isLoading) {
    return (
      <div className={`line-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Show validation errors
  if (validationErrors.length > 0) {
    return (
      <div className={`line-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">
            <div className="font-semibold">Chart Error:</div>
            {validationErrors.map((error, i) => (
              <div key={i} className="text-sm">{error}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (state.error) {
    return (
      <div className={`line-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {state.error}</div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!processedData.length) {
    return (
      <div className={`line-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No data to display</div>
        </div>
      </div>
    )
  }

  // Calculate data attributes for testing
  const dataRecordIds = Array.isArray(data) ? data.map((d: any) => d.id || d.key || '').join(',') : ''
  const dataSignature = Array.isArray(data) ? `${data.length}-${data.map(d => typeof d).join('')}` : '0'
  const lastUpdated = Date.now().toString()

  return (
    <div 
      className={`line-chart-container ${className}`}
      data-testid="line-chart"
      data-filtered-count={Array.isArray(data) ? data.length : 0}
      data-signature={dataSignature}
      data-record-ids={dataRecordIds}
      data-last-updated={lastUpdated}
      role="img"
      aria-label={`Line chart with ${processedData.length} series showing ${processingInfo.processedPointCount} data points`}
      style={{ width, height }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="line-chart-svg"
        aria-describedby="line-chart-description"
      />
      
      {/* Screen reader description */}
      <div id="line-chart-description" className="sr-only">
        Line chart with {processedData.length} data series. 
        {processedData.map((series, i) => (
          <span key={series.id}>
            Series {i + 1}: {series.label} with {series.points.length} data points. 
          </span>
        ))}
        {state.selectedPoint && `Currently selected: ${state.selectedPoint.series.label} at ${state.selectedPoint.point.date.toLocaleDateString()} with value ${state.selectedPoint.point.value}`}
        {state.hoveredPoint && `Currently hovered: ${state.hoveredPoint.series.label} at ${state.hoveredPoint.point.date.toLocaleDateString()} with value ${state.hoveredPoint.point.value}`}
        {state.zoomDomain && `Zoomed to time range from ${state.zoomDomain[0].toLocaleDateString()} to ${state.zoomDomain[1].toLocaleDateString()}`}
      </div>

      {/* Chart controls */}
      {state.zoomDomain && (
        <div className="absolute top-2 right-2">
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            aria-label="Reset zoom"
          >
            Reset Zoom
          </button>
        </div>
      )}

      {/* Performance debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          <div>Render time: {performance.renderTime?.toFixed(2)}ms</div>
          <div>Points: {performance.pointCount} ({processingInfo.resampled ? 'resampled' : 'original'})</div>
          {processingInfo.gapCount > 0 && <div>Gaps detected: {processingInfo.gapCount}</div>}
        </div>
      )}

      {/* Tooltip for hovered point */}
      {state.hoveredPoint && state.crosshairPosition && (
        <div
          className="absolute pointer-events-none bg-black text-white px-2 py-1 rounded text-sm z-10"
          style={{
            left: state.crosshairPosition.x + 60, // Account for left margin
            top: state.crosshairPosition.y + 20,  // Account for top margin
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold">{state.hoveredPoint.series.label}</div>
          <div>{state.hoveredPoint.point.date.toLocaleDateString()}</div>
          <div>Value: {state.hoveredPoint.point.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}

export default LineChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LineChart, default: LineChart }
}