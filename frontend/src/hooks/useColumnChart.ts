import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { ColumnChartConfig, ColumnChartState } from '../types/column-chart'
import { calculateColumnDimensions, calculateColumnValueScale, getColumnPosition, sortColumnData, getDefaultColumnConfig } from '../utils/column-chart'
import { useChartPerformance } from './useChartPerformance'
import { useReducedMotion } from './useReducedMotion'

export interface UseColumnChartOptions {
  data: ChartDataPoint[]
  config?: Partial<ColumnChartConfig>
  variant?: 'simple' | 'grouped' | 'stacked'
  orientation?: 'horizontal' | 'vertical'
  width?: number
  height?: number
  onColumnClick?: (data: ChartDataPoint) => void
  onColumnHover?: (data: ChartDataPoint | null) => void
}

export const useColumnChart = (options: UseColumnChartOptions) => {
  const {
    data = [],
    config = {},
    variant = 'simple',
    orientation = 'vertical',
    width = 400,
    height = 300,
    onColumnClick,
    onColumnHover
  } = options

  const svgRef = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<ColumnChartState>({
    isLoading: false,
    error: null,
    data: [],
    hoveredColumn: null,
    selectedColumn: null
  })

  const performance = useChartPerformance()
  const prefersReducedMotion = useReducedMotion()

  // Merge default config with provided config
  const fullConfig = { ...getDefaultColumnConfig(), ...config }
  
  // Override animation if user prefers reduced motion
  if (prefersReducedMotion) {
    fullConfig.animation.enabled = false
  }

  // Process and sort data
  const processedData = sortColumnData(data, fullConfig.sortBy, fullConfig.sortOrder)

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
      performance.startMeasurement('column-chart-render')
      
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
      const { scale: bandScale } = calculateColumnDimensions(
        processedData, 
        innerWidth, 
        innerHeight, 
        fullConfig, 
        orientation
      )
      
      const valueScale = calculateColumnValueScale(
        processedData,
        innerWidth,
        innerHeight,
        orientation
      )

      // Create axes
      // X axis (categories)
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(bandScale))

      // Y axis (values)
      g.append('g')
        .call(d3.axisLeft(valueScale))

      // Create columns
      const columns = g.selectAll('.column')
        .data(processedData)
        .enter()
        .append('rect')
        .attr('class', 'column')
        .attr('fill', fullConfig.theme.colors.primary)
        .style('cursor', onColumnClick ? 'pointer' : 'default')

      // Set initial positions and sizes
      columns.each(function(d) {
        const position = getColumnPosition(d, bandScale, valueScale)
        d3.select(this)
          .attr('x', position.x)
          .attr('y', position.y)
          .attr('width', position.width)
          .attr('height', position.height)
      })

      // Add animations if enabled
      if (fullConfig.animation.enabled && !prefersReducedMotion) {
        // Animate from zero height
        columns
          .attr('height', 0)
          .attr('y', innerHeight)
          .transition()
          .duration(fullConfig.animation.duration)
          .delay((_, i) => i * (fullConfig.animation.stagger || 50))
          .attr('y', d => {
            const position = getColumnPosition(d, bandScale, valueScale)
            return position.y
          })
          .attr('height', d => {
            const position = getColumnPosition(d, bandScale, valueScale)
            return position.height
          })
      }

      // Add event handlers
      columns
        .on('click', function(event, d) {
          setState(prev => ({ ...prev, selectedColumn: d }))
          onColumnClick?.(d)
        })
        .on('mouseenter', function(event, d) {
          d3.select(this).style('opacity', 0.8)
          setState(prev => ({ ...prev, hoveredColumn: d }))
          onColumnHover?.(d)
        })
        .on('mouseleave', function() {
          d3.select(this).style('opacity', 1)
          setState(prev => ({ ...prev, hoveredColumn: null }))
          onColumnHover?.(null)
        })

      performance.endMeasurement('column-chart-render')
      setState(prev => ({ ...prev, isLoading: false }))

    } catch (error) {
      console.error('Error rendering column chart:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }

  }, [processedData, width, height, fullConfig, orientation, onColumnClick, onColumnHover, performance, prefersReducedMotion])

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
    setState(prev => ({ ...prev, selectedColumn: null, hoveredColumn: null }))
  }, [])

  const getColumnAtPoint = useCallback((x: number, y: number): ChartDataPoint | null => {
    // This would implement hit testing - simplified for now
    return state.hoveredColumn
  }, [state.hoveredColumn])

  return {
    svgRef,
    state,
    config: fullConfig,
    processedData,
    updateData,
    clearSelection,
    getColumnAtPoint,
    performance: performance.getMetrics()
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useColumnChart }
}