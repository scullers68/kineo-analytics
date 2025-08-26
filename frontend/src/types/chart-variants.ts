import { ChartDataPoint, ChartTheme, AnimationConfig, AccessibilityConfig } from './store'

// Simple Chart Configuration
export interface SimpleChartConfig {
  showValues?: boolean
  valuePosition?: 'center' | 'end' | 'outside'
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
}

// Grouped Chart Configuration  
export interface GroupedChartConfig {
  groupPadding?: number    // Default: 0.05
  seriesPadding?: number   // Default: 0.02
  showLegend?: boolean     // Default: true
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  colorScheme?: string[]
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
}

// Stacked Chart Configuration
export interface StackedChartConfig {
  stackOrder?: 'none' | 'ascending' | 'descending' | 'inside-out'
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  showTotals?: boolean
  totalPosition?: 'top' | 'inside' | 'outside'
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
}

// Data Series for Grouped/Stacked Charts
export interface ChartSeries {
  id: string
  label: string
  data: ChartDataPoint[]
  color?: string
  visible?: boolean
}

// Variant Types Union
export type ChartVariantConfig = SimpleChartConfig | GroupedChartConfig | StackedChartConfig

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SimpleChartConfig: undefined, // TypeScript interfaces are not runtime values
    GroupedChartConfig: undefined,
    StackedChartConfig: undefined,
    ChartSeries: undefined,
    ChartVariantConfig: undefined
  }
}