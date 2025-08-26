import { PieDataPoint, DonutChartConfig, PieSlice, PieChartState, PieChartActions } from './pie-chart'

export interface DonutDataPoint extends PieDataPoint {
  icon?: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

export interface DonutCenterContent {
  title: string
  subtitle?: string
  value: string | number
  icon?: React.ReactNode | string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    value: number
    label?: string
  }
  footer?: string
  onClick?: () => void
}

export interface DonutChartState extends PieChartState {
  centerContent: DonutCenterContent
  isAnimatingCenter?: boolean
}

export interface DonutInteractionHandlers {
  onCenterClick?: () => void
  onCenterHover?: (isHovering: boolean) => void
  updateCenterContent?: (content: Partial<DonutCenterContent>) => void
  animateCenterTransition?: (newContent: DonutCenterContent) => void
}

export interface NestedDonutLayer {
  data: PieDataPoint[]
  innerRadius: number
  outerRadius: number
  label?: string
  config?: Partial<DonutChartConfig>
}

export interface NestedDonutConfig {
  layers: NestedDonutLayer[]
  spacing?: number
  syncAnimation?: boolean
  centerContent?: DonutCenterContent
  layerLabels?: boolean
}

export interface DonutGaugeConfig extends DonutChartConfig {
  min: number
  max: number
  value: number
  target?: number
  thresholds?: Array<{
    value: number
    color: string
    label?: string
  }>
  showProgress?: boolean
  progressColor?: string
  backgroundColor?: string
}

export interface DonutComparisonConfig {
  beforeData: PieDataPoint[]
  afterData: PieDataPoint[]
  showDifference?: boolean
  comparisonMode?: 'side-by-side' | 'overlay' | 'animated-transition'
  labels?: {
    before: string
    after: string
  }
}

// Learning Analytics Donut specific types
export interface CertificationDonutData extends DonutDataPoint {
  certificationName: string
  totalCertifications: number
  activeCertifications: number
  expiredCertifications: number
  pendingCertifications: number
}

export interface DepartmentEngagementData extends DonutDataPoint {
  departmentName: string
  employeeCount: number
  averageEngagement: number
  topCourse: string
  completionRate: number
}

export interface TrainingMethodData extends DonutDataPoint {
  methodType: 'e-learning' | 'classroom' | 'blended' | 'self-study'
  effectivenessScore: number
  userPreference: number
  completionTime: number
}

// CommonJS compatibility for donut-specific types
export const DonutChartVariants = {
  BASIC: 'basic',
  GAUGE: 'gauge',
  NESTED: 'nested',
  COMPARISON: 'comparison'
} as const

export type DonutChartVariant = typeof DonutChartVariants[keyof typeof DonutChartVariants]