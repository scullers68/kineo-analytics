import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChartDataPoint } from '../types/store'
import { ChartSeries } from '../types/chart-variants'
import { transformBarData, validateBarData, aggregateBarData, normalizeBarData } from '../utils/bar-data-transformer'
import { DataSeriesManager } from '../utils/data-series-manager'

export interface UseBarChartDataOptions {
  initialData?: ChartDataPoint[]
  variant?: 'simple' | 'grouped' | 'stacked'
  aggregationType?: 'sum' | 'average' | 'count'
  normalizeData?: boolean
  validateOnChange?: boolean
}

export const useBarChartData = (options: UseBarChartDataOptions = {}) => {
  const {
    initialData = [],
    variant = 'simple',
    aggregationType = 'sum',
    normalizeData = false,
    validateOnChange = true
  } = options

  const [rawData, setRawData] = useState<ChartDataPoint[]>(initialData)
  const [seriesManager] = useState(() => new DataSeriesManager())
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Processed data based on variant and options
  const processedData = useMemo(() => {
    if (!rawData.length) return []

    let processed = [...rawData]

    // Apply aggregation if needed
    if (variant !== 'simple' && aggregationType !== 'sum') {
      processed = aggregateBarData(processed, aggregationType)
    }

    // Apply normalization if requested
    if (normalizeData) {
      processed = normalizeBarData(processed)
    }

    return processed
  }, [rawData, variant, aggregationType, normalizeData])

  // Series data for grouped/stacked variants
  const seriesData = useMemo(() => {
    if (variant === 'simple') return []
    
    return seriesManager.getVisibleSeries()
  }, [variant, seriesManager])

  // Combined statistics across all data
  const statistics = useMemo(() => {
    if (!processedData.length) {
      return { min: 0, max: 0, avg: 0, total: 0, count: 0 }
    }

    const values = processedData.map(d => d.y)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const total = values.reduce((sum, v) => sum + v, 0)
    const avg = total / values.length
    const count = values.length

    return { min, max, avg, total, count }
  }, [processedData])

  // Validate data when it changes
  useEffect(() => {
    if (validateOnChange && rawData.length > 0) {
      const { isValid, errors } = validateBarData(rawData)
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }
  }, [rawData, validateOnChange])

  // Update raw data
  const updateData = useCallback((newData: ChartDataPoint[] | any[]) => {
    setIsLoading(true)
    
    try {
      // If data is not in ChartDataPoint format, try to transform it
      let transformedData: ChartDataPoint[]
      
      if (Array.isArray(newData) && newData.length > 0) {
        const firstItem = newData[0]
        if (firstItem && typeof firstItem === 'object' && 'x' in firstItem && 'y' in firstItem) {
          // Already in correct format
          transformedData = newData as ChartDataPoint[]
        } else {
          // Try to transform
          transformedData = transformBarData(newData)
        }
      } else {
        transformedData = []
      }

      setRawData(transformedData)
      
      // Update series manager for grouped/stacked variants
      if (variant !== 'simple') {
        const manager = DataSeriesManager.fromFlatData(transformedData)
        seriesManager.clearAll()
        manager.getAllSeries().forEach(series => {
          seriesManager.addSeries(series)
        })
      }
      
    } catch (error) {
      console.error('Error updating bar chart data:', error)
      setValidationErrors([error instanceof Error ? error.message : 'Data transformation failed'])
    } finally {
      setIsLoading(false)
    }
  }, [variant, seriesManager])

  // Add new data points
  const addDataPoint = useCallback((dataPoint: ChartDataPoint) => {
    setRawData(prev => [...prev, dataPoint])
  }, [])

  // Remove data points
  const removeDataPoint = useCallback((predicate: (item: ChartDataPoint) => boolean) => {
    setRawData(prev => prev.filter(item => !predicate(item)))
  }, [])

  // Update specific data point
  const updateDataPoint = useCallback((
    predicate: (item: ChartDataPoint) => boolean,
    updater: (item: ChartDataPoint) => ChartDataPoint
  ) => {
    setRawData(prev => prev.map(item => predicate(item) ? updater(item) : item))
  }, [])

  // Clear all data
  const clearData = useCallback(() => {
    setRawData([])
    seriesManager.clearAll()
    setValidationErrors([])
  }, [seriesManager])

  // Filter data
  const filterData = useCallback((predicate: (item: ChartDataPoint) => boolean) => {
    return processedData.filter(predicate)
  }, [processedData])

  // Sort data
  const sortData = useCallback((
    compareFn?: (a: ChartDataPoint, b: ChartDataPoint) => number
  ) => {
    if (!compareFn) {
      // Default sort by x value
      return [...processedData].sort((a, b) => {
        const aX = typeof a.x === 'string' ? a.x : String(a.x)
        const bX = typeof b.x === 'string' ? b.x : String(b.x)
        return aX.localeCompare(bX)
      })
    }
    return [...processedData].sort(compareFn)
  }, [processedData])

  // Group data by a key
  const groupDataBy = useCallback((key: keyof ChartDataPoint | string) => {
    return processedData.reduce((groups, item) => {
      let groupKey: string
      
      if (key in item) {
        groupKey = String(item[key as keyof ChartDataPoint])
      } else if (item.metadata && key in item.metadata) {
        groupKey = String(item.metadata[key])
      } else {
        groupKey = 'unknown'
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, ChartDataPoint[]>)
  }, [processedData])

  // Series management methods (for grouped/stacked variants)
  const toggleSeries = useCallback((seriesId: string) => {
    seriesManager.toggleSeriesVisibility(seriesId)
  }, [seriesManager])

  const addSeries = useCallback((series: ChartSeries) => {
    seriesManager.addSeries(series)
  }, [seriesManager])

  const removeSeries = useCallback((seriesId: string) => {
    seriesManager.removeSeries(seriesId)
  }, [seriesManager])

  return {
    // Data
    rawData,
    processedData,
    seriesData,
    statistics,
    
    // State
    isLoading,
    validationErrors,
    isValid: validationErrors.length === 0,
    
    // Methods
    updateData,
    addDataPoint,
    removeDataPoint,
    updateDataPoint,
    clearData,
    filterData,
    sortData,
    groupDataBy,
    
    // Series methods (for grouped/stacked variants)
    toggleSeries,
    addSeries,
    removeSeries,
    seriesManager
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useBarChartData }
}