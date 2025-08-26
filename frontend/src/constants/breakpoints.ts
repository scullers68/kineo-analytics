export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export const CHART_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
} as const

export const RESPONSIVE_DIMENSIONS = {
  xs: { width: 300, height: 200 },
  sm: { width: 400, height: 250 },
  md: { width: 600, height: 350 },
  lg: { width: 800, height: 450 },
  xl: { width: 1000, height: 550 },
  '2xl': { width: 1200, height: 650 }
} as const

export const ASPECT_RATIOS = {
  square: 1,
  portrait: 3/4,
  landscape: 4/3,
  widescreen: 16/9,
  ultrawide: 21/9,
  golden: 1.618
} as const

export const MEDIA_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`
} as const

export default BREAKPOINTS