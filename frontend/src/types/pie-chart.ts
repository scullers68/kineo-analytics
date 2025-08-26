import { ChartDataPoint, ChartDimensions, AnimationConfig, AccessibilityConfig } from './store'

export interface PieDataPoint extends ChartDataPoint {
  value: number
  label: string
  color?: string
  category?: string
  percentage?: number
  startAngle?: number
  endAngle?: number
  padAngle?: number
}

export interface PieChartConfig {
  width: number
  height: number
  innerRadius?: number
  outerRadius?: number
  padAngle?: number
  cornerRadius?: number
  startAngle?: number
  endAngle?: number
  sortValues?: boolean
  showLabels?: boolean
  showValues?: boolean
  showPercentages?: boolean
  labelPosition?: 'inside' | 'outside' | 'center'
  centerContent?: {
    title?: string
    subtitle?: string
    value?: string | number
  }
}

export interface DonutChartConfig extends PieChartConfig {
  innerRadius: number
  centerContent?: {
    title?: string
    subtitle?: string
    value?: string | number
    icon?: string
  }
}

export interface PieInteractionConfig {
  enableHover?: boolean
  enableClick?: boolean
  explodeOnHover?: boolean
  explodeDistance?: number
  highlightOnHover?: boolean
  showTooltip?: boolean
  enableDrillDown?: boolean
  enableLegendClick?: boolean
}

export interface PieSlice {
  data: PieDataPoint
  index: number
  startAngle: number
  endAngle: number
  value: number
  padAngle: number
  innerRadius: number
  outerRadius: number
  centroid: [number, number]
  color: string
  isHighlighted?: boolean
  isExploded?: boolean
  isSelected?: boolean
  isVisible?: boolean
}

export interface PieTooltipData {
  label: string
  value: number
  percentage: number
  color: string
  position: { x: number; y: number }
  category?: string
  additionalData?: Record<string, any>
}

export interface PieLabelData {
  text: string
  x: number
  y: number
  angle: number
  slice: PieSlice
  anchor: 'start' | 'middle' | 'end'
  isVisible: boolean
}

export interface PieChartState {
  slices: PieSlice[]
  selectedSlices: number[]
  hoveredSlice: number | null
  explodedSlices: number[]
  hiddenSlices: number[]
  drillDownPath: string[]
  centerContent?: {
    title: string
    subtitle?: string
    value: string | number
  }
}

export interface PieChartActions {
  onSliceClick?: (slice: PieSlice, event: MouseEvent) => void
  onSliceHover?: (slice: PieSlice | null, event: MouseEvent) => void
  onLegendClick?: (slice: PieSlice, event: MouseEvent) => void
  onDrillDown?: (slice: PieSlice) => void
  onBreadcrumbClick?: (level: number) => void
  onCenterContentUpdate?: (content: any) => void
}

export interface PieAnimationConfig extends AnimationConfig {
  enterAnimation?: 'fade' | 'grow' | 'sweep' | 'none'
  exitAnimation?: 'fade' | 'shrink' | 'sweep' | 'none'
  updateAnimation?: 'morph' | 'replace' | 'none'
  explodeAnimation?: {
    enabled: boolean
    duration: number
    distance: number
  }
}

export interface PieAccessibilityConfig extends AccessibilityConfig {
  sliceDescriptions?: boolean
  announcePercentages?: boolean
  keyboardSliceNavigation?: boolean
  ariaLabel?: string
  roleDescription?: string
}

export interface PiePerformanceConfig {
  maxSlices?: number
  groupSmallSlices?: boolean
  smallSliceThreshold?: number
  enableVirtualization?: boolean
  renderingThrottle?: number
  animationOptimization?: boolean
}

export interface PieResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  adaptiveRadius: boolean
  adaptiveLabels: boolean
  mobileOptimizations: {
    hideLabels?: boolean
    increaseTouchTargets?: boolean
    simplifyInteractions?: boolean
  }
}

export interface PieDrillDownData {
  level: number
  parentSlice: PieSlice | null
  breadcrumbs: Array<{
    label: string
    value: string | number
    level: number
  }>
  childData: PieDataPoint[]
  canDrillUp: boolean
  canDrillDown: boolean
}

export interface PieColorScheme {
  type: 'categorical' | 'sequential' | 'diverging'
  colors: string[]
  defaultColor?: string
  highlightColor?: string
  selectedColor?: string
  disabledColor?: string
}

export interface PieLegendConfig {
  enabled: boolean
  position: 'top' | 'right' | 'bottom' | 'left'
  layout: 'horizontal' | 'vertical'
  showValues?: boolean
  showPercentages?: boolean
  interactive?: boolean
  maxItems?: number
}

// Factory interfaces for creating different pie chart variants
export interface PieChartFactory {
  createSimplePie: (data: PieDataPoint[], config?: Partial<PieChartConfig>) => any
  createDonut: (data: PieDataPoint[], config?: Partial<DonutChartConfig>) => any
  createSemiCircle: (data: PieDataPoint[], config?: Partial<PieChartConfig>) => any
  createNestedDonut: (innerData: PieDataPoint[], outerData: PieDataPoint[], config?: any) => any
}

// Learning Analytics specific interfaces
export interface CertificationStatusData extends PieDataPoint {
  status: 'active' | 'expired' | 'pending' | 'not_assigned'
  expiryDate?: Date
  certificationId: string
  employeeCount: number
}

export interface CompletionRateData extends PieDataPoint {
  completionRate: number
  department?: string
  courseCategory?: string
  totalEmployees: number
  completedEmployees: number
}

export interface EngagementData extends PieDataPoint {
  engagementLevel: 'high' | 'medium' | 'low'
  activityType: 'course' | 'assessment' | 'certification'
  timeSpent?: number
  userCount: number
}

// CommonJS compatibility
export const PieChartTypes = {
  SIMPLE: 'simple',
  DONUT: 'donut',
  SEMI_CIRCLE: 'semi-circle',
  NESTED: 'nested'
} as const

export type PieChartType = typeof PieChartTypes[keyof typeof PieChartTypes]