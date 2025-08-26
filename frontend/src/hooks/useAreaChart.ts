import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'
import { AreaChartConfig, AreaChartState } from '../types/area-chart'
import { generateAreaPath, getCurveInterpolation, generateAreaGradient } from '../utils/line-path-generators'
import { calculateStackedAreas, calculateStreamGraph } from '../utils/area-calculations'
import { adaptTimeScale } from '../utils/time-scales'
import { calculateTimeRange } from '../utils/time-series'

export interface UseAreaChartOptions {
  data: TimeSeriesData[]
  config?: AreaChartConfig
  variant?: 'simple' | 'stacked' | 'stream'
  width?: number
  height?: number
  onPointClick?: (point: TimeSeriesDataPoint, series: TimeSeriesData) => void
  onPointHover?: (point: TimeSeriesDataPoint | null, series?: TimeSeriesData) => void
  onZoom?: (domain: [Date, Date]) => void
}

export const useAreaChart = ({
  data,
  config = {},
  variant = 'simple',
  width = 400,
  height = 300,
  onPointClick,
  onPointHover,
  onZoom
}: UseAreaChartOptions) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<AreaChartState>({
    isLoading: false,
    error: null,
    data: [],
    stackedData: undefined,
    hoveredPoint: null,
    selectedPoint: null,
    zoomDomain: null,
    crosshairPosition: null
  })

  // Default configuration
  const finalConfig: Required<AreaChartConfig> = {
    interpolation: 'linear',
    stackedMode: variant === 'stacked' ? 'normal' : variant === 'stream' ? 'stream' : 'none',
    showPoints: false,
    pointRadius: 4,
    strokeWidth: 1,
    areaOpacity: 0.7,
    showGrid: true,
    showLegend: true,
    zoomable: false,
    pannable: false,
    gradientFill: true,
    theme: { primary: '#3b82f6', secondary: '#64748b', background: '#ffffff' },
    animation: { 
      duration: 800, 
      easing: 'ease-in-out', 
      enabled: true,
      drawDuration: 1000,
      pointDelay: 100,
      morphDuration: 500,
      pathLength: true
    },
    accessibility: { enabled: true, announceChanges: true },
    missingData: { 
      detectGaps: true, 
      gapThreshold: 86400000, 
      interpolationMethod: 'linear', 
      showGapIndicators: true 
    },
    ...config
  }

  // Calculate chart dimensions
  const margins = { top: 20, right: 30, bottom: 40, left: 60 }
  const chartWidth = width - margins.left - margins.right
  const chartHeight = height - margins.top - margins.bottom

  // Render chart
  const renderChart = useCallback(() => {
    if (!svgRef.current || !data.length) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      // Create defs for gradients
      const defs = svg.append('defs')

      // Create main group
      const g = svg
        .append('g')
        .attr('transform', `translate(${margins.left},${margins.top})`)

      // Calculate time domain
      const timeDomain = state.zoomDomain || calculateTimeRange(data)
      
      // Create scales
      const { scale: xScale, tickCount, tickFormat } = adaptTimeScale(
        data.filter(series => 
          !state.zoomDomain || series.points.some(p => 
            p.date >= state.zoomDomain![0] && p.date <= state.zoomDomain![1]
          )
        ),
        chartWidth,
        margins
      )

      // Calculate stacked data if needed
      let processedData: Array<{
        seriesId: string
        label: string
        color?: string
        points: Array<{ date: Date; value: number; y0: number; y1: number }>
      }> = []

      if (variant === 'stacked') {
        processedData = calculateStackedAreas(data, 'none')
        setState(prev => ({ ...prev, stackedData: processedData.map(d => ({ series: data.find(s => s.id === d.seriesId)!, baseline: d.points.map(p => p.y0) })) }))
      } else if (variant === 'stream') {
        processedData = calculateStreamGraph(data, 'wiggle')
        setState(prev => ({ ...prev, stackedData: processedData.map(d => ({ series: data.find(s => s.id === d.seriesId)!, baseline: d.points.map(p => p.y0) })) }))
      } else {
        // Simple area - convert to stacked format for consistent handling
        processedData = data.map(series => ({
          seriesId: series.id,
          label: series.label,
          color: series.color,
          points: series.points.map(point => ({
            date: point.date,
            value: point.value,
            y0: 0,
            y1: point.value
          }))
        }))
      }

      // Calculate y domain from processed data
      let yMin = Infinity
      let yMax = -Infinity

      processedData.forEach(series => {
        const filteredPoints = state.zoomDomain
          ? series.points.filter(p => p.date >= state.zoomDomain![0] && p.date <= state.zoomDomain![1])
          : series.points

        filteredPoints.forEach(point => {
          if (variant === 'simple') {
            if (point.y1 < yMin) yMin = point.y1
            if (point.y1 > yMax) yMax = point.y1
          } else {
            if (point.y0 < yMin) yMin = point.y0
            if (point.y1 > yMax) yMax = point.y1
          }
        })
      })

      if (yMin === Infinity) yMin = 0
      if (yMax === -Infinity) yMax = 1

      // Add padding to y domain
      const yPadding = Math.abs(yMax - yMin) * 0.1
      const yScale = d3.scaleLinear()
        .domain([yMin - yPadding, yMax + yPadding])
        .range([chartHeight, 0])
        .nice()

      // Draw grid if enabled
      if (finalConfig.showGrid) {
        // X grid
        g.selectAll('.grid-x')
          .data(xScale.ticks(tickCount))
          .enter()
          .append('line')
          .attr('class', 'grid-x')
          .attr('x1', d => xScale(d))
          .attr('x2', d => xScale(d))
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3)

        // Y grid
        g.selectAll('.grid-y')
          .data(yScale.ticks(6))
          .enter()
          .append('line')
          .attr('class', 'grid-y')
          .attr('x1', 0)
          .attr('x2', chartWidth)
          .attr('y1', d => yScale(d))
          .attr('y2', d => yScale(d))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1)
          .attr('opacity', 0.3)
      }

      // Draw axes
      const xAxis = d3.axisBottom(xScale)
        .ticks(tickCount)
        .tickFormat(tickFormat)

      const yAxis = d3.axisLeft(yScale)
        .ticks(6)

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(xAxis)

      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)

      // Get curve interpolation
      const curve = getCurveInterpolation(finalConfig.interpolation)

      // Color scheme
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      // Draw areas for each series
      processedData.forEach((series, seriesIndex) => {
        const seriesGroup = g.append('g')
          .attr('class', `series-${series.seriesId}`)

        const filteredPoints = state.zoomDomain
          ? series.points.filter(p => p.date >= state.zoomDomain![0] && p.date <= state.zoomDomain![1])
          : series.points

        if (filteredPoints.length === 0) return

        const color = series.color || colorScale(seriesIndex.toString())

        // Create gradient if enabled
        if (finalConfig.gradientFill) {
          const gradientId = `gradient-${series.seriesId}`
          defs.append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('x2', '0%')
            .attr('y1', '0%')
            .attr('y2', '100%')
            .selectAll('stop')
            .data([
              { offset: '0%', color, opacity: finalConfig.areaOpacity },
              { offset: '100%', color, opacity: finalConfig.areaOpacity * 0.1 }
            ])
            .enter()
            .append('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color)
            .attr('stop-opacity', d => d.opacity)
        }

        // Draw area
        const area = d3.area<{ date: Date; value: number; y0: number; y1: number }>()
          .x(d => xScale(d.date))
          .y0(d => yScale(d.y0))
          .y1(d => yScale(d.y1))
          .curve(curve)

        const areaPath = seriesGroup
          .append('path')
          .datum(filteredPoints)
          .attr('class', 'area')
          .attr('d', area)
          .attr('fill', finalConfig.gradientFill ? `url(#gradient-${series.seriesId})` : color)
          .attr('fill-opacity', finalConfig.gradientFill ? 1 : finalConfig.areaOpacity)

        // Draw stroke on top edge
        const line = d3.line<{ date: Date; value: number; y0: number; y1: number }>()
          .x(d => xScale(d.date))
          .y(d => yScale(d.y1))
          .curve(curve)

        const linePath = seriesGroup
          .append('path')
          .datum(filteredPoints)
          .attr('class', 'area-stroke')
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', finalConfig.strokeWidth)

        // Animate area drawing if enabled
        if (finalConfig.animation.enabled) {
          const pathElement = linePath.node() as SVGPathElement
          if (pathElement) {
            const length = pathElement.getTotalLength()
            
            linePath
              .style('stroke-dasharray', `${length} ${length}`)
              .style('stroke-dashoffset', length)
              .transition()
              .duration(finalConfig.animation.drawDuration || 1000)
              .delay(seriesIndex * 200)
              .ease(d3.easeLinear)
              .style('stroke-dashoffset', 0)

            // Fade in area after line is drawn
            areaPath
              .style('opacity', 0)
              .transition()
              .duration(finalConfig.animation.duration)
              .delay(seriesIndex * 200 + (finalConfig.animation.drawDuration || 1000) * 0.5)
              .style('opacity', 1)
          }
        }

        // Draw points if enabled
        if (finalConfig.showPoints) {
          seriesGroup.selectAll('.point')
            .data(filteredPoints)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.y1))
            .attr('r', finalConfig.pointRadius)
            .attr('fill', color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
              d3.select(this)
                .transition()
                .duration(150)
                .attr('r', finalConfig.pointRadius * 1.5)

              const originalPoint = data.find(s => s.id === series.seriesId)?.points.find(p => p.date.getTime() === d.date.getTime())
              if (originalPoint) {
                const originalSeries = data.find(s => s.id === series.seriesId)!
                setState(prev => ({ 
                  ...prev, 
                  hoveredPoint: { point: originalPoint, series: originalSeries },
                  crosshairPosition: { x: xScale(d.date), y: yScale(d.y1) }
                }))
                
                if (onPointHover) onPointHover(originalPoint, originalSeries)
              }
            })
            .on('mouseout', function() {
              d3.select(this)
                .transition()
                .duration(150)
                .attr('r', finalConfig.pointRadius)

              setState(prev => ({ 
                ...prev, 
                hoveredPoint: null,
                crosshairPosition: null 
              }))
              
              if (onPointHover) onPointHover(null)
            })
            .on('click', function(event, d) {
              const originalPoint = data.find(s => s.id === series.seriesId)?.points.find(p => p.date.getTime() === d.date.getTime())
              if (originalPoint) {
                const originalSeries = data.find(s => s.id === series.seriesId)!
                setState(prev => ({ 
                  ...prev, 
                  selectedPoint: { point: originalPoint, series: originalSeries } 
                }))
                
                if (onPointClick) onPointClick(originalPoint, originalSeries)
              }
            })

          // Stagger point animation if enabled
          if (finalConfig.animation.enabled) {
            seriesGroup.selectAll('.point')
              .style('opacity', 0)
              .transition()
              .delay((d, i) => seriesIndex * 200 + (finalConfig.animation.drawDuration || 1000) + i * (finalConfig.animation.pointDelay || 100))
              .duration(finalConfig.animation.duration)
              .style('opacity', 1)
          }
        }
      })

      // Draw crosshair if there's a hovered point
      if (state.crosshairPosition) {
        const crosshair = g.append('g').attr('class', 'crosshair')
        
        crosshair.append('line')
          .attr('x1', state.crosshairPosition.x)
          .attr('x2', state.crosshairPosition.x)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#64748b')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.7)
      }

      // Add zoom behavior if enabled
      if (finalConfig.zoomable) {
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 10])
          .on('zoom', function(event) {
            const newXScale = event.transform.rescaleX(xScale)
            const newDomain = newXScale.domain() as [Date, Date]
            
            setState(prev => ({ ...prev, zoomDomain: newDomain }))
            
            if (onZoom) onZoom(newDomain)
          })

        svg.call(zoom)
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: data 
      }))

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }))
    }
  }, [data, config, variant, width, height, state.zoomDomain, state.crosshairPosition, finalConfig, margins, chartWidth, chartHeight, onPointClick, onPointHover, onZoom])

  // Effect to render chart when dependencies change
  useEffect(() => {
    renderChart()
  }, [renderChart])

  // Reset zoom function
  const resetZoom = useCallback(() => {
    setState(prev => ({ ...prev, zoomDomain: null }))
  }, [])

  // Performance metrics (simplified)
  const performance = {
    renderTime: 0, // Would be calculated in real implementation
    pointCount: data.reduce((sum, series) => sum + series.points.length, 0)
  }

  return {
    svgRef,
    state,
    resetZoom,
    performance
  }
}

export default useAreaChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useAreaChart, default: useAreaChart }
}