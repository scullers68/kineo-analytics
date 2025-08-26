import { LineChartConfig, LineChartProps } from './line-chart'
import { AreaChartConfig, AreaChartProps } from './area-chart'

// Simple Line Chart Configuration
export interface SimpleLineConfig extends LineChartConfig {
  // Single series specific options
  singleSeriesColor?: string
  emphasisPoint?: boolean
}

// Multi Line Chart Configuration
export interface MultiLineConfig extends LineChartConfig {
  // Multiple series specific options
  seriesColors?: string[]
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  seriesInteraction?: boolean
  maxSeries?: number
}

// Simple Area Chart Configuration
export interface SimpleAreaConfig extends AreaChartConfig {
  // Single area specific options
  singleAreaColor?: string
  gradientStops?: Array<{ offset: string; color: string }>
}

// Stacked Area Chart Configuration
export interface StackedAreaConfig extends AreaChartConfig {
  // Stacked area specific options
  stackOrder?: 'none' | 'ascending' | 'descending' | 'inside-out'
  stackOffset?: 'none' | 'expand' | 'diverging'
  normalizeToPercent?: boolean
}

// Stream Graph Configuration
export interface StreamGraphConfig extends AreaChartConfig {
  // Stream graph specific options
  streamOrder?: 'ascending' | 'descending' | 'inside-out' | 'reverse'
  streamOffset?: 'wiggle' | 'silhouette' | 'expand'
  symmetrical?: boolean
  flowAnimation?: boolean
}

// Chart Variant Type Union
export type LineChartVariant = 'simple-line' | 'multi-line' | 'simple-area' | 'stacked-area' | 'stream-graph'

// Variant Configuration Mapping
export type VariantConfigMap = {
  'simple-line': SimpleLineConfig
  'multi-line': MultiLineConfig
  'simple-area': SimpleAreaConfig
  'stacked-area': StackedAreaConfig
  'stream-graph': StreamGraphConfig
}

// Variant Props Mapping
export type VariantPropsMap = {
  'simple-line': LineChartProps
  'multi-line': LineChartProps
  'simple-area': AreaChartProps
  'stacked-area': AreaChartProps
  'stream-graph': AreaChartProps
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SimpleLineConfig: undefined,
    MultiLineConfig: undefined,
    SimpleAreaConfig: undefined,
    StackedAreaConfig: undefined,
    StreamGraphConfig: undefined,
    LineChartVariant: undefined,
    VariantConfigMap: undefined,
    VariantPropsMap: undefined
  }
}