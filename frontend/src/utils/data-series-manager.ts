import { ChartDataPoint } from '../types/store'
import { ChartSeries } from '../types/chart-variants'

// Data Series Manager Class
export class DataSeriesManager {
  private series: Map<string, ChartSeries> = new Map()
  private listeners: Set<() => void> = new Set()

  constructor(initialSeries: ChartSeries[] = []) {
    initialSeries.forEach(s => this.addSeries(s))
  }

  // Add a new series
  addSeries(series: ChartSeries): void {
    this.series.set(series.id, { ...series })
    this.notifyListeners()
  }

  // Remove a series
  removeSeries(seriesId: string): boolean {
    const removed = this.series.delete(seriesId)
    if (removed) {
      this.notifyListeners()
    }
    return removed
  }

  // Update series data
  updateSeriesData(seriesId: string, data: ChartDataPoint[]): void {
    const series = this.series.get(seriesId)
    if (series) {
      series.data = [...data]
      this.notifyListeners()
    }
  }

  // Toggle series visibility
  toggleSeriesVisibility(seriesId: string): void {
    const series = this.series.get(seriesId)
    if (series) {
      series.visible = !series.visible
      this.notifyListeners()
    }
  }

  // Get all series
  getAllSeries(): ChartSeries[] {
    return Array.from(this.series.values())
  }

  // Get visible series only
  getVisibleSeries(): ChartSeries[] {
    return Array.from(this.series.values()).filter(s => s.visible !== false)
  }

  // Get series by ID
  getSeries(seriesId: string): ChartSeries | undefined {
    return this.series.get(seriesId)
  }

  // Get series count
  getSeriesCount(): number {
    return this.series.size
  }

  // Check if series exists
  hasSeries(seriesId: string): boolean {
    return this.series.has(seriesId)
  }

  // Clear all series
  clearAll(): void {
    this.series.clear()
    this.notifyListeners()
  }

  // Merge data from multiple series into flat array
  flattenSeriesData(): ChartDataPoint[] {
    const allData: ChartDataPoint[] = []
    
    this.getVisibleSeries().forEach(series => {
      series.data.forEach(point => {
        allData.push({
          ...point,
          metadata: {
            ...point.metadata,
            series: series.id,
            seriesLabel: series.label,
            seriesColor: series.color
          }
        })
      })
    })
    
    return allData
  }

  // Group series data by x value
  groupSeriesDataByX(): Record<string, Record<string, ChartDataPoint>> {
    const grouped: Record<string, Record<string, ChartDataPoint>> = {}
    
    this.getVisibleSeries().forEach(series => {
      series.data.forEach(point => {
        const xKey = String(point.x)
        if (!grouped[xKey]) {
          grouped[xKey] = {}
        }
        grouped[xKey][series.id] = point
      })
    })
    
    return grouped
  }

  // Calculate series statistics
  getSeriesStatistics(): Record<string, { min: number; max: number; avg: number; count: number }> {
    const stats: Record<string, { min: number; max: number; avg: number; count: number }> = {}
    
    this.getAllSeries().forEach(series => {
      const values = series.data.map(d => d.y)
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length
      const count = values.length
      
      stats[series.id] = { min, max, avg, count }
    })
    
    return stats
  }

  // Get combined value range across all series
  getCombinedValueRange(): { min: number; max: number } {
    let min = Infinity
    let max = -Infinity
    
    this.getVisibleSeries().forEach(series => {
      series.data.forEach(point => {
        min = Math.min(min, point.y)
        max = Math.max(max, point.y)
      })
    })
    
    return { 
      min: min === Infinity ? 0 : min, 
      max: max === -Infinity ? 0 : max 
    }
  }

  // Subscribe to series changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  // Create series from flat data array
  static fromFlatData(
    data: ChartDataPoint[], 
    seriesKey: string = 'series'
  ): DataSeriesManager {
    const seriesMap = new Map<string, ChartDataPoint[]>()
    
    data.forEach(point => {
      const seriesId = point.metadata?.[seriesKey] || 'default'
      if (!seriesMap.has(seriesId)) {
        seriesMap.set(seriesId, [])
      }
      seriesMap.get(seriesId)!.push(point)
    })
    
    const series: ChartSeries[] = Array.from(seriesMap.entries()).map(([id, seriesData]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      data: seriesData,
      visible: true
    }))
    
    return new DataSeriesManager(series)
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataSeriesManager }
}