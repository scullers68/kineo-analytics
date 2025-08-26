import { PieDataPoint } from '../types/pie-chart'
import { calculatePercentages, groupSmallSlices, sortPieData } from './pie-chart-math'

/**
 * Transform raw data into pie chart format
 */
export const transformPieData = (
  rawData: Array<{ label: string; value: number; [key: string]: any }>,
  options: {
    sortByValue?: boolean
    ascending?: boolean
    groupSmallSlices?: boolean
    smallSliceThreshold?: number
    othersLabel?: string
    colorMapping?: Record<string, string>
  } = {}
): PieDataPoint[] => {
  // Transform to PieDataPoint format
  let transformedData: PieDataPoint[] = rawData.map((item, index) => ({
    x: item.label,
    y: index,
    value: Math.abs(item.value), // Ensure positive values
    label: item.label,
    color: options.colorMapping?.[item.label],
    metadata: { ...item, originalValue: item.value }
  }))

  // Calculate percentages
  transformedData = calculatePercentages(transformedData)

  // Sort if requested
  if (options.sortByValue) {
    transformedData = sortPieData(transformedData, options.ascending)
  }

  // Group small slices if requested
  if (options.groupSmallSlices && options.smallSliceThreshold) {
    transformedData = groupSmallSlices(
      transformedData,
      options.smallSliceThreshold,
      options.othersLabel
    )
  }

  return transformedData
}

/**
 * Validate pie chart data
 */
export const validatePieData = (
  data: PieDataPoint[]
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if data array is empty
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Data array is empty or invalid')
    return { isValid: false, errors, warnings }
  }

  // Check each data point
  data.forEach((item, index) => {
    // Required fields
    if (typeof item.value !== 'number') {
      errors.push(`Item at index ${index}: value must be a number`)
    }
    
    if (!item.label || typeof item.label !== 'string') {
      errors.push(`Item at index ${index}: label must be a non-empty string`)
    }

    // Value validation
    if (typeof item.value === 'number') {
      if (item.value < 0) {
        warnings.push(`Item at index ${index}: negative value will be converted to positive`)
      }
      
      if (item.value === 0) {
        warnings.push(`Item at index ${index}: zero value will create invisible slice`)
      }
      
      if (!isFinite(item.value)) {
        errors.push(`Item at index ${index}: value must be finite`)
      }
    }

    // Color validation
    if (item.color && typeof item.color !== 'string') {
      warnings.push(`Item at index ${index}: color should be a string`)
    }
  })

  // Check for duplicate labels
  const labels = data.map(d => d.label).filter(Boolean)
  const uniqueLabels = new Set(labels)
  if (labels.length !== uniqueLabels.size) {
    warnings.push('Duplicate labels found - this may cause confusion')
  }

  // Check total value
  const totalValue = data.reduce((sum, d) => sum + Math.abs(d.value), 0)
  if (totalValue === 0) {
    errors.push('Total value is zero - chart cannot be rendered')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Normalize pie data for consistent rendering
 */
export const normalizePieData = (
  data: PieDataPoint[],
  options: {
    ensurePositiveValues?: boolean
    removeZeroValues?: boolean
    limitSlices?: number
    fillMissingColors?: boolean
    colorScheme?: string[]
  } = {}
): PieDataPoint[] => {
  let normalizedData = [...data]

  // Ensure positive values
  if (options.ensurePositiveValues) {
    normalizedData = normalizedData.map(d => ({
      ...d,
      value: Math.abs(d.value)
    }))
  }

  // Remove zero values
  if (options.removeZeroValues) {
    normalizedData = normalizedData.filter(d => d.value > 0)
  }

  // Limit number of slices
  if (options.limitSlices && normalizedData.length > options.limitSlices) {
    const topSlices = normalizedData.slice(0, options.limitSlices - 1)
    const remainingSlices = normalizedData.slice(options.limitSlices - 1)
    const othersValue = remainingSlices.reduce((sum, d) => sum + d.value, 0)
    
    if (othersValue > 0) {
      const othersSlice: PieDataPoint = {
        x: 'Others',
        y: topSlices.length,
        value: othersValue,
        label: 'Others',
        category: 'grouped',
        metadata: {
          originalSlices: remainingSlices,
          count: remainingSlices.length
        }
      }
      normalizedData = [...topSlices, othersSlice]
    } else {
      normalizedData = topSlices
    }
  }

  // Fill missing colors
  if (options.fillMissingColors && options.colorScheme) {
    normalizedData = normalizedData.map((d, index) => ({
      ...d,
      color: d.color || options.colorScheme![index % options.colorScheme!.length]
    }))
  }

  return normalizedData
}

/**
 * Aggregate pie data by category
 */
export const aggregatePieDataByCategory = (
  data: PieDataPoint[],
  categoryKey: string = 'category'
): PieDataPoint[] => {
  const categoryMap = new Map<string, PieDataPoint>()

  data.forEach(item => {
    const category = (item as any)[categoryKey] || item.label
    
    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category)!
      existing.value += item.value
      existing.metadata = {
        ...existing.metadata,
        aggregatedItems: [...(existing.metadata?.aggregatedItems || []), item]
      }
    } else {
      categoryMap.set(category, {
        ...item,
        label: category,
        metadata: {
          ...item.metadata,
          aggregatedItems: [item]
        }
      })
    }
  })

  return Array.from(categoryMap.values())
}

/**
 * Filter pie data based on criteria
 */
export const filterPieData = (
  data: PieDataPoint[],
  filters: {
    minValue?: number
    maxValue?: number
    minPercentage?: number
    maxPercentage?: number
    includeLabels?: string[]
    excludeLabels?: string[]
    includeCategories?: string[]
    excludeCategories?: string[]
  }
): PieDataPoint[] => {
  let filteredData = [...data]

  // Calculate percentages if needed for percentage-based filtering
  const dataWithPercentages = calculatePercentages(filteredData)

  return dataWithPercentages.filter(item => {
    // Value filters
    if (filters.minValue !== undefined && item.value < filters.minValue) return false
    if (filters.maxValue !== undefined && item.value > filters.maxValue) return false

    // Percentage filters
    if (filters.minPercentage !== undefined && (item.percentage || 0) < filters.minPercentage) return false
    if (filters.maxPercentage !== undefined && (item.percentage || 0) > filters.maxPercentage) return false

    // Label filters
    if (filters.includeLabels && !filters.includeLabels.includes(item.label)) return false
    if (filters.excludeLabels && filters.excludeLabels.includes(item.label)) return false

    // Category filters
    const category = item.category || 'uncategorized'
    if (filters.includeCategories && !filters.includeCategories.includes(category)) return false
    if (filters.excludeCategories && filters.excludeCategories.includes(category)) return false

    return true
  })
}

/**
 * Compare two pie datasets and generate diff
 */
export const comparePieData = (
  beforeData: PieDataPoint[],
  afterData: PieDataPoint[]
): {
  added: PieDataPoint[]
  removed: PieDataPoint[]
  changed: Array<{
    before: PieDataPoint
    after: PieDataPoint
    valueDiff: number
    percentageChange: number
  }>
  unchanged: PieDataPoint[]
} => {
  const beforeMap = new Map(beforeData.map(d => [d.label, d]))
  const afterMap = new Map(afterData.map(d => [d.label, d]))

  const added: PieDataPoint[] = []
  const removed: PieDataPoint[] = []
  const changed: Array<{ before: PieDataPoint; after: PieDataPoint; valueDiff: number; percentageChange: number }> = []
  const unchanged: PieDataPoint[] = []

  // Find added items
  afterData.forEach(afterItem => {
    if (!beforeMap.has(afterItem.label)) {
      added.push(afterItem)
    }
  })

  // Find removed items
  beforeData.forEach(beforeItem => {
    if (!afterMap.has(beforeItem.label)) {
      removed.push(beforeItem)
    }
  })

  // Find changed and unchanged items
  beforeData.forEach(beforeItem => {
    const afterItem = afterMap.get(beforeItem.label)
    if (afterItem) {
      if (beforeItem.value !== afterItem.value) {
        const valueDiff = afterItem.value - beforeItem.value
        const percentageChange = beforeItem.value !== 0 
          ? (valueDiff / beforeItem.value) * 100 
          : afterItem.value > 0 ? 100 : 0

        changed.push({
          before: beforeItem,
          after: afterItem,
          valueDiff,
          percentageChange
        })
      } else {
        unchanged.push(afterItem)
      }
    }
  })

  return { added, removed, changed, unchanged }
}

/**
 * Generate sample pie data for testing/demos
 */
export const generateSamplePieData = (
  count: number = 5,
  categories: string[] = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
): PieDataPoint[] => {
  return categories.slice(0, count).map((category, index) => ({
    x: category,
    y: index,
    value: Math.floor(Math.random() * 100) + 10, // Random value between 10-110
    label: category,
    category: category.toLowerCase().replace(/\s+/g, '_'),
    metadata: {
      description: `Sample data for ${category}`,
      generatedAt: new Date().toISOString()
    }
  }))
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    transformPieData,
    validatePieData,
    normalizePieData,
    aggregatePieDataByCategory,
    filterPieData,
    comparePieData,
    generateSamplePieData,
    groupSmallSlices
  }
}