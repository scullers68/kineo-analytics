import React, { forwardRef, useState, useMemo, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { PieDataPoint, PieInteractionConfig, PieAnimationConfig } from '../../types/pie-chart'
import { NestedDonutConfig, DonutCenterContent } from '../../types/donut-chart'
import { useD3Chart } from '../../hooks/useD3Chart'
import { generateNestedArcs } from '../../utils/pie-arc-generators'
import { validatePieData, normalizePieData } from '../../utils/pie-data-transformer'
import { calculateRadius } from '../../utils/pie-chart-math'

export interface NestedDonutChartProps {
  innerData: PieDataPoint[]
  outerData: PieDataPoint[]
  config?: Partial<NestedDonutConfig>
  interactions?: Partial<PieInteractionConfig>
  animations?: Partial<PieAnimationConfig>
  responsive?: boolean
  className?: string
  onSliceClick?: (slice: any, layer: number, event: MouseEvent) => void
  onSliceHover?: (slice: any, layer: number, event: MouseEvent) => void
  onCenterClick?: () => void
  onError?: (error: Error) => void
}

export const NestedDonutChart = forwardRef<HTMLDivElement, NestedDonutChartProps>(({
  innerData,
  outerData,
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
  onCenterClick,
  onError
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 400, height: 400 })
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const [centerContent, setCenterContent] = useState<DonutCenterContent>(
    config.centerContent || {
      title: 'Nested Data',
      value: innerData.length + outerData.length,
      subtitle: 'items'
    }
  )

  // Validate both datasets
  const validation = useMemo(() => {
    const innerValidation = validatePieData(innerData)
    const outerValidation = validatePieData(outerData)
    
    return {
      isValid: innerValidation.isValid && outerValidation.isValid,
      errors: [...innerValidation.errors, ...outerValidation.errors],
      warnings: [...innerValidation.warnings, ...outerValidation.warnings]
    }
  }, [innerData, outerData])

  // Normalize datasets
  const { normalizedInnerData, normalizedOuterData } = useMemo(() => {
    if (!validation.isValid) return { normalizedInnerData: [], normalizedOuterData: [] }

    const normalizedInnerData = normalizePieData(innerData, {
      ensurePositiveValues: true,
      removeZeroValues: true,
      fillMissingColors: true,
      colorScheme: d3.schemeSet3
    })

    const normalizedOuterData = normalizePieData(outerData, {
      ensurePositiveValues: true,
      removeZeroValues: true,
      fillMissingColors: true,
      colorScheme: d3.schemeCategory10
    })

    return { normalizedInnerData, normalizedOuterData }
  }, [innerData, outerData, validation.isValid])

  // Calculate responsive dimensions
  const dimensions = useMemo(() => {
    const width = config.layers?.[0]?.config?.width || containerDimensions.width || 400
    const height = config.layers?.[0]?.config?.height || containerDimensions.height || 400
    const radius = calculateRadius(width, height)

    return { width, height, radius }
  }, [containerDimensions, config])

  // Create layer configurations
  const layerConfigs = useMemo(() => {
    const baseRadius = dimensions.radius
    const spacing = config.spacing || 10
    
    const innerRadius = baseRadius * 0.3
    const middleRadius = baseRadius * 0.6
    const outerRadius = baseRadius * 0.9

    return [
      {
        data: normalizedInnerData,
        innerRadius: 0,
        outerRadius: innerRadius,
        config: { padAngle: 0.02, cornerRadius: 2 }
      },
      {
        data: normalizedOuterData,
        innerRadius: innerRadius + spacing,
        outerRadius: outerRadius,
        config: { padAngle: 0.02, cornerRadius: 2 }
      }
    ]
  }, [normalizedInnerData, normalizedOuterData, dimensions.radius, config.spacing])

  // Generate nested arcs
  const nestedArcs = useMemo(() => {
    if (!layerConfigs.length) return []
    
    return generateNestedArcs(
      layerConfigs,
      [d3.schemeSet3, d3.schemeCategory10]
    )
  }, [layerConfigs])

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // D3 chart integration
  const { svgRef } = useD3Chart({
    data: [...normalizedInnerData, ...normalizedOuterData],
    width: dimensions.width,
    height: dimensions.height
  })

  // Render nested donut chart
  const renderNestedChart = React.useCallback(() => {
    if (!svgRef.current || !nestedArcs.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Set up SVG dimensions
    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    // Create main group and center it
    const g = svg
      .append('g')
      .attr('transform', `translate(${dimensions.width / 2},${dimensions.height / 2})`)

    // Render each layer
    nestedArcs.forEach((arcData, layerIndex) => {
      const layerGroup = g
        .append('g')
        .attr('class', `layer-${layerIndex}`)

      // Render slices for this layer
      const sliceGroups = layerGroup
        .selectAll('.slice')
        .data(arcData.slices)
        .enter()
        .append('g')
        .attr('class', 'slice')
        .style('cursor', interactions.enableClick || interactions.enableHover ? 'pointer' : 'default')

      // Add slice paths
      sliceGroups
        .append('path')
        .attr('d', (d) => arcData.arc({
          startAngle: d.startAngle,
          endAngle: d.endAngle,
          innerRadius: d.innerRadius,
          outerRadius: d.outerRadius,
          padAngle: d.padAngle
        }))
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .style('transition', animations.enabled ? `opacity ${animations.duration}ms, transform ${animations.duration}ms` : 'none')

      // Add interaction handlers
      if (interactions.enableClick) {
        sliceGroups.on('click', (event, d) => {
          onSliceClick?.(d, layerIndex, event)
          
          // Update center content
          setCenterContent({
            title: d.data.label,
            value: d.data.value,
            subtitle: `Layer ${layerIndex + 1} - ${(d.data.percentage || 0).toFixed(1)}%`
          })
        })
      }

      if (interactions.enableHover) {
        sliceGroups
          .on('mouseenter', (event, d) => {
            setHoveredLayer(layerIndex)
            setHoveredSlice(d.index)
            
            // Highlight effect
            d3.select(event.currentTarget)
              .select('path')
              .style('opacity', 1)
              .attr('transform', () => {
                if (interactions.explodeOnHover) {
                  const angle = (d.startAngle + d.endAngle) / 2
                  const distance = (layerIndex + 1) * 3 // More explode for outer layers
                  const dx = Math.cos(angle) * distance
                  const dy = Math.sin(angle) * distance
                  return `translate(${dx},${dy})`
                }
                return 'translate(0,0)'
              })

            onSliceHover?.(d, layerIndex, event)
          })
          .on('mouseleave', (event, d) => {
            setHoveredLayer(null)
            setHoveredSlice(null)
            
            // Remove highlight effect
            d3.select(event.currentTarget)
              .select('path')
              .style('opacity', 0.8)
              .attr('transform', 'translate(0,0)')

            onSliceHover?.(null, layerIndex, event)
          })
      }

      // Add labels if enabled
      if (config.layerLabels) {
        sliceGroups
          .append('text')
          .attr('transform', d => {
            const centroid = arcData.arc.centroid({
              startAngle: d.startAngle,
              endAngle: d.endAngle,
              innerRadius: d.innerRadius,
              outerRadius: d.outerRadius,
              padAngle: d.padAngle
            })
            return `translate(${centroid})`
          })
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', layerIndex === 0 ? '10px' : '11px')
          .style('fill', '#333')
          .style('pointer-events', 'none')
          .text(d => {
            const angle = d.endAngle - d.startAngle
            const minAngle = layerIndex === 0 ? 0.3 : 0.2 // Inner layer needs more space
            return angle > minAngle ? d.data.label : ''
          })
      }
    })

    // Add center content
    const centerGroup = g
      .append('g')
      .attr('class', 'center-content')
      .style('cursor', onCenterClick ? 'pointer' : 'default')

    // Center title
    if (centerContent.title) {
      centerGroup
        .append('text')
        .attr('class', 'center-title')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(centerContent.title)
    }

    // Center value
    if (centerContent.value !== undefined) {
      centerGroup
        .append('text')
        .attr('class', 'center-value')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.5em')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#007bff')
        .text(String(centerContent.value))
    }

    // Center subtitle
    if (centerContent.subtitle) {
      centerGroup
        .append('text')
        .attr('class', 'center-subtitle')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .style('font-size', '11px')
        .style('fill', '#666')
        .text(centerContent.subtitle)
    }

    // Add center click handler
    if (onCenterClick) {
      centerGroup.on('click', onCenterClick)
    }

  }, [svgRef, nestedArcs, dimensions, centerContent, interactions, animations, config, onSliceClick, onSliceHover, onCenterClick])

  // Render chart when dependencies change
  useEffect(() => {
    if (validation.isValid) {
      renderNestedChart()
    }
  }, [renderNestedChart, validation.isValid])

  // Handle validation errors
  useEffect(() => {
    if (!validation.isValid && onError) {
      const error = new Error(`Nested donut chart validation failed: ${validation.errors.join(', ')}`)
      onError(error)
    }
  }, [validation, onError])

  // Display error state
  if (!validation.isValid) {
    return (
      <div 
        ref={ref}
        className={`nested-donut-chart-error ${className}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '50%'
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

  // Display empty state
  if (!innerData.length && !outerData.length) {
    return (
      <div 
        ref={ref}
        className={`nested-donut-chart-empty ${className}`}
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
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>◎</div>
          <div style={{ fontSize: '12px' }}>No nested data</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={ref}
      className={`nested-donut-chart ${className}`}
      style={{
        width: responsive ? '100%' : dimensions.width,
        height: responsive ? 'auto' : dimensions.height,
        position: 'relative'
      }}
    >
      <div 
        ref={containerRef} 
        className="nested-donut-chart-container"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: responsive ? dimensions.height : 'auto'
        }}
      >
        <svg
          ref={svgRef}
          className="nested-donut-chart-svg"
          style={{
            width: '100%',
            height: '100%',
            display: 'block'
          }}
          role="img"
          aria-label={`Nested donut chart with ${innerData.length} inner items and ${outerData.length} outer items`}
        />
        
        {/* Accessibility support */}
        <div className="sr-only">
          <h3>Nested Donut Chart Data</h3>
          <h4>Inner Layer ({innerData.length} items)</h4>
          <ul>
            {normalizedInnerData.map((item, index) => (
              <li key={`inner-${index}`}>
                {item.label}: {item.value}
              </li>
            ))}
          </ul>
          <h4>Outer Layer ({outerData.length} items)</h4>
          <ul>
            {normalizedOuterData.map((item, index) => (
              <li key={`outer-${index}`}>
                {item.label}: {item.value}
              </li>
            ))}
          </ul>
        </div>

        {/* Layer indicator */}
        <div 
          className="layer-indicator"
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '10px',
            color: '#6c757d',
            lineHeight: '1.2'
          }}
        >
          <div>◎ Nested</div>
          <div>Inner: {normalizedInnerData.length}</div>
          <div>Outer: {normalizedOuterData.length}</div>
        </div>

        {/* Hover indicator */}
        {hoveredLayer !== null && hoveredSlice !== null && (
          <div 
            className="hover-indicator"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              fontSize: '10px',
              color: '#007bff',
              textAlign: 'right'
            }}
          >
            Layer {hoveredLayer + 1}<br />
            Slice {hoveredSlice}
          </div>
        )}

        {/* Warnings display */}
        {validation.warnings.length > 0 && (
          <div 
            className="nested-donut-chart-warnings"
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

NestedDonutChart.displayName = 'NestedDonutChart'

export default NestedDonutChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NestedDonutChart, default: NestedDonutChart }
}