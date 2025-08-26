// Time Series Data Types for Line/Area Charts
export interface TimeSeriesDataPoint {
  date: Date
  value: number
  metadata?: Record<string, any>
}

export interface TimeSeriesData {
  id: string
  label: string
  color?: string
  points: TimeSeriesDataPoint[]
}

export interface TimeSeriesDataset {
  series: TimeSeriesData[]
  timeRange?: [Date, Date]
  valueRange?: [number, number]
}

// Time Scale Configuration
export interface TimeScaleConfig {
  domain?: [Date, Date]
  range?: [number, number]
  nice?: boolean
  ticks?: number
}

// Time Formatting Options
export interface TimeFormatConfig {
  format?: string
  adaptive?: boolean
  timezone?: string
  locale?: string
}

// Gap Detection and Handling
export interface TimeSeriesGap {
  startDate: Date
  endDate: Date
  duration: number
  seriesId: string
}

export interface MissingDataConfig {
  detectGaps?: boolean
  gapThreshold?: number // milliseconds
  interpolationMethod?: 'linear' | 'polynomial' | 'none'
  showGapIndicators?: boolean
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TimeSeriesDataPoint: undefined,
    TimeSeriesData: undefined,
    TimeSeriesDataset: undefined,
    TimeScaleConfig: undefined,
    TimeFormatConfig: undefined,
    TimeSeriesGap: undefined,
    MissingDataConfig: undefined
  }
}