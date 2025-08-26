import { useState, useEffect, useMemo, useCallback } from 'react'
import { ChartDataPoint } from '../types/store'
import { ChartSeries } from '../types/chart-variants'
import { calculateBarDimensions, calculateValueScale } from '../utils/bar-chart'
import { calculateGroupedLayout } from '../utils/grouped-chart'
import { calculateStackedLayout } from '../utils/stacked-chart'
import { getOptimalOrientation, getRecommendedDimensions, shouldRotateLabels } from '../utils/chart-orientation'
import { useBreakpoint } from './useBreakpoint'
import { useResizeObserver } from './useResizeObserver'

export interface UseBarChartLayoutOptions {
  data: ChartDataPoint[]
  seriesData?: ChartSeries[]
  variant?: 'simple' | 'grouped' | 'stacked'
  orientation?: 'horizontal' | 'vertical' | 'auto'
  containerRef?: React.RefObject<HTMLElement>
  responsive?: boolean
  barPadding?: number
  groupPadding?: number
}

export const useBarChartLayout = (options: UseBarChartLayoutOptions) => {
  const {
    data = [],
    seriesData = [],
    variant = 'simple',
    orientation = 'auto',
    containerRef,
    responsive = true,
    barPadding = 0.1,
    groupPadding = 0.05
  } = options

  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 40, left: 50 })
  
  const breakpoint = useBreakpoint()
  const containerSize = useResizeObserver(containerRef)

  // Calculate optimal orientation
  const optimalOrientation = useMemo(() => {
    if (orientation !== 'auto') return orientation
    return getOptimalOrientation(data, dimensions.width, dimensions.height)
  }, [orientation, data, dimensions])

  // Calculate recommended dimensions based on data
  const recommendedDimensions = useMemo(() => {
    return getRecommendedDimensions(data, optimalOrientation, dimensions.width, dimensions.height)
  }, [data, optimalOrientation, dimensions])

  // Check if labels should be rotated
  const labelRotation = useMemo(() => {
    if (optimalOrientation === 'horizontal') return { shouldRotate: false, rotation: 0 }
    
    const innerWidth = dimensions.width - margins.left - margins.right
    return shouldRotateLabels(data, innerWidth)
  }, [optimalOrientation, data, dimensions.width, margins])

  // Adjust margins based on label rotation and breakpoint
  useEffect(() => {
    let newMargins = { top: 20, right: 20, bottom: 40, left: 50 }

    // Adjust for rotated labels
    if (labelRotation.shouldRotate) {
      const averageLabelLength = data.reduce((sum, item) => {
        const label = item.label || String(item.x)
        return sum + label.length
      }, 0) / (data.length || 1)

      if (labelRotation.rotation === -90) {
        newMargins.bottom = Math.max(40, averageLabelLength * 8)
      } else if (labelRotation.rotation === -45) {
        newMargins.bottom = Math.max(40, averageLabelLength * 6)
      }
    }

    // Adjust for different breakpoints
    switch (breakpoint) {
      case 'mobile':
        newMargins = { top: 15, right: 15, bottom: newMargins.bottom, left: 40 }
        break
      case 'tablet':
        newMargins = { top: 18, right: 18, bottom: newMargins.bottom, left: 45 }
        break
      case 'desktop':
      default:
        newMargins = { top: 20, right: 20, bottom: newMargins.bottom, left: 50 }
        break
    }

    // Add extra margin for grouped/stacked charts with legends
    if ((variant === 'grouped' || variant === 'stacked') && seriesData.length > 1) {
      newMargins.top += 30 // Space for legend
    }

    setMargins(newMargins)
  }, [labelRotation, breakpoint, variant, seriesData.length, data])

  // Update dimensions based on container size
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      setDimensions({ width: containerSize.width, height: containerSize.height })
    } else if (responsive) {
      // Use recommended dimensions if no container
      setDimensions(recommendedDimensions)
    }
  }, [containerSize, responsive, recommendedDimensions])

  // Calculate layout based on variant
  const layout = useMemo(() => {
    const innerWidth = dimensions.width - margins.left - margins.right
    const innerHeight = dimensions.height - margins.top - margins.bottom

    switch (variant) {
      case 'simple':
        const simpleLayout = calculateBarDimensions(
          data, 
          innerWidth, 
          innerHeight,
          { barPadding, groupPadding },
          optimalOrientation
        )
        const simpleValueScale = calculateValueScale(
          data,
          innerWidth,
          innerHeight,
          optimalOrientation
        )
        
        return {
          type: 'simple',
          bandScale: simpleLayout.scale,
          valueScale: simpleValueScale,
          bandwidth: simpleLayout.bandwidth,
          innerWidth,
          innerHeight
        }

      case 'grouped':
        const groupedLayout = calculateGroupedLayout(
          seriesData,
          innerWidth,
          innerHeight,
          groupPadding,
          0.02, // series padding
          optimalOrientation
        )
        
        return {
          type: 'grouped',
          groupScale: groupedLayout.groupScale,
          seriesScale: groupedLayout.seriesScale,
          valueScale: groupedLayout.valueScale,
          groupBandwidth: groupedLayout.groupBandwidth,
          seriesBandwidth: groupedLayout.seriesBandwidth,
          innerWidth,
          innerHeight
        }

      case 'stacked':
        const stackedLayout = calculateStackedLayout(
          seriesData,
          innerWidth,
          innerHeight,
          barPadding,
          optimalOrientation
        )
        
        return {
          type: 'stacked',
          bandScale: stackedLayout.bandScale,
          valueScale: stackedLayout.valueScale,
          stackedData: stackedLayout.stackedData,
          bandwidth: stackedLayout.bandwidth,
          innerWidth,
          innerHeight
        }

      default:
        throw new Error(`Unsupported variant: ${variant}`)
    }
  }, [variant, data, seriesData, dimensions, margins, barPadding, groupPadding, optimalOrientation])

  // Get position for a specific data point
  const getItemPosition = useCallback((
    dataPoint: ChartDataPoint,
    seriesId?: string
  ) => {
    switch (layout.type) {
      case 'simple':
        const x = String(dataPoint.x)
        const bandPosition = layout.bandScale(x) || 0
        const valuePosition = layout.valueScale(dataPoint.y)
        
        if (optimalOrientation === 'vertical') {
          return {
            x: bandPosition,
            y: valuePosition,
            width: layout.bandwidth,
            height: Math.abs(layout.valueScale(0) - valuePosition)
          }
        } else {
          return {
            x: Math.min(layout.valueScale(0), valuePosition),
            y: bandPosition,
            width: Math.abs(valuePosition - layout.valueScale(0)),
            height: layout.bandwidth
          }
        }

      case 'grouped':
        if (!seriesId) throw new Error('Series ID required for grouped layout')
        
        const groupPosition = layout.groupScale(String(dataPoint.x)) || 0
        const seriesOffset = layout.seriesScale(seriesId) || 0
        const groupedValuePosition = layout.valueScale(dataPoint.y)
        const zeroPosition = layout.valueScale(0)
        
        if (optimalOrientation === 'vertical') {
          return {
            x: groupPosition + seriesOffset,
            y: Math.min(zeroPosition, groupedValuePosition),
            width: layout.seriesBandwidth,
            height: Math.abs(groupedValuePosition - zeroPosition)
          }
        } else {
          return {
            x: Math.min(zeroPosition, groupedValuePosition),
            y: groupPosition + seriesOffset,
            width: Math.abs(groupedValuePosition - zeroPosition),
            height: layout.seriesBandwidth
          }
        }

      case 'stacked':
        if (!seriesId) throw new Error('Series ID required for stacked layout')
        
        const layer = layout.stackedData.find(d => d.key === seriesId)
        if (!layer) throw new Error(`Series ${seriesId} not found in stacked data`)
        
        const stackPoint = layer.find(d => String(d.data.x) === String(dataPoint.x))
        if (!stackPoint) throw new Error(`Data point not found in stacked layout`)
        
        const y0 = layout.valueScale(stackPoint[0])
        const y1 = layout.valueScale(stackPoint[1])
        const stackBandPosition = layout.bandScale(String(dataPoint.x)) || 0
        
        if (optimalOrientation === 'vertical') {
          return {
            x: stackBandPosition,
            y: Math.min(y0, y1),
            width: layout.bandwidth,
            height: Math.abs(y1 - y0)
          }
        } else {
          return {
            x: Math.min(y0, y1),
            y: stackBandPosition,
            width: Math.abs(y1 - y0),
            height: layout.bandwidth
          }
        }

      default:
        throw new Error('Invalid layout type')
    }
  }, [layout, optimalOrientation])

  // Check if layout needs update
  const needsLayoutUpdate = useCallback((
    newData: ChartDataPoint[],
    newSeriesData: ChartSeries[] = []
  ) => {
    // Simple heuristic - could be more sophisticated
    return (
      newData.length !== data.length ||
      newSeriesData.length !== seriesData.length ||
      JSON.stringify(newData.map(d => d.x)) !== JSON.stringify(data.map(d => d.x))
    )
  }, [data, seriesData])

  return {
    // Layout properties
    dimensions,
    margins,
    orientation: optimalOrientation,
    labelRotation,
    layout,
    
    // Layout info
    innerWidth: dimensions.width - margins.left - margins.right,
    innerHeight: dimensions.height - margins.top - margins.bottom,
    
    // Methods
    getItemPosition,
    needsLayoutUpdate,
    
    // Responsive properties
    breakpoint,
    isResponsive: responsive
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useBarChartLayout }
}