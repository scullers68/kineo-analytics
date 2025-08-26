import React from 'react'
import { BarChart } from '../BarChart'
import { ChartDataPoint } from '../../../types/store'
import { SimpleChartConfig } from '../../../types/chart-variants'

export interface SimpleBarChartProps {
  data: ChartDataPoint[]
  config?: SimpleChartConfig
  width?: number
  height?: number
  orientation?: 'horizontal' | 'vertical'
  onBarClick?: (data: ChartDataPoint) => void
  onBarHover?: (data: ChartDataPoint | null) => void
  className?: string
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  config = {},
  width = 400,
  height = 300,
  orientation = 'horizontal',
  onBarClick,
  onBarHover,
  className = ''
}) => {
  // Convert SimpleChartConfig to BarChartConfig
  const barChartConfig = {
    barPadding: 0.1,
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
    <BarChart
      data={data}
      config={barChartConfig}
      variant="simple"
      orientation={orientation}
      width={width}
      height={height}
      onBarClick={onBarClick}
      onBarHover={onBarHover}
      className={`simple-bar-chart ${className}`}
    />
  )
}

export default SimpleBarChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimpleBarChart, default: SimpleBarChart }
}