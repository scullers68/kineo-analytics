import { ChartTheme, AnimationConfig, AccessibilityConfig } from './store'
import { TimeSeriesData, TimeSeriesDataPoint, MissingDataConfig } from './time-series'
import { LineAnimationConfig } from './line-chart'

// Area Chart Configuration
export interface AreaChartConfig {
  interpolation?: 'linear' | 'monotone' | 'cardinal' | 'step'
  stackedMode?: 'none' | 'normal' | 'percent' | 'stream'
  showPoints?: boolean
  pointRadius?: number
  strokeWidth?: number
  areaOpacity?: number
  showGrid?: boolean
  showLegend?: boolean
  zoomable?: boolean
  pannable?: boolean
  gradientFill?: boolean
  theme?: ChartTheme
  animation?: LineAnimationConfig
  accessibility?: AccessibilityConfig
  missingData?: MissingDataConfig
}

// Area Chart Props
export interface AreaChartProps {
  data: TimeSeriesData[]
  config?: AreaChartConfig
  variant?: 'simple' | 'stacked' | 'stream'
  width?: number
  height?: number
  onPointClick?: (point: TimeSeriesDataPoint, series: TimeSeriesData) => void
  onPointHover?: (point: TimeSeriesDataPoint | null, series?: TimeSeriesData) => void
  onZoom?: (domain: [Date, Date]) => void
  className?: string
}

// Area Chart State
export interface AreaChartState {
  isLoading: boolean
  error: string | null
  data: TimeSeriesData[]
  stackedData?: Array<{ series: TimeSeriesData; baseline: number[] }>
  hoveredPoint: { point: TimeSeriesDataPoint; series: TimeSeriesData } | null
  selectedPoint: { point: TimeSeriesDataPoint; series: TimeSeriesData } | null
  zoomDomain: [Date, Date] | null
  crosshairPosition: { x: number; y: number } | null
}

// Stacked Area Data Structure
export interface StackedAreaSeries {
  id: string
  label: string
  color?: string
  data: Array<{
    date: Date
    value: number
    y0: number  // Baseline for stacking
    y1: number  // Top of area for stacking
  }>
}

// Stream Graph Configuration
export interface StreamGraphConfig extends AreaChartConfig {
  streamOrder?: 'ascending' | 'descending' | 'inside-out' | 'reverse'
  streamOffset?: 'wiggle' | 'silhouette' | 'expand'
  symmetrical?: boolean
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AreaChartConfig: undefined,
    AreaChartProps: undefined,
    AreaChartState: undefined,
    StackedAreaSeries: undefined,
    StreamGraphConfig: undefined
  }
}