import React from 'react'
import { AreaChartProps } from '../../types/area-chart'
import { useAreaChart } from '../../hooks/useAreaChart'
import { useTimeSeriesChart } from '../../hooks/useTimeSeriesChart'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export const AreaChart: React.FC<AreaChartProps> = ({
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

  // Use main area chart hook
  const {
    svgRef,
    state,
    resetZoom,
    performance
  } = useAreaChart({
    data: processedData,
    config: finalConfig,
    variant,
    width,
    height,
    onPointClick,
    onPointHover,
    onZoom
  })

  // Show loading state
  if (isProcessing || state.isLoading) {
    return (
      <div className={`area-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Show validation errors
  if (validationErrors.length > 0) {
    return (
      <div className={`area-chart-container ${className}`} style={{ width, height }}>
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
      <div className={`area-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {state.error}</div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!processedData.length) {
    return (
      <div className={`area-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No data to display</div>
        </div>
      </div>
    )
  }

  // Generate descriptive text based on variant
  const getVariantDescription = () => {
    switch (variant) {
      case 'stacked':
        return `Stacked area chart showing cumulative values across ${processedData.length} series`
      case 'stream':
        return `Stream graph showing ${processedData.length} series with symmetric layout`
      default:
        return `Area chart with ${processedData.length} series`
    }
  }

  return (
    <div 
      className={`area-chart-container ${className}`}
      role="img"
      aria-label={`${getVariantDescription()} with ${processingInfo.processedPointCount} data points`}
      style={{ width, height }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="area-chart-svg"
        aria-describedby="area-chart-description"
      />
      
      {/* Screen reader description */}
      <div id="area-chart-description" className="sr-only">
        {getVariantDescription()}. 
        {processedData.map((series, i) => (
          <span key={series.id}>
            Series {i + 1}: {series.label} with {series.points.length} data points. 
          </span>
        ))}
        {state.selectedPoint && `Currently selected: ${state.selectedPoint.series.label} at ${state.selectedPoint.point.date.toLocaleDateString()} with value ${state.selectedPoint.point.value}`}
        {state.hoveredPoint && `Currently hovered: ${state.hoveredPoint.series.label} at ${state.hoveredPoint.point.date.toLocaleDateString()} with value ${state.hoveredPoint.point.value}`}
        {state.zoomDomain && `Zoomed to time range from ${state.zoomDomain[0].toLocaleDateString()} to ${state.zoomDomain[1].toLocaleDateString()}`}
        {variant === 'stacked' && state.stackedData && `Stacked values with baseline calculations for proper layering`}
      </div>

      {/* Chart controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        {state.zoomDomain && (
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            aria-label="Reset zoom"
          >
            Reset Zoom
          </button>
        )}
        
        {/* Legend toggle for multi-series */}
        {processedData.length > 1 && config.showLegend && (
          <div className="text-xs bg-white border rounded px-2 py-1 shadow-sm">
            <div className="font-semibold mb-1">Series:</div>
            {processedData.map((series, i) => (
              <div key={series.id} className="flex items-center gap-1 mb-1">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: series.color || `hsl(${i * 60}, 70%, 50%)` }}
                />
                <span className="text-xs">{series.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mt-1">
          <div>Render time: {performance.renderTime?.toFixed(2)}ms</div>
          <div>Points: {performance.pointCount} ({processingInfo.resampled ? 'resampled' : 'original'})</div>
          <div>Variant: {variant}</div>
          {variant === 'stacked' && <div>Stacked layers: {state.stackedData?.length || 0}</div>}
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
          {variant === 'stacked' && (
            <div className="text-xs opacity-75">
              Part of stacked total
            </div>
          )}
        </div>
      )}

      {/* Data quality indicators */}
      {processingInfo.gapCount > 0 && config.missingData?.showGapIndicators && (
        <div className="absolute bottom-2 left-2 text-xs bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
          ⚠️ {processingInfo.gapCount} gap{processingInfo.gapCount !== 1 ? 's' : ''} detected in data
        </div>
      )}

      {/* Resampling indicator */}
      {processingInfo.resampled && (
        <div className="absolute bottom-2 right-2 text-xs bg-blue-100 border border-blue-300 rounded px-2 py-1">
          📊 Data optimized for display ({processingInfo.processedPointCount} of {processingInfo.originalPointCount} points)
        </div>
      )}
    </div>
  )
}

export default AreaChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AreaChart, default: AreaChart }
}