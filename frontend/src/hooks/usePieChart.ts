import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { 
  PieDataPoint, 
  PieChartConfig, 
  PieSlice, 
  PieChartState, 
  PieInteractionConfig,
  PieAnimationConfig,
  PieResponsiveConfig
} from '../types/pie-chart'
import { useD3Chart } from './useD3Chart'
import { 
  createPieSlices, 
  generateArc, 
  generatePieLayout,
  generateColorScale
} from '../utils/pie-arc-generators'
import { 
  transformPieData, 
  validatePieData, 
  normalizePieData 
} from '../utils/pie-data-transformer'
import { 
  calculateRadius, 
  calculateResponsiveDimensions 
} from '../utils/pie-chart-math'

export interface UsePieChartOptions {
  data: PieDataPoint[]
  config?: Partial<PieChartConfig>
  interactions?: Partial<PieInteractionConfig>
  animations?: Partial<PieAnimationConfig>
  responsive?: Partial<PieResponsiveConfig>
  onSliceClick?: (slice: PieSlice, event: MouseEvent) => void
  onSliceHover?: (slice: PieSlice | null, event: MouseEvent) => void
}

export const usePieChart = ({
  data,
  config = {},
  interactions = {},
  animations = {},
  responsive = {},
  onSliceClick,
  onSliceHover
}: UsePieChartOptions) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 400, height: 300 })
  const [chartState, setChartState] = useState<PieChartState>({
    slices: [],
    selectedSlices: [],
    hoveredSlice: null,
    explodedSlices: [],
    hiddenSlices: [],
    drillDownPath: []
  })

  // Validate and normalize data
  const { validatedData, validation } = useMemo(() => {
    const validation = validatePieData(data)
    const normalizedData = validation.isValid 
      ? normalizePieData(data, {
          ensurePositiveValues: true,
          removeZeroValues: true,
          fillMissingColors: true,
          colorScheme: d3.schemeCategory10
        })
      : []
    
    return {
      validatedData: normalizedData,
      validation
    }
  }, [data])

  // Calculate responsive dimensions
  const dimensions = useMemo(() => {
    if (responsive.breakpoints && containerDimensions.width) {
      return calculateResponsiveDimensions(
        containerDimensions.width,
        containerDimensions.height,
        config.width && config.height ? config.width / config.height : 1,
        200,
        800
      )
    }
    
    return {
      width: config.width || containerDimensions.width,
      height: config.height || containerDimensions.height,
      radius: calculateRadius(
        config.width || containerDimensions.width,
        config.height || containerDimensions.height
      )
    }
  }, [containerDimensions, config, responsive])

  // Create pie layout and arc generator
  const { pieLayout, arcGenerator, colorScale } = useMemo(() => {
    const pieLayout = generatePieLayout({
      ...config,
      innerRadius: config.innerRadius || 0,
      outerRadius: config.outerRadius || dimensions.radius
    })

    const arcGenerator = generateArc(
      config.innerRadius || 0,
      config.outerRadius || dimensions.radius,
      config.cornerRadius || 0,
      config.padAngle || 0
    )

    const colorScale = generateColorScale(validatedData)

    return { pieLayout, arcGenerator, colorScale }
  }, [validatedData, config, dimensions])

  // Generate pie slices
  const slices = useMemo(() => {
    if (!validatedData.length) return []

    return createPieSlices(
      validatedData,
      {
        ...config,
        innerRadius: config.innerRadius || 0,
        outerRadius: config.outerRadius || dimensions.radius
      },
      d3.schemeCategory10
    )
  }, [validatedData, config, dimensions])

  // Update chart state when slices change
  useEffect(() => {
    setChartState(prev => ({
      ...prev,
      slices
    }))
  }, [slices])

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
    data: validatedData,
    width: dimensions.width,
    height: dimensions.height
  })

  // Interaction handlers
  const handleSliceClick = useCallback((slice: PieSlice, event: MouseEvent) => {
    if (!interactions.enableClick) return

    setChartState(prev => {
      const isSelected = prev.selectedSlices.includes(slice.index)
      const selectedSlices = isSelected
        ? prev.selectedSlices.filter(i => i !== slice.index)
        : [...prev.selectedSlices, slice.index]

      return { ...prev, selectedSlices }
    })

    onSliceClick?.(slice, event)
  }, [interactions.enableClick, onSliceClick])

  const handleSliceHover = useCallback((slice: PieSlice | null, event: MouseEvent) => {
    if (!interactions.enableHover) return

    setChartState(prev => ({
      ...prev,
      hoveredSlice: slice?.index || null,
      explodedSlices: slice && interactions.explodeOnHover 
        ? [slice.index]
        : prev.explodedSlices.filter(i => i !== (slice?.index || -1))
    }))

    onSliceHover?.(slice, event)
  }, [interactions.enableHover, interactions.explodeOnHover, onSliceHover])

  // Render function
  const renderChart = useCallback(() => {
    if (!svgRef.current || !chartState.slices.length) return

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

    // Render slices
    const sliceGroups = g
      .selectAll('.slice')
      .data(chartState.slices)
      .enter()
      .append('g')
      .attr('class', 'slice')
      .style('cursor', interactions.enableClick || interactions.enableHover ? 'pointer' : 'default')

    // Add slice paths
    sliceGroups
      .append('path')
      .attr('d', (d) => arcGenerator({
        startAngle: d.startAngle,
        endAngle: d.endAngle,
        innerRadius: d.innerRadius,
        outerRadius: d.outerRadius,
        padAngle: d.padAngle
      }))
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', d => chartState.hiddenSlices.includes(d.index) ? 0.3 : 1)
      .attr('transform', d => {
        if (chartState.explodedSlices.includes(d.index)) {
          const angle = (d.startAngle + d.endAngle) / 2
          const explodeDistance = interactions.explodeDistance || 10
          const dx = Math.cos(angle) * explodeDistance
          const dy = Math.sin(angle) * explodeDistance
          return `translate(${dx},${dy})`
        }
        return 'translate(0,0)'
      })

    // Add interaction handlers
    if (interactions.enableClick) {
      sliceGroups.on('click', (event, d) => {
        handleSliceClick(d, event)
      })
    }

    if (interactions.enableHover) {
      sliceGroups
        .on('mouseenter', (event, d) => {
          handleSliceHover(d, event)
        })
        .on('mouseleave', (event) => {
          handleSliceHover(null, event)
        })
    }

    // Add labels if enabled
    if (config.showLabels) {
      sliceGroups
        .append('text')
        .attr('transform', d => {
          const centroid = arcGenerator.centroid({
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
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => d.data.label)
    }

  }, [svgRef, chartState, dimensions, arcGenerator, config, interactions, handleSliceClick, handleSliceHover])

  // Render chart when dependencies change
  useEffect(() => {
    renderChart()
  }, [renderChart])

  return {
    containerRef,
    svgRef,
    chartState,
    dimensions,
    validation,
    slices: chartState.slices,
    // State setters for external control
    setSelectedSlices: (indices: number[]) => {
      setChartState(prev => ({ ...prev, selectedSlices: indices }))
    },
    setHoveredSlice: (index: number | null) => {
      setChartState(prev => ({ ...prev, hoveredSlice: index }))
    },
    setExplodedSlices: (indices: number[]) => {
      setChartState(prev => ({ ...prev, explodedSlices: indices }))
    },
    setHiddenSlices: (indices: number[]) => {
      setChartState(prev => ({ ...prev, hiddenSlices: indices }))
    },
    // Utility functions
    renderChart,
    getSliceAtPoint: (x: number, y: number) => {
      // Convert screen coordinates to slice
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2
      const dx = x - centerX
      const dy = y - centerY
      const angle = Math.atan2(dy, dx)
      const distance = Math.sqrt(dx * dx + dy * dy)

      return chartState.slices.find(slice => {
        const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        const normalizedStart = ((slice.startAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        const normalizedEnd = ((slice.endAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI)
        
        const withinRadius = distance >= slice.innerRadius && distance <= slice.outerRadius
        let withinAngle: boolean
        
        if (normalizedStart <= normalizedEnd) {
          withinAngle = normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
        } else {
          withinAngle = normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd
        }
        
        return withinRadius && withinAngle
      })
    }
  }
}

export default usePieChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { usePieChart, default: usePieChart }
}