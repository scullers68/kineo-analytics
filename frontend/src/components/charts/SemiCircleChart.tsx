import React, { forwardRef } from 'react'
import { PieDataPoint, PieInteractionConfig, PieAnimationConfig } from '../../types/pie-chart'
import { SemiCircleConfig } from '../../types/pie-chart-variants'
import { usePieChart } from '../../hooks/usePieChart'

export interface SemiCircleChartProps {
  data: PieDataPoint[]
  config?: Partial<SemiCircleConfig>
  interactions?: Partial<PieInteractionConfig>
  animations?: Partial<PieAnimationConfig>
  responsive?: boolean
  className?: string
  onSliceClick?: (slice: any, event: MouseEvent) => void
  onSliceHover?: (slice: any, event: MouseEvent) => void
  onError?: (error: Error) => void
}

export const SemiCircleChart = forwardRef<HTMLDivElement, SemiCircleChartProps>(({
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
  // Default semi-circle configuration
  const semiCircleConfig = {
    width: 400,
    height: 250, // Reduced height for semi-circle
    startAngle: -Math.PI / 2, // Start at top (-90 degrees)
    endAngle: Math.PI / 2,    // End at bottom (90 degrees)
    innerRadius: config.gaugeMode ? 80 : 0,
    outerRadius: 120,
    showLabels: true,
    gaugeMode: false,
    showNeedle: false,
    ...config
  }

  const {
    containerRef,
    svgRef,
    chartState,
    dimensions,
    validation
  } = usePieChart({
    data,
    config: semiCircleConfig,
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

  // Calculate gauge value if in gauge mode
  const gaugeValue = React.useMemo(() => {
    if (!semiCircleConfig.gaugeMode || !data.length) return 0
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const maxValue = Math.max(...data.map(d => d.value))
    return maxValue / total * 100
  }, [data, semiCircleConfig.gaugeMode])

  // Handle validation errors
  React.useEffect(() => {
    if (!validation.isValid && onError) {
      const error = new Error(`Semi-circle chart validation failed: ${validation.errors.join(', ')}`)
      onError(error)
    }
  }, [validation, onError])

  // Custom render function for semi-circle specific features
  const renderSemiCircleExtras = React.useCallback(() => {
    if (!svgRef.current || !chartState.slices.length) return

    const svg = d3.select(svgRef.current)
    const centerGroup = svg.select('g')

    // Remove existing extras
    centerGroup.selectAll('.semi-circle-extras').remove()

    const extrasGroup = centerGroup
      .append('g')
      .attr('class', 'semi-circle-extras')

    // Add gauge needle if enabled
    if (semiCircleConfig.gaugeMode && semiCircleConfig.showNeedle) {
      const needleAngle = (gaugeValue / 100) * Math.PI - Math.PI / 2
      const needleLength = (semiCircleConfig.outerRadius || 120) - 10
      const needleConfig = semiCircleConfig.needleConfig || {
        color: '#dc3545',
        width: 2,
        length: needleLength
      }

      // Needle line
      extrasGroup
        .append('line')
        .attr('class', 'gauge-needle')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', Math.cos(needleAngle) * needleConfig.length)
        .attr('y2', Math.sin(needleAngle) * needleConfig.length)
        .attr('stroke', needleConfig.color)
        .attr('stroke-width', needleConfig.width)
        .attr('stroke-linecap', 'round')

      // Needle center circle
      extrasGroup
        .append('circle')
        .attr('class', 'needle-center')
        .attr('r', 4)
        .attr('fill', needleConfig.color)
    }

    // Add value text at bottom center for gauge mode
    if (semiCircleConfig.gaugeMode) {
      extrasGroup
        .append('text')
        .attr('class', 'gauge-value')
        .attr('text-anchor', 'middle')
        .attr('y', (semiCircleConfig.outerRadius || 120) + 30)
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(`${gaugeValue.toFixed(1)}%`)
    }

    // Add baseline (flat bottom edge)
    if (!semiCircleConfig.gaugeMode) {
      extrasGroup
        .append('line')
        .attr('class', 'semi-circle-baseline')
        .attr('x1', -(semiCircleConfig.outerRadius || 120))
        .attr('y1', 0)
        .attr('x2', semiCircleConfig.outerRadius || 120)
        .attr('y2', 0)
        .attr('stroke', '#dee2e6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
    }

  }, [svgRef, chartState, semiCircleConfig, gaugeValue])

  // Render semi-circle extras after main chart
  React.useEffect(() => {
    if (chartState.slices.length > 0) {
      setTimeout(renderSemiCircleExtras, 100) // Small delay to ensure main chart is rendered
    }
  }, [chartState.slices, renderSemiCircleExtras])

  // Display error state
  if (!validation.isValid) {
    return (
      <div 
        ref={ref}
        className={`semi-circle-chart-error ${className}`}
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
        className={`semi-circle-chart-loading ${className}`}
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
        className={`semi-circle-chart-empty ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: `${dimensions.width}px ${dimensions.width}px 0 0`
        }}
      >
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>⌒</div>
          <div style={{ fontSize: '12px' }}>No data available</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={ref}
      className={`semi-circle-chart ${className}`}
      style={{
        width: responsive ? '100%' : dimensions.width,
        height: responsive ? 'auto' : dimensions.height,
        position: 'relative'
      }}
    >
      <div 
        ref={containerRef} 
        className="semi-circle-chart-container"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: responsive ? dimensions.height : 'auto'
        }}
      >
        <svg
          ref={svgRef}
          className="semi-circle-chart-svg"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          role="img"
          aria-label={`Semi-circle chart showing ${data.length} data categories${
            semiCircleConfig.gaugeMode ? ` with gauge value ${gaugeValue.toFixed(1)}%` : ''
          }`}
        />
        
        {/* Accessibility support */}
        <div className="sr-only">
          <h3>Semi-Circle Chart Data</h3>
          {semiCircleConfig.gaugeMode && (
            <p>Gauge mode showing value: {gaugeValue.toFixed(1)}%</p>
          )}
          <ul>
            {chartState.slices.map((slice, index) => (
              <li key={index}>
                {slice.data.label}: {slice.data.value} ({(slice.data.percentage || 0).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>

        {/* Chart type indicator */}
        <div 
          className="chart-type-indicator"
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '10px',
            color: '#6c757d',
            pointerEvents: 'none'
          }}
        >
          {semiCircleConfig.gaugeMode ? '🌡️ Gauge' : '⌒ Semi-circle'}
        </div>

        {/* Gauge value display for gauge mode */}
        {semiCircleConfig.gaugeMode && (
          <div 
            className="gauge-display"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '14px', color: '#6c757d' }}>Current Value</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
              {gaugeValue.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Warnings display */}
        {validation.warnings.length > 0 && (
          <div 
            className="semi-circle-chart-warnings"
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
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

SemiCircleChart.displayName = 'SemiCircleChart'

export default SemiCircleChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SemiCircleChart, default: SemiCircleChart }
}