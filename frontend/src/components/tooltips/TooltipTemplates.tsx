/**
 * TooltipTemplates Component
 * 
 * Pre-built templates for different chart types and data formats
 * Task: task-0023 - Rich Hover Effects and Contextual Tooltips
 */

import React from 'react'
import { TooltipContent, TooltipDataItem } from '../../types/tooltips'

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  metadata?: Record<string, any>
}

export interface TemplateProps {
  dataPoint: ChartDataPoint
  chartType: 'bar' | 'line' | 'pie'
  seriesLabel?: string
}

export const createTooltipContent = ({ 
  dataPoint, 
  chartType, 
  seriesLabel 
}: TemplateProps): TooltipContent => {
  const baseData: TooltipDataItem[] = [
    {
      label: 'Value',
      value: dataPoint.y.toLocaleString(),
      format: 'number'
    }
  ]

  // Add chart-specific data
  if (chartType === 'bar' || chartType === 'line') {
    baseData.unshift({
      label: 'Category',
      value: dataPoint.x.toString(),
      format: 'text'
    })
  }

  if (seriesLabel) {
    baseData.unshift({
      label: 'Series',
      value: seriesLabel,
      format: 'text'
    })
  }

  // Add metadata if available
  if (dataPoint.metadata) {
    Object.entries(dataPoint.metadata).forEach(([key, value]) => {
      if (key === 'trend') return // Handle trend separately

      let format = 'text'
      if (typeof value === 'number') format = 'number'
      if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate')) {
        format = 'percentage'
        value = `${value}%`
      }

      baseData.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: value.toString(),
        format: format as any
      })
    })
  }

  const content: TooltipContent = {
    title: dataPoint.label || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Data`,
    data: baseData
  }

  // Add trend if available
  if (dataPoint.metadata?.trend) {
    content.trend = {
      value: Math.abs(dataPoint.metadata.trend),
      period: 'vs previous',
      direction: dataPoint.metadata.trend >= 0 ? 'up' : 'down'
    }
  }

  return content
}

// Template components for different chart types
export const BarChartTooltipTemplate: React.FC<TemplateProps> = (props) => {
  const content = createTooltipContent({ ...props, chartType: 'bar' })
  return <div className="tooltip-bar-chart" data-content={JSON.stringify(content)} />
}

export const LineChartTooltipTemplate: React.FC<TemplateProps> = (props) => {
  const content = createTooltipContent({ ...props, chartType: 'line' })
  return <div className="tooltip-line-chart" data-content={JSON.stringify(content)} />
}

export const PieChartTooltipTemplate: React.FC<TemplateProps> = (props) => {
  const content = createTooltipContent({ ...props, chartType: 'pie' })
  return <div className="tooltip-pie-chart" data-content={JSON.stringify(content)} />
}