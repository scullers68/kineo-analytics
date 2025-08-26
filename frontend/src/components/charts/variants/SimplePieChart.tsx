import React from 'react'
import { PieChart, PieChartProps } from '../PieChart'
import { PieDataPoint } from '../../../types/pie-chart'

export interface SimplePieChartProps extends Omit<PieChartProps, 'config'> {
  data: PieDataPoint[]
  colors?: string[]
  showLabels?: boolean
  showValues?: boolean
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  colors,
  showLabels = false,
  showValues = false,
  ...props
}) => {
  return (
    <PieChart
      data={data}
      config={{
        showLabels,
        showValues,
        showPercentages: false,
        innerRadius: 0,
        sortValues: true
      }}
      interactions={{
        enableHover: false,
        enableClick: false,
        showTooltip: false
      }}
      {...props}
    />
  )
}

export default SimplePieChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimplePieChart, default: SimplePieChart }
}