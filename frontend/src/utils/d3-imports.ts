// Optimized D3.js imports to reduce bundle size
// Only import the modules we actually need

// Core D3 selection functionality
export { select, selectAll } from 'd3-selection'

// Scale functions for data mapping
export { 
  scaleLinear, 
  scaleBand, 
  scaleOrdinal, 
  scaleTime,
  scaleLog,
  scalePow,
  scaleSymlog
} from 'd3-scale'

// Shape generators for paths and areas
export {
  line,
  area,
  arc,
  pie,
  symbol,
  symbolCircle,
  symbolSquare,
  symbolTriangle,
  stack,
  stackOrderNone,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderInsideOut,
  stackOrderReverse,
  stackOffsetNone,
  stackOffsetExpand,
  stackOffsetDiverging,
  stackOffsetSilhouette,
  stackOffsetWiggle
} from 'd3-shape'

// Axis generators
export {
  axisTop,
  axisRight,
  axisBottom,
  axisLeft
} from 'd3-axis'

// Transition and easing
export {
  transition,
  easeCubic,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeLinear,
  easeQuad,
  easeQuadIn,
  easeQuadOut,
  easeQuadInOut
} from 'd3-transition'

// Color schemes
export {
  schemeCategory10,
  schemeSet3,
  interpolateBlues,
  interpolateReds,
  interpolateViridis
} from 'd3-scale-chromatic'

// Data manipulation utilities
export {
  extent,
  max,
  min,
  sum,
  mean,
  median,
  quantile,
  ascending,
  descending,
  bisect
} from 'd3-array'

// Time formatting and parsing
export {
  timeFormat,
  timeParse,
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear
} from 'd3-time-format'

// Hierarchical data structures (for tree charts)
export {
  hierarchy,
  tree,
  cluster,
  pack,
  partition,
  treemap
} from 'd3-hierarchy'

// Force simulation (for network charts)
export {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY
} from 'd3-force'

// Geographic projections (if needed for maps)
export {
  geoPath,
  geoMercator,
  geoAlbersUsa,
  geoNaturalEarth1
} from 'd3-geo'

// Drag, zoom, and brush behaviors
export {
  drag,
  zoom,
  zoomIdentity,
  brush,
  brushX,
  brushY
} from 'd3-brush'

export {
  zoom as d3Zoom,
  zoomIdentity as d3ZoomIdentity
} from 'd3-zoom'

export {
  drag as d3Drag
} from 'd3-drag'

// Bundle size analysis utility
export const optimizedD3Imports = {
  // Core modules (always needed)
  core: [
    'd3-selection',
    'd3-scale',
    'd3-shape',
    'd3-axis'
  ],
  
  // Animation modules (conditional)
  animation: [
    'd3-transition',
    'd3-ease'
  ],
  
  // Data processing (conditional)
  data: [
    'd3-array',
    'd3-time-format'
  ],
  
  // Advanced features (optional)
  advanced: [
    'd3-hierarchy',
    'd3-geo',
    'd3-drag',
    'd3-zoom',
    'd3-brush',
    'd3-force'
  ],
  
  // Visual enhancements (optional)
  visual: [
    'd3-scale-chromatic',
    'd3-interpolate'
  ]
}

// Dynamic import utility for code splitting D3 modules
export const dynamicD3Import = async (modules: string[]) => {
  const imports = await Promise.all(
    modules.map(moduleName => {
      switch (moduleName) {
        case 'd3-selection':
          return import('d3-selection')
        case 'd3-scale':
          return import('d3-scale')
        case 'd3-shape':
          return import('d3-shape')
        case 'd3-axis':
          return import('d3-axis')
        case 'd3-transition':
          return import('d3-transition')
        case 'd3-array':
          return import('d3-array')
        case 'd3-hierarchy':
          return import('d3-hierarchy')
        default:
          throw new Error(`Unknown D3 module: ${moduleName}`)
      }
    })
  )
  
  return imports.reduce((combined, moduleExports) => ({
    ...combined,
    ...moduleExports
  }), {})
}

// Bundle size estimation
export const estimateD3BundleSize = (modules: string[]): number => {
  // Approximate sizes in KB (uncompressed)
  const moduleSizes: { [key: string]: number } = {
    'd3-selection': 15,
    'd3-scale': 25,
    'd3-shape': 20,
    'd3-axis': 8,
    'd3-transition': 12,
    'd3-array': 10,
    'd3-time-format': 15,
    'd3-hierarchy': 18,
    'd3-geo': 30,
    'd3-scale-chromatic': 5,
    'd3-brush': 8,
    'd3-zoom': 12,
    'd3-drag': 10,
    'd3-force': 22
  }
  
  return modules.reduce((total, module) => total + (moduleSizes[module] || 10), 0)
}

export default optimizedD3Imports