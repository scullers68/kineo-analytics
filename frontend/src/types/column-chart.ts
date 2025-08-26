import { ChartDataPoint, ChartDataset, ChartTheme, AnimationConfig, AccessibilityConfig } from './store'

// Column Chart Configuration
export interface ColumnChartConfig {
  columnPadding?: number   // Default: 0.1
  groupPadding?: number    // Default: 0.05
  showLabels?: boolean     // Default: true
  labelPosition?: 'inside' | 'outside' | 'none'
  sortBy?: 'value' | 'label' | 'custom'
  sortOrder?: 'asc' | 'desc'
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
}

// Column Chart Props
export interface ColumnChartProps {
  data: ChartDataPoint[]
  config?: ColumnChartConfig
  variant?: 'simple' | 'grouped' | 'stacked'
  orientation?: 'horizontal' | 'vertical'
  width?: number
  height?: number
  onColumnClick?: (data: ChartDataPoint) => void
  onColumnHover?: (data: ChartDataPoint | null) => void
  className?: string
}

// Column Chart State
export interface ColumnChartState {
  isLoading: boolean
  error: string | null
  data: ChartDataPoint[]
  hoveredColumn: ChartDataPoint | null
  selectedColumn: ChartDataPoint | null
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ColumnChartConfig: undefined, // TypeScript interfaces are not runtime values
    ColumnChartProps: undefined,
    ColumnChartState: undefined
  }
}