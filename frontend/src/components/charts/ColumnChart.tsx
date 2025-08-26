import React from 'react'
import { ColumnChartProps } from '../../types/column-chart'
import { useColumnChart } from '../../hooks/useColumnChart'
import { useBarChartData } from '../../hooks/useBarChartData'
import { useBarChartLayout } from '../../hooks/useBarChartLayout'

export const ColumnChart: React.FC<ColumnChartProps> = ({
  data,
  config = {},
  variant = 'simple',
  orientation = 'vertical', // Vertical by default for column charts
  width = 400,
  height = 300,
  onColumnClick,
  onColumnHover,
  className = ''
}) => {
  // Use data management hook (same as bar chart - columns are just vertical bars)
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
    barPadding: config.columnPadding,
    groupPadding: config.groupPadding
  })

  // Use main chart hook for D3 rendering
  const {
    svgRef,
    state,
    performance
  } = useColumnChart({
    data: processedData,
    config,
    variant,
    orientation: calculatedOrientation,
    width: width || dimensions.width,
    height: height || dimensions.height,
    onColumnClick,
    onColumnHover
  })

  // Show loading state
  if (dataLoading || state.isLoading) {
    return (
      <div className={`column-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  // Show validation errors
  if (validationErrors.length > 0) {
    return (
      <div className={`column-chart-container ${className}`} style={{ width, height }}>
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
      <div className={`column-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {state.error}</div>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!processedData.length) {
    return (
      <div className={`column-chart-container ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">No data to display</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`column-chart-container ${className}`}
      role="img"
      aria-label={`Column chart with ${processedData.length} data points`}
      style={{ width: width || dimensions.width, height: height || dimensions.height }}
    >
      <svg
        ref={svgRef}
        width={width || dimensions.width}
        height={height || dimensions.height}
        className="column-chart-svg"
        aria-describedby="column-chart-description"
      />
      
      {/* Screen reader description */}
      <div id="column-chart-description" className="sr-only">
        Column chart showing {processedData.length} data points. 
        {state.selectedColumn && `Currently selected: ${state.selectedColumn.label || state.selectedColumn.x} with value ${state.selectedColumn.y}`}
        {state.hoveredColumn && `Currently hovered: ${state.hoveredColumn.label || state.hoveredColumn.x} with value ${state.hoveredColumn.y}`}
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

export default ColumnChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ColumnChart, default: ColumnChart }
}