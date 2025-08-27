import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { BarChartConfig, BarChartState } from '../types/bar-chart'
import { calculateBarDimensions, calculateValueScale, getBarPosition, sortBarData, getDefaultBarConfig } from '../utils/bar-chart'
import { useChartPerformance } from './useChartPerformance'
import { useReducedMotion } from './useReducedMotion'

export interface UseBarChartOptions {
  data: ChartDataPoint[]
  config?: Partial<BarChartConfig>
  variant?: 'simple' | 'grouped' | 'stacked'
  orientation?: 'horizontal' | 'vertical'
  width?: number
  height?: number
  onBarClick?: (data: ChartDataPoint) => void
  onBarHover?: (data: ChartDataPoint | null) => void
}

export const useBarChart = (options: UseBarChartOptions) => {
  const {
    data = [],
    config = {},
    variant = 'simple',
    orientation = 'vertical',
    width = 400,
    height = 300,
    onBarClick,
    onBarHover
  } = options

  const svgRef = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<BarChartState>({
    isLoading: false,
    error: null,
    data: [],
    hoveredBar: null,
    selectedBar: null
  })

  const performance = useChartPerformance()
  const prefersReducedMotion = useReducedMotion()

  // Merge default config with provided config
  const fullConfig = { ...getDefaultBarConfig(), ...config }
  
  // Override animation if user prefers reduced motion
  if (prefersReducedMotion) {
    fullConfig.animation.enabled = false
  }

  // Process and sort data
  const processedData = sortBarData(data, fullConfig.sortBy, fullConfig.sortOrder)

  // Update state when data changes
  useEffect(() => {
    setState(prev => ({ ...prev, data: processedData }))
  }, [data])

  // Main rendering effect
  useEffect(() => {
    if (!svgRef.current || !processedData.length) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      performance.startMeasurement('bar-chart-render')
      
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      // Set up dimensions with margins
      const margin = { top: 20, right: 20, bottom: 40, left: 50 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Calculate scales
      const { scale: bandScale, bandwidth } = calculateBarDimensions(
        processedData, 
        innerWidth, 
        innerHeight, 
        fullConfig, 
        orientation
      )
      
      const valueScale = calculateValueScale(
        processedData,
        innerWidth,
        innerHeight,
        orientation
      )

      // Create axes
      if (orientation === 'vertical') {
        // X axis (categories)
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(bandScale))

        // Y axis (values)
        g.append('g')
          .call(d3.axisLeft(valueScale))
      } else {
        // X axis (values)
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(valueScale))

        // Y axis (categories)
        g.append('g')
          .call(d3.axisLeft(bandScale))
      }

      // Create bars
      const bars = g.selectAll('.bar')
        .data(processedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', fullConfig.theme.colors.primary)
        .style('cursor', onBarClick ? 'pointer' : 'default')

      // Set initial positions and sizes
      bars.each(function(d) {
        const position = getBarPosition(d, bandScale, valueScale, orientation)
        d3.select(this)
          .attr('x', position.x)
          .attr('y', position.y)
          .attr('width', position.width)
          .attr('height', position.height)
      })

      // Add animations if enabled
      if (fullConfig.animation.enabled && !prefersReducedMotion) {
        bars
          .style('opacity', 0)
          .transition()
          .duration(fullConfig.animation.duration)
          .delay((_, i) => i * (fullConfig.animation.stagger || 50))
          .style('opacity', 1)
      }

      // Add event handlers
      bars
        .on('click', function(event, d) {
          setState(prev => ({ ...prev, selectedBar: d }))
          onBarClick?.(d)
        })
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          setState(prev => ({ ...prev, hoveredBar: d }))
          onBarHover?.(d)
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 1)
          setState(prev => ({ ...prev, hoveredBar: null }))
          onBarHover?.(null)
        })

      performance.endMeasurement('bar-chart-render')
      setState(prev => ({ ...prev, isLoading: false }))

    } catch (error) {
      console.error('Error rendering bar chart:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }

  }, [processedData, width, height, fullConfig, orientation, onBarClick, onBarHover, performance, prefersReducedMotion])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove()
      }
    }
  }, [])

  // Public methods
  const updateData = useCallback((newData: ChartDataPoint[]) => {
    setState(prev => ({ ...prev, data: newData }))
  }, [])

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedBar: null, hoveredBar: null }))
  }, [])

  const getBarAtPoint = useCallback((x: number, y: number): ChartDataPoint | null => {
    // This would implement hit testing - simplified for now
    return state.hoveredBar
  }, [state.hoveredBar])

  return {
    svgRef,
    state,
    config: fullConfig,
    processedData,
    updateData,
    clearSelection,
    getBarAtPoint,
    performance: performance.metrics
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useBarChart }
}