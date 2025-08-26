import { ChartTheme, AnimationConfig, AccessibilityConfig } from './store'
import { TimeSeriesData, TimeSeriesDataPoint, MissingDataConfig } from './time-series'

// Line Chart Configuration
export interface LineChartConfig {
  interpolation?: 'linear' | 'monotone' | 'cardinal' | 'step'
  showPoints?: boolean
  pointRadius?: number
  strokeWidth?: number
  showGrid?: boolean
  showLegend?: boolean
  zoomable?: boolean
  pannable?: boolean
  showArea?: boolean
  areaOpacity?: number
  theme?: ChartTheme
  animation?: AnimationConfig
  accessibility?: AccessibilityConfig
  missingData?: MissingDataConfig
}

// Line Chart Props
export interface LineChartProps {
  data: TimeSeriesData[]
  config?: LineChartConfig
  variant?: 'simple' | 'multi-series'
  width?: number
  height?: number
  onPointClick?: (point: TimeSeriesDataPoint, series: TimeSeriesData) => void
  onPointHover?: (point: TimeSeriesDataPoint | null, series?: TimeSeriesData) => void
  onZoom?: (domain: [Date, Date]) => void
  className?: string
}

// Line Chart State
export interface LineChartState {
  isLoading: boolean
  error: string | null
  data: TimeSeriesData[]
  hoveredPoint: { point: TimeSeriesDataPoint; series: TimeSeriesData } | null
  selectedPoint: { point: TimeSeriesDataPoint; series: TimeSeriesData } | null
  zoomDomain: [Date, Date] | null
  crosshairPosition: { x: number; y: number } | null
}

// Line Animation Configuration
export interface LineAnimationConfig extends AnimationConfig {
  drawDuration?: number      // Line drawing animation: 1000ms
  pointDelay?: number        // Staggered point appearance: 100ms
  morphDuration?: number     // Data update morphing: 500ms
  pathLength?: boolean       // Animate path drawing from start
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LineChartConfig: undefined,
    LineChartProps: undefined,
    LineChartState: undefined,
    LineAnimationConfig: undefined
  }
}