import * as d3 from 'd3'
import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'

// Canvas rendering for high-performance visualization of large datasets
export interface CanvasRenderOptions {
  width: number
  height: number
  margins: { top: number; right: number; bottom: number; left: number }
  pixelRatio: number
  backgroundColor?: string
  enableInteraction?: boolean
  maxPoints?: number
}

// Canvas-based line chart renderer for large datasets
export class CanvasLineRenderer {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private options: Required<CanvasRenderOptions>
  private xScale?: d3.ScaleTime<number, number>
  private yScale?: d3.ScaleLinear<number, number>
  private data: TimeSeriesData[] = []

  constructor(canvas: HTMLCanvasElement, options: CanvasRenderOptions) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to get 2D canvas context')
    }
    this.context = context

    this.options = {
      backgroundColor: '#ffffff',
      enableInteraction: true,
      maxPoints: 50000,
      ...options
    }

    this.setupCanvas()
  }

  private setupCanvas() {
    const { width, height, pixelRatio } = this.options
    
    // Set canvas size accounting for device pixel ratio
    this.canvas.width = width * pixelRatio
    this.canvas.height = height * pixelRatio
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    
    // Scale context for high DPI displays
    this.context.scale(pixelRatio, pixelRatio)
    
    // Set canvas properties
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
  }

  private createScales(data: TimeSeriesData[]) {
    const { width, height, margins } = this.options
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom

    // Calculate time domain
    let minDate: Date | null = null
    let maxDate: Date | null = null
    let minValue = Infinity
    let maxValue = -Infinity

    data.forEach(series => {
      series.points.forEach(point => {
        if (!minDate || point.date < minDate) minDate = point.date
        if (!maxDate || point.date > maxDate) maxDate = point.date
        if (point.value < minValue) minValue = point.value
        if (point.value > maxValue) maxValue = point.value
      })
    })

    if (!minDate || !maxDate) {
      minDate = new Date()
      maxDate = new Date()
    }

    this.xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([margins.left, margins.left + chartWidth])

    this.yScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([margins.top + chartHeight, margins.top])
      .nice()
  }

  public render(data: TimeSeriesData[]) {
    this.data = data
    this.createScales(data)
    
    if (!this.xScale || !this.yScale) {
      throw new Error('Scales not initialized')
    }

    // Clear canvas
    this.context.fillStyle = this.options.backgroundColor
    this.context.fillRect(0, 0, this.options.width, this.options.height)

    // Render each series
    data.forEach((series, seriesIndex) => {
      this.renderSeries(series, seriesIndex)
    })

    // Render axes
    this.renderAxes()
  }

  private renderSeries(series: TimeSeriesData, seriesIndex: number) {
    if (!this.xScale || !this.yScale || !series.points.length) return

    // Sample data if too many points
    let points = series.points
    if (points.length > this.options.maxPoints) {
      points = this.samplePoints(points, this.options.maxPoints)
    }

    const color = series.color || d3.schemeCategory10[seriesIndex % 10]
    this.context.strokeStyle = color
    this.context.lineWidth = 2

    // Begin path
    this.context.beginPath()
    
    // Move to first point
    const firstPoint = points[0]
    this.context.moveTo(
      this.xScale(firstPoint.date),
      this.yScale(firstPoint.value)
    )

    // Draw lines to subsequent points
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.context.lineTo(
        this.xScale(point.date),
        this.yScale(point.value)
      )
    }

    this.context.stroke()
  }

  private samplePoints(points: TimeSeriesDataPoint[], maxPoints: number): TimeSeriesDataPoint[] {
    if (points.length <= maxPoints) return points

    const step = Math.floor(points.length / maxPoints)
    const sampled: TimeSeriesDataPoint[] = []

    for (let i = 0; i < points.length; i += step) {
      sampled.push(points[i])
    }

    // Always include the last point
    if (sampled[sampled.length - 1] !== points[points.length - 1]) {
      sampled.push(points[points.length - 1])
    }

    return sampled
  }

  private renderAxes() {
    if (!this.xScale || !this.yScale) return

    const { margins, width, height } = this.options
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom

    this.context.strokeStyle = '#666'
    this.context.lineWidth = 1

    // X-axis
    this.context.beginPath()
    this.context.moveTo(margins.left, margins.top + chartHeight)
    this.context.lineTo(margins.left + chartWidth, margins.top + chartHeight)
    this.context.stroke()

    // Y-axis
    this.context.beginPath()
    this.context.moveTo(margins.left, margins.top)
    this.context.lineTo(margins.left, margins.top + chartHeight)
    this.context.stroke()

    // X-axis ticks
    const xTicks = this.xScale.ticks(6)
    this.context.fillStyle = '#666'
    this.context.font = '10px Arial'
    this.context.textAlign = 'center'

    xTicks.forEach(tick => {
      const x = this.xScale!(tick)
      this.context.beginPath()
      this.context.moveTo(x, margins.top + chartHeight)
      this.context.lineTo(x, margins.top + chartHeight + 5)
      this.context.stroke()

      this.context.fillText(
        d3.timeFormat('%m/%d')(tick),
        x,
        margins.top + chartHeight + 18
      )
    })

    // Y-axis ticks
    const yTicks = this.yScale.ticks(6)
    this.context.textAlign = 'right'

    yTicks.forEach(tick => {
      const y = this.yScale!(tick)
      this.context.beginPath()
      this.context.moveTo(margins.left - 5, y)
      this.context.lineTo(margins.left, y)
      this.context.stroke()

      this.context.fillText(
        tick.toLocaleString(),
        margins.left - 8,
        y + 3
      )
    })
  }

  // Find closest point for interaction
  public findPointAt(x: number, y: number, tolerance: number = 10): {
    series: TimeSeriesData
    point: TimeSeriesDataPoint
  } | null {
    if (!this.xScale || !this.yScale) return null

    let closest: { series: TimeSeriesData; point: TimeSeriesDataPoint; distance: number } | null = null

    this.data.forEach(series => {
      series.points.forEach(point => {
        const px = this.xScale!(point.date)
        const py = this.yScale!(point.value)
        const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))

        if (distance <= tolerance && (!closest || distance < closest.distance)) {
          closest = { series, point, distance }
        }
      })
    })

    return closest ? { series: closest.series, point: closest.point } : null
  }

  public dispose() {
    // Clean up resources if needed
    this.data = []
  }
}

// Canvas-based area chart renderer
export class CanvasAreaRenderer extends CanvasLineRenderer {
  protected renderSeries(series: TimeSeriesData, seriesIndex: number) {
    if (!this.xScale || !this.yScale || !series.points.length) return

    let points = series.points
    if (points.length > this.options.maxPoints) {
      points = this.samplePoints(points, this.options.maxPoints)
    }

    const color = series.color || d3.schemeCategory10[seriesIndex % 10]
    
    // Fill area
    this.context.fillStyle = color + '30' // Add transparency
    this.context.beginPath()
    
    // Start at bottom-left
    const firstPoint = points[0]
    this.context.moveTo(
      this.xScale(firstPoint.date),
      this.yScale(0)
    )
    
    // Draw line to first data point
    this.context.lineTo(
      this.xScale(firstPoint.date),
      this.yScale(firstPoint.value)
    )

    // Draw area outline
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.context.lineTo(
        this.xScale(point.date),
        this.yScale(point.value)
      )
    }

    // Close area at bottom-right
    const lastPoint = points[points.length - 1]
    this.context.lineTo(
      this.xScale(lastPoint.date),
      this.yScale(0)
    )
    this.context.closePath()
    this.context.fill()

    // Draw stroke on top
    super.renderSeries(series, seriesIndex)
  }
}

// Utility function to determine if canvas rendering should be used
export const shouldUseCanvas = (data: TimeSeriesData[]): boolean => {
  const totalPoints = data.reduce((sum, series) => sum + series.points.length, 0)
  return totalPoints > 10000 // Threshold for switching to canvas
}

// Factory function to create appropriate renderer
export const createRenderer = (
  canvas: HTMLCanvasElement,
  options: CanvasRenderOptions,
  type: 'line' | 'area' = 'line'
) => {
  switch (type) {
    case 'area':
      return new CanvasAreaRenderer(canvas, options)
    case 'line':
    default:
      return new CanvasLineRenderer(canvas, options)
  }
}

// Performance monitoring
export class CanvasPerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()

  public measureFrame() {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = this.frameCount
      this.frameCount = 0
      this.lastTime = currentTime
      
      return {
        fps,
        timestamp: currentTime,
        performance: fps >= 30 ? 'good' : fps >= 15 ? 'fair' : 'poor'
      }
    }
    
    return null
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CanvasLineRenderer,
    CanvasAreaRenderer,
    shouldUseCanvas,
    createRenderer,
    CanvasPerformanceMonitor
  }
}