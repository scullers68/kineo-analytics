import { useState, useCallback, useMemo } from 'react'
import { TimeSeriesData, TimeSeriesDataPoint, TimeSeriesGap } from '../types/time-series'
import { calculateTimeRange, detectTimeGaps, getAdaptiveTimeFormat, interpolateMissingData } from '../utils/time-series'
import { transformTimeSeriesData, validateTimeSeriesData, aggregateByInterval, resampleToTargetCount } from '../utils/line-data-transformer'

export interface UseTimeSeriesChartOptions {
  data: TimeSeriesData[]
  maxPoints?: number
  gapThreshold?: number
  interpolationMethod?: 'linear' | 'polynomial' | 'none'
  enableGapDetection?: boolean
  enableDataResampling?: boolean
  aggregationInterval?: 'hour' | 'day' | 'week' | 'month'
}

export const useTimeSeriesChart = ({
  data = [],
  maxPoints = 1000,
  gapThreshold = 86400000, // 24 hours
  interpolationMethod = 'linear',
  enableGapDetection = true,
  enableDataResampling = true,
  aggregationInterval
}: UseTimeSeriesChartOptions) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Validate input data
  const validationErrors = useMemo(() => {
    return validateTimeSeriesData(data)
  }, [data])

  // Calculate time range from data
  const timeRange = useMemo(() => {
    if (!data.length) return null
    return calculateTimeRange(data)
  }, [data])

  // Detect gaps in all series
  const gaps = useMemo(() => {
    if (!enableGapDetection) return []
    
    const allGaps: Array<TimeSeriesGap & { seriesLabel: string }> = []
    
    data.forEach(series => {
      const seriesGaps = detectTimeGaps(series, gapThreshold)
      seriesGaps.forEach(gap => {
        allGaps.push({
          ...gap,
          seriesLabel: series.label
        })
      })
    })
    
    return allGaps
  }, [data, enableGapDetection, gapThreshold])

  // Process data for optimal visualization
  const processedData = useMemo(() => {
    if (!data.length) return data
    
    let processed = data
    
    // Apply aggregation if specified
    if (aggregationInterval) {
      processed = processed.map(series => 
        aggregateByInterval(series, aggregationInterval)
      )
    }
    
    // Resample data if it exceeds maxPoints
    if (enableDataResampling) {
      processed = processed.map(series => {
        if (series.points.length > maxPoints) {
          return resampleToTargetCount(series, maxPoints)
        }
        return series
      })
    }
    
    // Interpolate missing data if enabled
    if (interpolationMethod !== 'none') {
      processed = processed.map(series => ({
        ...series,
        points: interpolateMissingData(series.points, interpolationMethod)
      }))
    }
    
    return processed
  }, [data, maxPoints, enableDataResampling, interpolationMethod, aggregationInterval])

  // Get adaptive time formatting
  const getTimeFormat = useCallback((screenWidth: number = 1024) => {
    if (!timeRange) return '%Y-%m-%d'
    return getAdaptiveTimeFormat(timeRange, screenWidth)
  }, [timeRange])

  // Transform raw data to time series format
  const transformData = useCallback((
    rawData: any[],
    config: {
      dateField: string
      valueField: string
      seriesField?: string
      idField?: string
      labelField?: string
    }
  ) => {
    setIsProcessing(true)
    
    try {
      const transformed = transformTimeSeriesData(rawData, config)
      setErrors([])
      return transformed
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown transformation error'
      setErrors([errorMessage])
      return []
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Filter data by date range
  const filterByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return processedData.map(series => ({
      ...series,
      points: series.points.filter(point => 
        point.date >= startDate && point.date <= endDate
      )
    }))
  }, [processedData])

  // Get series statistics
  const getSeriesStats = useCallback((seriesId?: string) => {
    const seriesToAnalyze = seriesId 
      ? processedData.filter(s => s.id === seriesId)
      : processedData

    return seriesToAnalyze.map(series => {
      const values = series.points.map(p => p.value)
      if (values.length === 0) {
        return {
          seriesId: series.id,
          label: series.label,
          count: 0,
          min: 0,
          max: 0,
          mean: 0,
          median: 0,
          stdDev: 0
        }
      }

      const sortedValues = [...values].sort((a, b) => a - b)
      const min = sortedValues[0]
      const max = sortedValues[sortedValues.length - 1]
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length
      const median = sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)]

      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)

      return {
        seriesId: series.id,
        label: series.label,
        count: values.length,
        min,
        max,
        mean,
        median,
        stdDev
      }
    })
  }, [processedData])

  // Find outliers using IQR method
  const findOutliers = useCallback((seriesId?: string) => {
    const seriesToAnalyze = seriesId 
      ? processedData.filter(s => s.id === seriesId)
      : processedData

    const outliers: Array<{
      seriesId: string
      seriesLabel: string
      point: TimeSeriesDataPoint
      score: number
    }> = []

    seriesToAnalyze.forEach(series => {
      const values = series.points.map(p => p.value).sort((a, b) => a - b)
      if (values.length < 4) return // Need at least 4 points for quartiles

      const q1Index = Math.floor(values.length * 0.25)
      const q3Index = Math.floor(values.length * 0.75)
      const q1 = values[q1Index]
      const q3 = values[q3Index]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr

      series.points.forEach(point => {
        if (point.value < lowerBound || point.value > upperBound) {
          const score = point.value < lowerBound 
            ? (lowerBound - point.value) / iqr
            : (point.value - upperBound) / iqr

          outliers.push({
            seriesId: series.id,
            seriesLabel: series.label,
            point,
            score
          })
        }
      })
    })

    return outliers.sort((a, b) => b.score - a.score)
  }, [processedData])

  // Get data density information
  const getDataDensity = useCallback(() => {
    if (!timeRange) return null

    const totalTimeSpan = timeRange[1].getTime() - timeRange[0].getTime()
    const totalPoints = processedData.reduce((sum, series) => sum + series.points.length, 0)
    const avgPointsPerSeries = totalPoints / (processedData.length || 1)
    
    // Calculate average time between points
    let totalIntervals = 0
    let intervalSum = 0

    processedData.forEach(series => {
      const sortedPoints = [...series.points].sort((a, b) => a.date.getTime() - b.date.getTime())
      for (let i = 1; i < sortedPoints.length; i++) {
        intervalSum += sortedPoints[i].date.getTime() - sortedPoints[i - 1].date.getTime()
        totalIntervals++
      }
    })

    const avgInterval = totalIntervals > 0 ? intervalSum / totalIntervals : 0

    return {
      totalTimeSpan,
      totalPoints,
      avgPointsPerSeries,
      avgInterval,
      density: totalPoints / (totalTimeSpan / (1000 * 60 * 60 * 24)) // points per day
    }
  }, [processedData, timeRange])

  return {
    // Processed data
    processedData,
    originalData: data,
    
    // Validation and errors
    validationErrors,
    errors,
    isProcessing,
    
    // Time range information
    timeRange,
    gaps,
    
    // Utility functions
    getTimeFormat,
    transformData,
    filterByDateRange,
    getSeriesStats,
    findOutliers,
    getDataDensity,
    
    // Processing information
    processingInfo: {
      originalPointCount: data.reduce((sum, series) => sum + series.points.length, 0),
      processedPointCount: processedData.reduce((sum, series) => sum + series.points.length, 0),
      resampled: data.some((series, i) => series.points.length !== processedData[i]?.points.length),
      gapCount: gaps.length,
      aggregationApplied: !!aggregationInterval
    }
  }
}

export default useTimeSeriesChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useTimeSeriesChart, default: useTimeSeriesChart }
}