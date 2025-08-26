import { PieChartConfig, DonutChartConfig, PieDataPoint } from './pie-chart'
import { DonutCenterContent, NestedDonutConfig, DonutGaugeConfig } from './donut-chart'

// Base variant configuration
export interface PieVariantConfig extends PieChartConfig {
  variant: 'simple' | 'interactive' | 'mini' | 'comparison'
  theme?: 'default' | 'dark' | 'high-contrast' | 'colorblind-friendly'
}

export interface DonutVariantConfig extends DonutChartConfig {
  variant: 'basic' | 'interactive' | 'gauge' | 'nested'
  centerContent?: DonutCenterContent
}

export interface SemiCircleConfig extends PieChartConfig {
  startAngle: number // -Math.PI/2 for top start
  endAngle: number   // Math.PI/2 for bottom end
  gaugeMode?: boolean
  showNeedle?: boolean
  needleConfig?: {
    color: string
    width: number
    length: number
  }
}

// Specific variant configurations
export interface SimplePieConfig extends PieVariantConfig {
  variant: 'simple'
  minimal?: boolean
  hideLabels?: boolean
  staticColors?: string[]
}

export interface InteractivePieConfig extends PieVariantConfig {
  variant: 'interactive'
  explodeOnHover?: boolean
  drillDownEnabled?: boolean
  tooltipEnabled?: boolean
  legendEnabled?: boolean
}

export interface MiniPieConfig extends PieVariantConfig {
  variant: 'mini'
  size: 'xs' | 'sm' | 'md'
  showOnlyValue?: boolean
  sparklineMode?: boolean
}

export interface ComparisonPieConfig extends PieVariantConfig {
  variant: 'comparison'
  compareData: PieDataPoint[]
  comparisonLayout: 'side-by-side' | 'overlay'
  showDifference?: boolean
}

export interface ProgressGaugeConfig extends SemiCircleConfig {
  gaugeMode: true
  progress: number // 0-100
  showProgress: boolean
  progressColor?: string
  backgroundColor?: string
  showTarget?: boolean
  target?: number
}

export interface ScoreGaugeConfig extends ProgressGaugeConfig {
  scoreRanges?: Array<{
    min: number
    max: number
    color: string
    label: string
  }>
  showScoreLabel?: boolean
  scoreFormat?: (value: number) => string
}

// Learning Analytics variant configurations
export interface CertificationStatusConfig extends DonutVariantConfig {
  variant: 'basic'
  statusColors: {
    active: string
    expired: string
    pending: string
    notAssigned: string
  }
  showExpiryWarnings?: boolean
  warningThreshold?: number // days before expiry
}

export interface CompletionRateConfig extends PieVariantConfig {
  variant: 'interactive'
  completionThreshold?: number
  showBenchmark?: boolean
  benchmarkValue?: number
  departmentBreakdown?: boolean
}

export interface EngagementConfig extends NestedDonutConfig {
  engagementLevels: {
    high: { color: string; threshold: number }
    medium: { color: string; threshold: number }
    low: { color: string; threshold: number }
  }
  showTrends?: boolean
  timeframeComparison?: boolean
}

// Factory configuration for creating variants
export interface VariantFactoryConfig {
  type: 'pie' | 'donut' | 'semi-circle' | 'nested'
  variant: string
  data: PieDataPoint[]
  config: Partial<PieChartConfig | DonutChartConfig | SemiCircleConfig>
  theme?: string
  responsive?: boolean
  accessibility?: boolean
}

// Themed variant configurations
export interface DarkModeConfig {
  backgroundColor: string
  textColor: string
  gridColor: string
  colors: string[]
  highlightColor: string
}

export interface HighContrastConfig extends DarkModeConfig {
  contrastRatio: number
  outlineWidth: number
  focusIndicator: string
}

export interface ColorBlindFriendlyConfig {
  colorScheme: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy'
  colors: string[]
  patterns?: boolean
  patternDefinitions?: Array<{
    id: string
    pattern: string
  }>
}

// Drill-down variant configurations
export interface DrillDownConfig extends InteractivePieConfig {
  drillDownEnabled: true
  maxDepth?: number
  breadcrumbEnabled?: boolean
  backButtonEnabled?: boolean
  drillDownAnimation?: 'zoom' | 'fade' | 'slide'
}

export interface HierarchicalDonutConfig extends NestedDonutConfig {
  hierarchyData: Array<{
    level: number
    parentId?: string
    data: PieDataPoint[]
  }>
  expandable?: boolean
  collapseOthers?: boolean
}

// Performance variant configurations
export interface LargeDatasetConfig extends PieVariantConfig {
  dataAggregation?: {
    enabled: boolean
    threshold: number
    method: 'sum' | 'average' | 'count'
  }
  virtualization?: {
    enabled: boolean
    visibleSlices: number
  }
  pagination?: {
    enabled: boolean
    itemsPerPage: number
  }
}

// Export all variant types for type checking
export type AnyVariantConfig = 
  | PieVariantConfig
  | DonutVariantConfig
  | SemiCircleConfig
  | SimplePieConfig
  | InteractivePieConfig
  | MiniPieConfig
  | ComparisonPieConfig
  | ProgressGaugeConfig
  | ScoreGaugeConfig
  | CertificationStatusConfig
  | CompletionRateConfig
  | DrillDownConfig
  | HierarchicalDonutConfig
  | LargeDatasetConfig

// CommonJS compatibility
export const VARIANT_TYPES = {
  SIMPLE_PIE: 'simple-pie',
  INTERACTIVE_PIE: 'interactive-pie',
  MINI_PIE: 'mini-pie',
  COMPARISON_PIE: 'comparison-pie',
  BASIC_DONUT: 'basic-donut',
  INTERACTIVE_DONUT: 'interactive-donut',
  GAUGE_DONUT: 'gauge-donut',
  NESTED_DONUT: 'nested-donut',
  SEMI_CIRCLE: 'semi-circle',
  PROGRESS_GAUGE: 'progress-gauge',
  SCORE_GAUGE: 'score-gauge'
} as const

export type VariantType = typeof VARIANT_TYPES[keyof typeof VARIANT_TYPES]