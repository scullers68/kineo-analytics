import { ChartDataPoint, ChartDataset, ChartTheme, AnimationConfig, AccessibilityConfig } from './store'

// Bar Chart Configuration
export interface BarChartConfig {
  barPadding?: number      // Default: 0.1
  groupPadding?: number    // Default: 0.05
  showLabels?: boolean     // Default: true
  labelPosition?: 'inside' | 'outside' | 'none'
  sortBy?: 'value' | 'label' | 'custom'
  sortOrder?: 'asc' | 'desc'
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
}

// Bar Chart Props
export interface BarChartProps {
  data: ChartDataPoint[]
  config?: BarChartConfig
  variant?: 'simple' | 'grouped' | 'stacked'
  orientation?: 'horizontal' | 'vertical'
  width?: number
  height?: number
  onBarClick?: (data: ChartDataPoint) => void
  onBarHover?: (data: ChartDataPoint | null) => void
  className?: string
  exportable?: boolean
  exportOptions?: {
    formats?: ('png' | 'svg' | 'pdf')[]
    branding?: boolean
    quality?: 'standard' | 'high' | 'print'
  }
}

// Bar Chart State
export interface BarChartState {
  isLoading: boolean
  error: string | null
  data: ChartDataPoint[]
  hoveredBar: ChartDataPoint | null
  selectedBar: ChartDataPoint | null
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BarChartConfig: undefined, // TypeScript interfaces are not runtime values
    BarChartProps: undefined,
    BarChartState: undefined
  }
}