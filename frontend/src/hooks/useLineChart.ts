import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'
import { LineChartConfig, LineChartState } from '../types/line-chart'
import { generateLinePath, getCurveInterpolation, createAnimatedPath } from '../utils/line-path-generators'
import { adaptTimeScale } from '../utils/time-scales'
import { calculateTimeRange } from '../utils/time-series'

export interface UseLineChartOptions {
  data: TimeSeriesData[]
  config?: LineChartConfig
  width?: number
  height?: number
  onPointClick?: (point: TimeSeriesDataPoint, series: TimeSeriesData) => void
  onPointHover?: (point: TimeSeriesDataPoint | null, series?: TimeSeriesData) => void
  onZoom?: (domain: [Date, Date]) => void
}

export const useLineChart = ({
  data,
  config = {},
  width = 400,
  height = 300,
  onPointClick,
  onPointHover,
  onZoom
}: UseLineChartOptions) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [state, setState] = useState<LineChartState>({
    isLoading: false,
    error: null,
    data: [],
    hoveredPoint: null,
    selectedPoint: null,
    zoomDomain: null,
    crosshairPosition: null
  })

  // Default configuration
  const finalConfig: Required<LineChartConfig> = {
    interpolation: 'linear',
    showPoints: true,
    pointRadius: 4,
    strokeWidth: 2,
    showGrid: true,
    showLegend: true,
    zoomable: false,
    pannable: false,
    showArea: false,
    areaOpacity: 0.3,
    theme: { primary: '#3b82f6', secondary: '#64748b', background: '#ffffff' },
    animation: { duration: 300, easing: 'ease-in-out', enabled: true },
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

      // Calculate y domain
      let yMin = Infinity
      let yMax = -Infinity

      data.forEach(series => {
        const filteredPoints = state.zoomDomain
          ? series.points.filter(p => p.date >= state.zoomDomain![0] && p.date <= state.zoomDomain![1])
          : series.points

        filteredPoints.forEach(point => {
          if (point.value < yMin) yMin = point.value
          if (point.value > yMax) yMax = point.value
        })
      })

      if (yMin === Infinity) yMin = 0
      if (yMax === -Infinity) yMax = 1

      // Add padding to y domain
      const yPadding = (yMax - yMin) * 0.1
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
          .attr('opacity', 0.5)

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
          .attr('opacity', 0.5)
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

      // Draw lines and points for each series
      data.forEach((series, seriesIndex) => {
        const seriesGroup = g.append('g')
          .attr('class', `series-${series.id}`)

        const filteredPoints = state.zoomDomain
          ? series.points.filter(p => p.date >= state.zoomDomain![0] && p.date <= state.zoomDomain![1])
          : series.points

        if (filteredPoints.length === 0) return

        const color = series.color || finalConfig.theme.primary

        // Draw area if enabled
        if (finalConfig.showArea) {
          const area = d3.area<TimeSeriesDataPoint>()
            .x(d => xScale(d.date))
            .y0(chartHeight)
            .y1(d => yScale(d.value))
            .curve(curve)

          const areaPath = seriesGroup
            .append('path')
            .datum(filteredPoints)
            .attr('class', 'area')
            .attr('d', area)
            .attr('fill', color)
            .attr('fill-opacity', finalConfig.areaOpacity)
        }

        // Draw line
        const line = d3.line<TimeSeriesDataPoint>()
          .x(d => xScale(d.date))
          .y(d => yScale(d.value))
          .curve(curve)

        const linePath = seriesGroup
          .append('path')
          .datum(filteredPoints)
          .attr('class', 'line')
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', finalConfig.strokeWidth)

        // Animate line drawing if enabled
        if (finalConfig.animation.enabled) {
          const pathElement = linePath.node() as SVGPathElement
          if (pathElement) {
            createAnimatedPath(pathElement, finalConfig.animation.duration)
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
            .attr('cy', d => yScale(d.value))
            .attr('r', finalConfig.pointRadius)
            .attr('fill', color)
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
              d3.select(this)
                .transition()
                .duration(150)
                .attr('r', finalConfig.pointRadius * 1.5)

              setState(prev => ({ 
                ...prev, 
                hoveredPoint: { point: d, series },
                crosshairPosition: { x: xScale(d.date), y: yScale(d.value) }
              }))
              
              if (onPointHover) onPointHover(d, series)
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
              setState(prev => ({ 
                ...prev, 
                selectedPoint: { point: d, series } 
              }))
              
              if (onPointClick) onPointClick(d, series)
            })

          // Stagger point animation if enabled
          if (finalConfig.animation.enabled) {
            seriesGroup.selectAll('.point')
              .style('opacity', 0)
              .transition()
              .delay((d, i) => i * 50)
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
  }, [data, config, width, height, state.zoomDomain, state.crosshairPosition, finalConfig, margins, chartWidth, chartHeight, onPointClick, onPointHover, onZoom])

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

export default useLineChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useLineChart, default: useLineChart }
}