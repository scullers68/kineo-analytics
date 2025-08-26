export interface ResponsiveConfig {
  breakpoints: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
  }
  dimensions: {
    [key: string]: {
      width: number | string
      height: number | string
    }
  }
  aspectRatios: {
    square: number
    landscape: number
    portrait: number
    wide: number
  }
}

export interface ResponsiveChartConfig {
  maintainAspectRatio: boolean
  aspectRatio: number
  minWidth: number
  minHeight: number
  maxWidth?: number
  maxHeight?: number
  scalingFactor: number
}

export interface ViewportDimensions {
  width: number
  height: number
  aspectRatio: number
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  dimensions: {
    xs: { width: '100%', height: 200 },
    sm: { width: '100%', height: 250 },
    md: { width: '100%', height: 300 },
    lg: { width: '100%', height: 400 },
    xl: { width: '100%', height: 500 },
    '2xl': { width: '100%', height: 600 }
  },
  aspectRatios: {
    square: 1,
    landscape: 16/9,
    portrait: 9/16,
    wide: 21/9
  }
}

export const DEFAULT_CHART_CONFIG: ResponsiveChartConfig = {
  maintainAspectRatio: true,
  aspectRatio: 16/9,
  minWidth: 200,
  minHeight: 150,
  scalingFactor: 1
}