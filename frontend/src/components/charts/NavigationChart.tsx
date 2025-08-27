'use client'

import React, { useMemo, useCallback } from 'react'
import { BarChart } from './BarChart'
import { LineChart } from './LineChart'
import { PieChart } from './PieChart'
import { useDrillDown } from '../../contexts/DrillDownProvider'
import { useDrillDownData } from '../../hooks/useDrillDownData'

// Chart type union
type ChartType = 'bar' | 'line' | 'pie'

// Properly typed drill-down configuration
interface DrillDownConfig {
  enabled: boolean
  onDrillDown?: (item: any, targetLevel: string) => void
}

interface NavigationChartProps {
  chartType: ChartType
  data?: any[]
  config?: any
  width?: number
  height?: number
  className?: string
  drillDownConfig?: DrillDownConfig
  onBarClick?: (item: any, event?: any) => void
  onLineClick?: (item: any, event?: any) => void
  onSliceClick?: (item: any, event?: any) => void
}

export const NavigationChart: React.FC<NavigationChartProps> = ({
  chartType,
  data,
  config = {},
  width = 400,
  height = 300,
  className = '',
  drillDownConfig = { enabled: false },
  onBarClick,
  onLineClick,
  onSliceClick
}) => {
  const { state, drillDown } = useDrillDown()
  const { currentData, isLoading } = useDrillDownData({ 
    data: data ? {
      department: { id: 'dept-001', name: 'Information Technology', metrics: data },
      teams: [],
      individuals: []
    } : undefined 
  })

  // Use drill-down data if available, otherwise fall back to props data
  const chartData = useMemo(() => {
    return currentData.length > 0 ? currentData : (data || [])
  }, [currentData, data])

  // Helper function to get next navigation level (DRY principle)
  const getNextNavigationLevel = useCallback((currentLevel: typeof state.level): typeof state.level => {
    switch (currentLevel) {
      case 'department': return 'team'
      case 'team': return 'individual'
      default: return 'individual'
    }
  }, [])

  // Generic drill-down handler to reduce code duplication
  const handleDrillDownClick = useCallback(
    (item: any, event: any, fallbackHandler?: (item: any, event?: any) => void) => {
      if (drillDownConfig?.enabled && drillDownConfig?.onDrillDown) {
        const nextLevel = getNextNavigationLevel(state.level)
        drillDownConfig.onDrillDown(item, nextLevel)
        drillDown(item.id || item.label, nextLevel)
      } else if (fallbackHandler) {
        fallbackHandler(item, event)
      }
    },
    [drillDownConfig, state.level, drillDown, getNextNavigationLevel]
  )

  // Enhanced click handlers with drill-down capability
  const handleBarClick = useCallback((item: any, event?: any) => {
    handleDrillDownClick(item, event, onBarClick)
  }, [handleDrillDownClick, onBarClick])

  const handleLineClick = useCallback((item: any, event?: any) => {
    handleDrillDownClick(item, event, onLineClick)
  }, [handleDrillDownClick, onLineClick])

  const handleSliceClick = useCallback((item: any, event?: any) => {
    handleDrillDownClick(item, event, onSliceClick)
  }, [handleDrillDownClick, onSliceClick])

  // Add drill-down visual indicators to config
  const enhancedConfig = useMemo(() => {
    if (!drillDownConfig.enabled) return config

    return {
      ...config,
      showDrillDownIndicators: true,
      cursor: 'pointer',
      // Add visual indicators for drillable elements
      style: {
        ...config.style,
        '&:hover': {
          opacity: 0.8,
          ...config.style?.['&:hover']
        }
      }
    }
  }, [config, drillDownConfig.enabled])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div>Loading chart data...</div>
      </div>
    )
  }

  // Render appropriate chart type
  switch (chartType) {
    case 'bar':
      return (
        <BarChart
          data={chartData}
          config={enhancedConfig}
          width={width}
          height={height}
          className={className}
          onBarClick={handleBarClick}
        />
      )
    
    case 'line':
      return (
        <LineChart
          data={chartData}
          config={enhancedConfig}
          width={width}
          height={height}
          className={className}
          onPointClick={handleLineClick}
        />
      )
    
    case 'pie':
      return (
        <PieChart
          data={chartData}
          config={enhancedConfig}
          width={width}
          height={height}
          className={className}
          onSliceClick={handleSliceClick}
        />
      )
    
    default:
      return (
        <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
          <div>Unsupported chart type: {chartType}</div>
        </div>
      )
  }
}

export default NavigationChart