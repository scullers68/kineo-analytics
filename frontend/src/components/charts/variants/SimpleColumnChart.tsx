import React from 'react'
import { ColumnChart } from '../ColumnChart'
import { ChartDataPoint } from '../../../types/store'
import { SimpleChartConfig } from '../../../types/chart-variants'

export interface SimpleColumnChartProps {
  data: ChartDataPoint[]
  config?: SimpleChartConfig
  width?: number
  height?: number
  orientation?: 'horizontal' | 'vertical'
  onColumnClick?: (data: ChartDataPoint) => void
  onColumnHover?: (data: ChartDataPoint | null) => void
  className?: string
}

export const SimpleColumnChart: React.FC<SimpleColumnChartProps> = ({
  data,
  config = {},
  width = 400,
  height = 300,
  orientation = 'vertical',
  onColumnClick,
  onColumnHover,
  className = ''
}) => {
  // Convert SimpleChartConfig to ColumnChartConfig
  const columnChartConfig = {
    columnPadding: 0.1,
    groupPadding: 0.05,
    showLabels: true,
    labelPosition: config.valuePosition === 'center' ? 'inside' : 'outside',
    sortBy: 'custom' as const,
    sortOrder: 'asc' as const,
    theme: config.theme,
    animation: config.animation,
    accessibility: config.accessibility
  }

  return (
    <ColumnChart
      data={data}
      config={columnChartConfig}
      variant="simple"
      orientation={orientation}
      width={width}
      height={height}
      onColumnClick={onColumnClick}
      onColumnHover={onColumnHover}
      className={`simple-column-chart ${className}`}
    />
  )
}

export default SimpleColumnChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimpleColumnChart, default: SimpleColumnChart }
}