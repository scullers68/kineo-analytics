import { TimeSeriesData, TimeSeriesDataPoint } from '../types/time-series'

export class TimeSeriesDataManager {
  private data: TimeSeriesData[] = []
  private listeners: Array<(data: TimeSeriesData[]) => void> = []

  constructor(initialData: TimeSeriesData[] = []) {
    this.data = [...initialData]
  }

  // Get all data
  getData(): TimeSeriesData[] {
    return [...this.data]
  }

  // Set data and notify listeners
  setData(newData: TimeSeriesData[]): void {
    this.data = [...newData]
    this.notifyListeners()
  }

  // Add a new series
  addSeries(series: TimeSeriesData): void {
    // Check if series already exists
    const existingIndex = this.data.findIndex(s => s.id === series.id)
    
    if (existingIndex >= 0) {
      // Update existing series
      this.data[existingIndex] = { ...series }
    } else {
      // Add new series
      this.data.push({ ...series })
    }
    
    this.notifyListeners()
  }

  // Remove a series by ID
  removeSeries(seriesId: string): boolean {
    const initialLength = this.data.length
    this.data = this.data.filter(s => s.id !== seriesId)
    
    if (this.data.length !== initialLength) {
      this.notifyListeners()
      return true
    }
    
    return false
  }

  // Update a specific series
  updateSeries(seriesId: string, updates: Partial<TimeSeriesData>): boolean {
    const seriesIndex = this.data.findIndex(s => s.id === seriesId)
    
    if (seriesIndex >= 0) {
      this.data[seriesIndex] = { ...this.data[seriesIndex], ...updates }
      this.notifyListeners()
      return true
    }
    
    return false
  }

  // Add data point to a series
  addDataPoint(seriesId: string, point: TimeSeriesDataPoint): boolean {
    const series = this.data.find(s => s.id === seriesId)
    
    if (series) {
      // Check for duplicate date
      const existingPointIndex = series.points.findIndex(
        p => p.date.getTime() === point.date.getTime()
      )
      
      if (existingPointIndex >= 0) {
        // Update existing point
        series.points[existingPointIndex] = { ...point }
      } else {
        // Add new point and sort by date
        series.points.push({ ...point })
        series.points.sort((a, b) => a.date.getTime() - b.date.getTime())
      }
      
      this.notifyListeners()
      return true
    }
    
    return false
  }

  // Remove data point from a series
  removeDataPoint(seriesId: string, date: Date): boolean {
    const series = this.data.find(s => s.id === seriesId)
    
    if (series) {
      const initialLength = series.points.length
      series.points = series.points.filter(p => p.date.getTime() !== date.getTime())
      
      if (series.points.length !== initialLength) {
        this.notifyListeners()
        return true
      }
    }
    
    return false
  }

  // Filter data by date range
  filterByDateRange(startDate: Date, endDate: Date): TimeSeriesData[] {
    return this.data.map(series => ({
      ...series,
      points: series.points.filter(point => 
        point.date >= startDate && point.date <= endDate
      )
    }))
  }

  // Get data for specific series
  getSeries(seriesId: string): TimeSeriesData | undefined {
    return this.data.find(s => s.id === seriesId)
  }

  // Get series by label (case insensitive)
  getSeriesByLabel(label: string): TimeSeriesData | undefined {
    return this.data.find(s => s.label.toLowerCase() === label.toLowerCase())
  }

  // Get data statistics
  getStatistics() {
    const totalSeries = this.data.length
    const totalPoints = this.data.reduce((sum, series) => sum + series.points.length, 0)
    
    let minDate: Date | null = null
    let maxDate: Date | null = null
    let minValue = Infinity
    let maxValue = -Infinity

    this.data.forEach(series => {
      series.points.forEach(point => {
        if (!minDate || point.date < minDate) minDate = point.date
        if (!maxDate || point.date > maxDate) maxDate = point.date
        if (point.value < minValue) minValue = point.value
        if (point.value > maxValue) maxValue = point.value
      })
    })

    return {
      totalSeries,
      totalPoints,
      dateRange: minDate && maxDate ? [minDate, maxDate] as [Date, Date] : null,
      valueRange: minValue !== Infinity && maxValue !== -Infinity ? [minValue, maxValue] as [number, number] : null,
      averagePointsPerSeries: totalSeries > 0 ? totalPoints / totalSeries : 0
    }
  }

  // Subscribe to data changes
  subscribe(listener: (data: TimeSeriesData[]) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index >= 0) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notify all listeners of data changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.data])
      } catch (error) {
        console.error('Error in data manager listener:', error)
      }
    })
  }

  // Batch operations to reduce notifications
  batch(operations: () => void): void {
    const originalNotify = this.notifyListeners
    this.notifyListeners = () => {} // Disable notifications temporarily
    
    try {
      operations()
    } finally {
      this.notifyListeners = originalNotify // Restore notifications
      this.notifyListeners() // Send single notification for all changes
    }
  }

  // Clear all data
  clear(): void {
    this.data = []
    this.notifyListeners()
  }

  // Clone the manager with current data
  clone(): TimeSeriesDataManager {
    return new TimeSeriesDataManager([...this.data])
  }

  // Export data as JSON
  toJSON(): string {
    return JSON.stringify(this.data, (key, value) => {
      // Convert dates to ISO strings for JSON serialization
      if (key === 'date' && value instanceof Date) {
        return value.toISOString()
      }
      return value
    }, 2)
  }

  // Import data from JSON
  fromJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString)
      
      if (!Array.isArray(parsed)) {
        return false
      }

      // Convert ISO date strings back to Date objects
      const data: TimeSeriesData[] = parsed.map(series => ({
        ...series,
        points: series.points?.map((point: any) => ({
          ...point,
          date: new Date(point.date)
        })) || []
      }))

      this.setData(data)
      return true
    } catch (error) {
      console.error('Error parsing JSON data:', error)
      return false
    }
  }

  // Validate data integrity
  validate(): Array<{ seriesId: string; error: string }> {
    const errors: Array<{ seriesId: string; error: string }> = []

    this.data.forEach(series => {
      if (!series.id) {
        errors.push({ seriesId: 'unknown', error: 'Series missing ID' })
      }
      
      if (!series.label) {
        errors.push({ seriesId: series.id || 'unknown', error: 'Series missing label' })
      }

      if (!Array.isArray(series.points)) {
        errors.push({ seriesId: series.id || 'unknown', error: 'Series points is not an array' })
        return
      }

      series.points.forEach((point, index) => {
        if (!(point.date instanceof Date)) {
          errors.push({ seriesId: series.id, error: `Point ${index} has invalid date` })
        } else if (isNaN(point.date.getTime())) {
          errors.push({ seriesId: series.id, error: `Point ${index} has invalid date value` })
        }

        if (typeof point.value !== 'number' || isNaN(point.value)) {
          errors.push({ seriesId: series.id, error: `Point ${index} has invalid value` })
        }
      })

      // Check for duplicate dates
      const dates = series.points.map(p => p.date.getTime())
      const uniqueDates = new Set(dates)
      if (dates.length !== uniqueDates.size) {
        errors.push({ seriesId: series.id, error: 'Series contains duplicate dates' })
      }
    })

    return errors
  }
}

// Export default and named
export default TimeSeriesDataManager

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimeSeriesDataManager, default: TimeSeriesDataManager }
}