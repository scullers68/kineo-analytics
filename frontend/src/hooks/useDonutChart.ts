import { useState, useEffect, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { 
  DonutChartConfig, 
  DonutCenterContent, 
  DonutChartState, 
  DonutInteractionHandlers 
} from '../types/donut-chart'
import { PieDataPoint, PieSlice, PieInteractionConfig } from '../types/pie-chart'
import { usePieChart, UsePieChartOptions } from './usePieChart'
import { calculateInnerRadius } from '../utils/pie-chart-math'

export interface UseDonutChartOptions extends Omit<UsePieChartOptions, 'config'> {
  config?: Partial<DonutChartConfig>
  centerContent?: DonutCenterContent
  onCenterClick?: () => void
  onCenterHover?: (isHovering: boolean) => void
}

export const useDonutChart = ({
  data,
  config = {},
  interactions = {},
  animations = {},
  responsive = {},
  centerContent,
  onSliceClick,
  onSliceHover,
  onCenterClick,
  onCenterHover
}: UseDonutChartOptions) => {
  const [donutState, setDonutState] = useState<DonutChartState>({
    slices: [],
    selectedSlices: [],
    hoveredSlice: null,
    explodedSlices: [],
    hiddenSlices: [],
    drillDownPath: [],
    centerContent: centerContent || { title: '', value: '' },
    isAnimatingCenter: false
  })

  // Calculate inner radius for donut
  const donutConfig = useMemo(() => {
    const outerRadius = config.outerRadius || 100
    const innerRadius = config.innerRadius || calculateInnerRadius(outerRadius, 0.5)
    
    return {
      ...config,
      innerRadius,
      outerRadius
    }
  }, [config])

  // Use the base pie chart hook with donut configuration
  const pieChart = usePieChart({
    data,
    config: donutConfig,
    interactions,
    animations,
    responsive,
    onSliceClick: (slice, event) => {
      // Update center content on slice interaction
      updateCenterContent({
        title: slice.data.label,
        value: slice.data.value,
        subtitle: `${(slice.data.percentage || 0).toFixed(1)}%`
      })
      
      onSliceClick?.(slice, event)
    },
    onSliceHover: (slice, event) => {
      // Temporarily update center content on hover
      if (slice && interactions.enableHover) {
        updateCenterContent({
          title: slice.data.label,
          value: slice.data.value,
          subtitle: `${(slice.data.percentage || 0).toFixed(1)}%`
        })
      } else if (!slice && centerContent) {
        // Restore original center content when not hovering
        updateCenterContent(centerContent)
      }
      
      onSliceHover?.(slice, event)
    }
  })

  // Sync donut state with pie chart state
  useEffect(() => {
    setDonutState(prev => ({
      ...prev,
      slices: pieChart.chartState.slices,
      selectedSlices: pieChart.chartState.selectedSlices,
      hoveredSlice: pieChart.chartState.hoveredSlice,
      explodedSlices: pieChart.chartState.explodedSlices,
      hiddenSlices: pieChart.chartState.hiddenSlices,
      drillDownPath: pieChart.chartState.drillDownPath
    }))
  }, [pieChart.chartState])

  // Update center content function
  const updateCenterContent = useCallback((newContent: Partial<DonutCenterContent>) => {
    setDonutState(prev => ({
      ...prev,
      centerContent: { ...prev.centerContent, ...newContent },
      isAnimatingCenter: true
    }))

    // Reset animation flag after animation completes
    setTimeout(() => {
      setDonutState(prev => ({ ...prev, isAnimatingCenter: false }))
    }, animations.duration || 300)
  }, [animations.duration])

  // Enhanced render function that includes center content
  const renderDonutChart = useCallback(() => {
    if (!pieChart.svgRef.current || !donutState.slices.length) return

    // First render the base pie chart
    pieChart.renderChart()

    const svg = d3.select(pieChart.svgRef.current)
    const centerGroup = svg.select('g')

    // Remove existing center content
    centerGroup.selectAll('.center-content').remove()

    // Add center content group
    const centerContentGroup = centerGroup
      .append('g')
      .attr('class', 'center-content')
      .style('cursor', onCenterClick ? 'pointer' : 'default')

    // Add center background circle (optional)
    if (config.centerContent?.value || donutState.centerContent.title) {
      centerContentGroup
        .append('circle')
        .attr('r', donutConfig.innerRadius! * 0.9)
        .attr('fill', 'transparent')
        .attr('stroke', 'none')
    }

    // Add center title
    if (donutState.centerContent.title) {
      centerContentGroup
        .append('text')
        .attr('class', 'center-title')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(donutState.centerContent.title)
        .style('opacity', donutState.isAnimatingCenter ? 0 : 1)
        .transition()
        .duration(animations.duration || 300)
        .style('opacity', 1)
    }

    // Add center value
    if (donutState.centerContent.value !== undefined) {
      centerContentGroup
        .append('text')
        .attr('class', 'center-value')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.5em')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#007bff')
        .text(String(donutState.centerContent.value))
        .style('opacity', donutState.isAnimatingCenter ? 0 : 1)
        .transition()
        .duration(animations.duration || 300)
        .style('opacity', 1)
    }

    // Add center subtitle
    if (donutState.centerContent.subtitle) {
      centerContentGroup
        .append('text')
        .attr('class', 'center-subtitle')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(donutState.centerContent.subtitle)
        .style('opacity', donutState.isAnimatingCenter ? 0 : 1)
        .transition()
        .duration(animations.duration || 300)
        .style('opacity', 1)
    }

    // Add center icon if provided
    if (donutState.centerContent.icon) {
      centerContentGroup
        .append('text')
        .attr('class', 'center-icon')
        .attr('text-anchor', 'middle')
        .attr('dy', '-2em')
        .style('font-size', '24px')
        .text(String(donutState.centerContent.icon))
        .style('opacity', donutState.isAnimatingCenter ? 0 : 1)
        .transition()
        .duration(animations.duration || 300)
        .style('opacity', 1)
    }

    // Add trend indicator if provided
    if (donutState.centerContent.trend) {
      const trendGroup = centerContentGroup
        .append('g')
        .attr('class', 'trend-indicator')
        .attr('transform', 'translate(0, 2.5em)')

      // Trend arrow
      const trendColor = donutState.centerContent.trend.direction === 'up' ? '#28a745' : 
                        donutState.centerContent.trend.direction === 'down' ? '#dc3545' : '#6c757d'
      
      trendGroup
        .append('text')
        .attr('text-anchor', 'start')
        .attr('x', -10)
        .style('font-size', '12px')
        .style('fill', trendColor)
        .text(donutState.centerContent.trend.direction === 'up' ? '▲' : 
              donutState.centerContent.trend.direction === 'down' ? '▼' : '●')

      // Trend value
      trendGroup
        .append('text')
        .attr('text-anchor', 'start')
        .attr('x', 5)
        .style('font-size', '11px')
        .style('fill', trendColor)
        .text(`${donutState.centerContent.trend.value}${donutState.centerContent.trend.label || ''}`)
    }

    // Add center click handler
    if (onCenterClick) {
      centerContentGroup.on('click', onCenterClick)
    }

    // Add center hover handlers
    if (onCenterHover) {
      centerContentGroup
        .on('mouseenter', () => onCenterHover(true))
        .on('mouseleave', () => onCenterHover(false))
    }

  }, [pieChart, donutState, donutConfig, animations, config, onCenterClick, onCenterHover])

  // Override the base render function
  useEffect(() => {
    renderDonutChart()
  }, [renderDonutChart])

  // Calculate total value for center display
  const totalValue = useMemo(() => {
    return donutState.slices.reduce((sum, slice) => sum + slice.value, 0)
  }, [donutState.slices])

  // Calculate average value for center display
  const averageValue = useMemo(() => {
    return donutState.slices.length > 0 ? totalValue / donutState.slices.length : 0
  }, [totalValue, donutState.slices.length])

  return {
    ...pieChart,
    donutState,
    centerContent: donutState.centerContent,
    totalValue,
    averageValue,
    
    // Donut-specific methods
    updateCenterContent,
    setCenterContent: (content: DonutCenterContent) => {
      setDonutState(prev => ({ ...prev, centerContent: content }))
    },
    
    // Enhanced render function
    renderChart: renderDonutChart,
    
    // Center content utilities
    resetCenterContent: () => {
      if (centerContent) {
        updateCenterContent(centerContent)
      }
    },
    
    showTotalInCenter: () => {
      updateCenterContent({
        title: 'Total',
        value: totalValue,
        subtitle: `${donutState.slices.length} items`
      })
    },
    
    showAverageInCenter: () => {
      updateCenterContent({
        title: 'Average',
        value: Math.round(averageValue * 100) / 100,
        subtitle: 'per item'
      })
    },
    
    showSliceInCenter: (sliceIndex: number) => {
      const slice = donutState.slices[sliceIndex]
      if (slice) {
        updateCenterContent({
          title: slice.data.label,
          value: slice.data.value,
          subtitle: `${(slice.data.percentage || 0).toFixed(1)}%`
        })
      }
    }
  }
}

export default useDonutChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useDonutChart, default: useDonutChart }
}