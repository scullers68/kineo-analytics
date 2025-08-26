import React, { forwardRef } from 'react'
import { PieDataPoint, PieInteractionConfig, PieAnimationConfig } from '../../types/pie-chart'
import { DonutChartConfig, DonutCenterContent } from '../../types/donut-chart'
import { useDonutChart } from '../../hooks/useDonutChart'

export interface DonutChartProps {
  data: PieDataPoint[]
  config?: Partial<DonutChartConfig>
  interactions?: Partial<PieInteractionConfig>
  animations?: Partial<PieAnimationConfig>
  centerContent?: DonutCenterContent
  responsive?: boolean
  className?: string
  onSliceClick?: (slice: any, event: MouseEvent) => void
  onSliceHover?: (slice: any, event: MouseEvent) => void
  onCenterClick?: () => void
  onCenterHover?: (isHovering: boolean) => void
  onError?: (error: Error) => void
}

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(({
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
  centerContent,
  responsive = true,
  className = '',
  onSliceClick,
  onSliceHover,
  onCenterClick,
  onCenterHover,
  onError
}, ref) => {
  const {
    containerRef,
    svgRef,
    donutState,
    dimensions,
    validation,
    totalValue,
    averageValue,
    updateCenterContent,
    resetCenterContent
  } = useDonutChart({
    data,
    config: {
      width: 400,
      height: 300,
      innerRadius: 60, // Default donut hole size
      outerRadius: 120,
      showLabels: true,
      ...config
    },
    interactions,
    animations,
    centerContent: centerContent || {
      title: 'Total',
      value: data.reduce((sum, d) => sum + d.value, 0),
      subtitle: `${data.length} items`
    },
    responsive: responsive ? {
      breakpoints: { mobile: 480, tablet: 768, desktop: 1024 },
      adaptiveRadius: true,
      adaptiveLabels: true
    } : undefined,
    onSliceClick,
    onSliceHover,
    onCenterClick,
    onCenterHover
  })

  // Handle validation errors
  React.useEffect(() => {
    if (!validation.isValid && onError) {
      const error = new Error(`Donut chart validation failed: ${validation.errors.join(', ')}`)
      onError(error)
    }
  }, [validation, onError])

  // Update center content when data changes
  React.useEffect(() => {
    if (!centerContent && data.length > 0) {
      updateCenterContent({
        title: 'Total',
        value: totalValue,
        subtitle: `${data.length} items`
      })
    }
  }, [data, totalValue, centerContent, updateCenterContent])

  // Display error state
  if (!validation.isValid) {
    return (
      <div 
        ref={ref}
        className={`donut-chart-error ${className}`}
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
  if (!donutState.slices.length && data.length > 0) {
    return (
      <div 
        ref={ref}
        className={`donut-chart-loading ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 8px'
          }}></div>
          <div>Loading chart...</div>
        </div>
      </div>
    )
  }

  // Display empty state
  if (!data.length) {
    return (
      <div 
        ref={ref}
        className={`donut-chart-empty ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '50%'
        }}
      >
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>○</div>
          <div style={{ fontSize: '12px' }}>No data available</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={ref}
      className={`donut-chart ${className}`}
      style={{
        width: responsive ? '100%' : dimensions.width,
        height: responsive ? 'auto' : dimensions.height,
        position: 'relative'
      }}
    >
      <div 
        ref={containerRef} 
        className="donut-chart-container"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: responsive ? dimensions.height : 'auto'
        }}
      >
        <svg
          ref={svgRef}
          className="donut-chart-svg"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          role="img"
          aria-label={`Donut chart showing ${data.length} data categories with center content`}
        />
        
        {/* Accessibility support */}
        <div className="sr-only">
          <h3>Donut Chart Data</h3>
          <p>
            Center content: {donutState.centerContent.title} - {donutState.centerContent.value}
            {donutState.centerContent.subtitle && ` (${donutState.centerContent.subtitle})`}
          </p>
          <ul>
            {donutState.slices.map((slice, index) => (
              <li key={index}>
                {slice.data.label}: {slice.data.value} ({(slice.data.percentage || 0).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>

        {/* Center content overlay for accessibility */}
        <div 
          className="donut-center-overlay"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            textAlign: 'center',
            color: 'transparent',
            fontSize: '1px'
          }}
          aria-hidden="true"
        >
          {donutState.centerContent.title} {donutState.centerContent.value}
        </div>

        {/* Statistics overlay */}
        {(totalValue > 0 || averageValue > 0) && (
          <div 
            className="donut-chart-stats"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              fontSize: '10px',
              color: '#6c757d',
              textAlign: 'right',
              lineHeight: '1.2',
              pointerEvents: 'none'
            }}
            title={`Total: ${totalValue}, Average: ${averageValue.toFixed(2)}`}
          >
            <div>Σ {totalValue}</div>
            <div>μ {averageValue.toFixed(1)}</div>
          </div>
        )}

        {/* Warnings display */}
        {validation.warnings.length > 0 && (
          <div 
            className="donut-chart-warnings"
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

        {/* Center content indicator */}
        {donutState.isAnimatingCenter && (
          <div 
            className="center-animation-indicator"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              backgroundColor: '#007bff',
              borderRadius: '50%',
              animation: 'pulse 0.5s ease-in-out',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </div>
  )
})

DonutChart.displayName = 'DonutChart'

export default DonutChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DonutChart, default: DonutChart }
}