import React, { forwardRef } from 'react'
import { PieDataPoint, PieChartConfig, PieInteractionConfig, PieAnimationConfig } from '../../types/pie-chart'
import { usePieChart } from '../../hooks/usePieChart'

export interface PieChartProps {
  data: PieDataPoint[]
  config?: Partial<PieChartConfig>
  interactions?: Partial<PieInteractionConfig>
  animations?: Partial<PieAnimationConfig>
  responsive?: boolean
  className?: string
  onSliceClick?: (slice: any, event: MouseEvent) => void
  onSliceHover?: (slice: any, event: MouseEvent) => void
  onError?: (error: Error) => void
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(({
  data,
  config = {},
  interactions = {
    enableHover: true,
    enableClick: true,
    showTooltip: true
  },
  animations = {
    duration: 300,
    enabled: true,
    easing: 'ease-in-out'
  },
  responsive = true,
  className = '',
  onSliceClick,
  onSliceHover,
  onError
}, ref) => {
  const {
    containerRef,
    svgRef,
    chartState,
    dimensions,
    validation
  } = usePieChart({
    data,
    config: {
      width: 400,
      height: 300,
      showLabels: true,
      showValues: false,
      showPercentages: false,
      ...config
    },
    interactions,
    animations,
    responsive: responsive ? {
      breakpoints: { mobile: 480, tablet: 768, desktop: 1024 },
      adaptiveRadius: true,
      adaptiveLabels: true
    } : undefined,
    onSliceClick,
    onSliceHover
  })

  // Handle validation errors
  React.useEffect(() => {
    if (!validation.isValid && onError) {
      const error = new Error(`Pie chart validation failed: ${validation.errors.join(', ')}`)
      onError(error)
    }
  }, [validation, onError])

  // Display error state
  if (!validation.isValid) {
    return (
      <div 
        ref={ref}
        className={`pie-chart-error ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
      >
        <div className="error-content" style={{ textAlign: 'center' }}>
          <div style={{ color: '#dc3545', marginBottom: '8px' }}>⚠ Chart Error</div>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            {validation.errors[0] || 'Invalid data provided'}
          </div>
        </div>
      </div>
    )
  }

  // Display loading state
  if (!chartState.slices.length && data.length > 0) {
    return (
      <div 
        ref={ref}
        className={`pie-chart-loading ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>Loading chart...</div>
      </div>
    )
  }

  // Display empty state
  if (!data.length) {
    return (
      <div 
        ref={ref}
        className={`pie-chart-empty ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '4px'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>○</div>
          <div style={{ fontSize: '12px' }}>No data available</div>
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
      ref={ref}
      className={`pie-chart ${className}`}
      data-testid="pie-chart"
      data-filtered-count={Array.isArray(data) ? data.length : 0}
      data-signature={dataSignature}
      data-record-ids={dataRecordIds}
      data-last-updated={lastUpdated}
      style={{
        width: responsive ? '100%' : dimensions.width,
        height: responsive ? 'auto' : dimensions.height,
        position: 'relative'
      }}
    >
      <div 
        ref={containerRef} 
        className="pie-chart-container"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: responsive ? dimensions.height : 'auto'
        }}
      >
        <svg
          ref={svgRef}
          className="pie-chart-svg"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          role="img"
          aria-label={`Pie chart showing ${data.length} data categories`}
        />
        
        {/* Accessibility support */}
        <div className="sr-only">
          <h3>Pie Chart Data</h3>
          <ul>
            {chartState.slices.map((slice, index) => (
              <li key={index}>
                {slice.data.label}: {slice.data.value} ({(slice.data.percentage || 0).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>

        {/* Warnings display */}
        {validation.warnings.length > 0 && (
          <div 
            className="pie-chart-warnings"
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '4px',
              fontSize: '10px',
              color: '#ffc107',
              maxWidth: '200px'
            }}
            title={validation.warnings.join('; ')}
          >
            ⚠ {validation.warnings.length} warning(s)
          </div>
        )}
      </div>
    </div>
  )
})

PieChart.displayName = 'PieChart'

export default PieChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PieChart, default: PieChart }
}