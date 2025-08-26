import React from 'react'
import { BarChartProps } from '../../types/bar-chart'
import { useBarChart } from '../../hooks/useBarChart'
import { useBarChartData } from '../../hooks/useBarChartData'
import { useBarChartLayout } from '../../hooks/useBarChartLayout'

export const BarChart: React.FC<BarChartProps> = ({
  data,
  config = {},
  variant = 'simple',
  orientation = 'horizontal', // Horizontal by default for bar charts
  width = 400,
  height = 300,
  onBarClick,
  onBarHover,
  className = ''
}) => {
  // Use data management hook
  const {
    processedData,
    seriesData,
    isLoading: dataLoading,
    validationErrors
  } = useBarChartData({
    initialData: data,
    variant,
    validateOnChange: true
  })

  // Use layout hook for positioning calculations
  const {
    dimensions,
    margins,
    orientation: calculatedOrientation,
    layout
  } = useBarChartLayout({
    data: processedData,
    seriesData,
    variant,
    orientation,
    responsive: true,
    barPadding: config.barPadding,
    groupPadding: config.groupPadding
  })

  // Use main chart hook for D3 rendering
  const {
    svgRef,
    state,
    performance
  } = useBarChart({
    data: processedData,
    config,
    variant,
    orientation: calculatedOrientation,
    width: width || dimensions.width,
    height: height || dimensions.height,
    onBarClick,
    onBarHover
  })

  // Show loading state
  if (dataLoading || state.isLoading) {
    return (
      <div className={`bar-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Show validation errors
  if (validationErrors.length > 0) {
    return (
      <div className={`bar-chart-container ${className}`} style={{ width, height }}>
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
      <div className={`bar-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {state.error}</div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!processedData.length) {
    return (
      <div className={`bar-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No data to display</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bar-chart-container ${className}`}
      role="img"
      aria-label={`Bar chart with ${processedData.length} data points`}
      style={{ width: width || dimensions.width, height: height || dimensions.height }}
    >
      <svg
        ref={svgRef}
        width={width || dimensions.width}
        height={height || dimensions.height}
        className="bar-chart-svg"
        aria-describedby="bar-chart-description"
      />
      
      {/* Screen reader description */}
      <div id="bar-chart-description" className="sr-only">
        Bar chart showing {processedData.length} data points. 
        {state.selectedBar && `Currently selected: ${state.selectedBar.label || state.selectedBar.x} with value ${state.selectedBar.y}`}
        {state.hoveredBar && `Currently hovered: ${state.hoveredBar.label || state.hoveredBar.x} with value ${state.hoveredBar.y}`}
      </div>

      {/* Performance debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && performance && (
        <div className="text-xs text-gray-400 mt-1">
          Render time: {performance.renderTime?.toFixed(2)}ms
        </div>
      )}
    </div>
  )
}

export default BarChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BarChart, default: BarChart }
}