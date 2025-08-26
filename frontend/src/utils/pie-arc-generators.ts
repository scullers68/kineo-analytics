import * as d3 from 'd3'
import { PieDataPoint, PieSlice, PieChartConfig } from '../types/pie-chart'
import { calculatePercentages } from './pie-chart-math'

/**
 * Generate D3 arc generator with configuration
 */
export const generateArc = (
  innerRadius: number = 0,
  outerRadius: number = 100,
  cornerRadius: number = 0,
  padAngle: number = 0
): d3.Arc<any, d3.DefaultArcObject> => {
  return d3.arc<d3.DefaultArcObject>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)
    .padAngle(padAngle)
}

/**
 * Generate D3 pie layout with configuration
 */
export const generatePieLayout = (config: Partial<PieChartConfig> = {}): d3.Pie<any, PieDataPoint> => {
  const pie = d3.pie<PieDataPoint>()
    .value((d) => Math.abs(d.value))
    .startAngle(config.startAngle ?? 0)
    .endAngle(config.endAngle ?? 2 * Math.PI)
    .padAngle(config.padAngle ?? 0)
    .sortValues(config.sortValues !== false ? null : null)
  
  // Handle sorting
  if (config.sortValues !== false) {
    pie.sort((a, b) => b.value - a.value) // Default: descending by value
  } else {
    pie.sort(null) // Preserve original order
  }
  
  return pie
}

/**
 * Calculate arc angles for pie slices
 */
export const calculateArcAngles = (
  data: PieDataPoint[],
  config: Partial<PieChartConfig> = {}
): Array<{
  data: PieDataPoint
  index: number
  startAngle: number
  endAngle: number
  padAngle: number
  value: number
}> => {
  const pie = generatePieLayout(config)
  return pie(data)
}

/**
 * Transform pie data into drawable slices
 */
export const createPieSlices = (
  data: PieDataPoint[],
  config: Partial<PieChartConfig> = {},
  colors: string[] = d3.schemeCategory10
): PieSlice[] => {
  const dataWithPercentages = calculatePercentages(data)
  const arcData = calculateArcAngles(dataWithPercentages, config)
  
  const outerRadius = config.outerRadius ?? 100
  const innerRadius = config.innerRadius ?? 0
  
  return arcData.map((arc, index) => {
    const centroid = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .centroid(arc)
    
    return {
      data: arc.data,
      index,
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      value: arc.value,
      padAngle: arc.padAngle || 0,
      innerRadius,
      outerRadius,
      centroid: centroid as [number, number],
      color: arc.data.color || colors[index % colors.length],
      isHighlighted: false,
      isExploded: false,
      isSelected: false,
      isVisible: true
    }
  })
}

/**
 * Generate label arc for positioning labels outside pie
 */
export const generateLabelArc = (
  innerRadius: number,
  outerRadius: number,
  labelDistance: number = 20
): d3.Arc<any, d3.DefaultArcObject> => {
  const labelRadius = outerRadius + labelDistance
  return d3.arc<d3.DefaultArcObject>()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius)
}

/**
 * Create leader lines for labels
 */
export const createLeaderLine = (
  slice: PieSlice,
  labelPosition: { x: number; y: number },
  outerRadius: number
): string => {
  const centroid = slice.centroid
  const labelArcRadius = outerRadius + 10
  
  // Calculate intermediate point on label arc
  const angle = (slice.startAngle + slice.endAngle) / 2
  const intermediateX = Math.cos(angle) * labelArcRadius
  const intermediateY = Math.sin(angle) * labelArcRadius
  
  // Create polyline path
  return `M${centroid[0]},${centroid[1]}L${intermediateX},${intermediateY}L${labelPosition.x},${labelPosition.y}`
}

/**
 * Generate arc tweens for smooth animations
 */
export const createArcTween = (
  arc: d3.Arc<any, d3.DefaultArcObject>,
  newAngle: { startAngle: number; endAngle: number }
) => {
  return function(this: SVGPathElement, d: any) {
    const interpolate = d3.interpolate(
      { startAngle: d.startAngle, endAngle: d.startAngle },
      { startAngle: newAngle.startAngle, endAngle: newAngle.endAngle }
    )
    
    return (t: number) => {
      const interpolatedData = { ...d, ...interpolate(t) }
      return arc(interpolatedData) || ''
    }
  }
}

/**
 * Create update tween for animating between different data
 */
export const createUpdateTween = (
  arc: d3.Arc<any, d3.DefaultArcObject>,
  oldData: any,
  newData: any
) => {
  return function(this: SVGPathElement, d: any) {
    const interpolate = d3.interpolate(oldData, newData)
    
    return (t: number) => {
      const interpolatedData = interpolate(t)
      return arc(interpolatedData) || ''
    }
  }
}

/**
 * Generate nested arc generators for nested donut charts
 */
export const generateNestedArcs = (
  layers: Array<{
    innerRadius: number
    outerRadius: number
    data: PieDataPoint[]
    config?: Partial<PieChartConfig>
  }>,
  colors: string[][] = [d3.schemeCategory10]
): Array<{
  arc: d3.Arc<any, d3.DefaultArcObject>
  slices: PieSlice[]
  layer: number
}> => {
  return layers.map((layer, layerIndex) => {
    const arc = generateArc(
      layer.innerRadius,
      layer.outerRadius,
      layer.config?.cornerRadius,
      layer.config?.padAngle
    )
    
    const layerColors = colors[layerIndex % colors.length] || colors[0]
    const slices = createPieSlices(
      layer.data,
      {
        ...layer.config,
        innerRadius: layer.innerRadius,
        outerRadius: layer.outerRadius
      },
      layerColors
    )
    
    return {
      arc,
      slices,
      layer: layerIndex
    }
  })
}

/**
 * Generate semi-circle arc for gauge-style charts
 */
export const generateSemiCircleArc = (
  innerRadius: number = 0,
  outerRadius: number = 100,
  startAngle: number = -Math.PI / 2,
  endAngle: number = Math.PI / 2
): d3.Arc<any, d3.DefaultArcObject> => {
  return d3.arc<d3.DefaultArcObject>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
}

/**
 * Create explode transform for slice animation
 */
export const createExplodeTransform = (
  slice: PieSlice,
  explodeDistance: number
): string => {
  const angle = (slice.startAngle + slice.endAngle) / 2
  const dx = Math.cos(angle) * explodeDistance
  const dy = Math.sin(angle) * explodeDistance
  
  return `translate(${dx},${dy})`
}

/**
 * Generate color scale for pie chart based on data
 */
export const generateColorScale = (
  data: PieDataPoint[],
  scheme: string = 'category10'
): d3.ScaleOrdinal<string, string> => {
  const domain = data.map(d => d.label)
  let colors: string[]
  
  switch (scheme) {
    case 'category10':
      colors = d3.schemeCategory10
      break
    case 'set3':
      colors = d3.schemeSet3
      break
    case 'pastel1':
      colors = d3.schemePastel1
      break
    default:
      colors = d3.schemeCategory10
  }
  
  return d3.scaleOrdinal<string>()
    .domain(domain)
    .range(colors)
}

/**
 * Calculate path for custom slice shapes
 */
export const generateCustomSlicePath = (
  slice: PieSlice,
  customShape?: 'rounded' | 'beveled' | 'standard'
): string => {
  const shape = customShape || 'standard'
  
  switch (shape) {
    case 'rounded':
      return generateArc(
        slice.innerRadius,
        slice.outerRadius,
        Math.min(slice.outerRadius * 0.1, 10),
        slice.padAngle
      )({
        startAngle: slice.startAngle,
        endAngle: slice.endAngle,
        innerRadius: slice.innerRadius,
        outerRadius: slice.outerRadius,
        padAngle: slice.padAngle
      }) || ''
    
    case 'beveled':
      // Create custom beveled path
      const bevelSize = Math.min(slice.outerRadius * 0.05, 5)
      const arc = generateArc(
        slice.innerRadius,
        slice.outerRadius - bevelSize,
        0,
        slice.padAngle
      )
      return arc({
        startAngle: slice.startAngle,
        endAngle: slice.endAngle,
        innerRadius: slice.innerRadius,
        outerRadius: slice.outerRadius - bevelSize,
        padAngle: slice.padAngle
      }) || ''
    
    default:
      return generateArc(
        slice.innerRadius,
        slice.outerRadius,
        0,
        slice.padAngle
      )({
        startAngle: slice.startAngle,
        endAngle: slice.endAngle,
        innerRadius: slice.innerRadius,
        outerRadius: slice.outerRadius,
        padAngle: slice.padAngle
      }) || ''
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateArc,
    generatePieLayout,
    calculateArcAngles,
    createPieSlices,
    generateLabelArc,
    createLeaderLine,
    createArcTween,
    createUpdateTween,
    generateNestedArcs,
    generateSemiCircleArc,
    createExplodeTransform,
    generateColorScale,
    generateCustomSlicePath
  }
}