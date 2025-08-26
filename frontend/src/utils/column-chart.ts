import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { ColumnChartConfig } from '../types/column-chart'

// Column positioning calculations  
export const calculateColumnDimensions = (
  data: ChartDataPoint[],
  width: number,
  height: number,
  config: ColumnChartConfig = {},
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const { columnPadding = 0.1, groupPadding = 0.05 } = config
  
  // Column charts are typically vertical by default
  const bandScale = d3.scaleBand()
    .domain(data.map(d => String(d.x)))
    .range([0, width])
    .padding(columnPadding)
  
  return {
    bandwidth: bandScale.bandwidth(),
    scale: bandScale
  }
}

// Column value scale calculations
export const calculateColumnValueScale = (
  data: ChartDataPoint[],
  width: number,
  height: number,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const maxValue = d3.max(data, d => d.y) || 0
  const minValue = Math.min(0, d3.min(data, d => d.y) || 0)
  
  return d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([height, 0])
    .nice()
}

// Column positioning helper
export const getColumnPosition = (
  dataPoint: ChartDataPoint,
  bandScale: d3.ScaleBand<string>,
  valueScale: d3.ScaleLinear<number, number>
) => {
  const x = String(dataPoint.x)
  const bandPosition = bandScale(x) || 0
  const valuePosition = valueScale(dataPoint.y)
  const zeroPosition = valueScale(0)
  
  return {
    x: bandPosition,
    y: Math.min(zeroPosition, valuePosition),
    width: bandScale.bandwidth(),
    height: Math.abs(valuePosition - zeroPosition)
  }
}

// Sort column data
export const sortColumnData = (
  data: ChartDataPoint[],
  sortBy: 'value' | 'label' | 'custom' = 'custom',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  const sortedData = [...data]
  
  if (sortBy === 'value') {
    sortedData.sort((a, b) => sortOrder === 'asc' ? a.y - b.y : b.y - a.y)
  } else if (sortBy === 'label') {
    sortedData.sort((a, b) => {
      const aLabel = String(a.x)
      const bLabel = String(b.x)
      return sortOrder === 'asc' ? aLabel.localeCompare(bLabel) : bLabel.localeCompare(aLabel)
    })
  }
  
  return sortedData
}

// Default column chart configuration
export const getDefaultColumnConfig = (): Required<ColumnChartConfig> => ({
  columnPadding: 0.1,
  groupPadding: 0.05,
  showLabels: true,
  labelPosition: 'outside',
  sortBy: 'custom',
  sortOrder: 'asc',
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
      grid: '#e5e7eb'
    },
    fonts: {
      family: 'Inter, system-ui, sans-serif',
      size: {
        small: 12,
        medium: 14,
        large: 16
      }
    },
    spacing: {
      small: 4,
      medium: 8,
      large: 16
    }
  },
  animation: {
    duration: 750,
    easing: 'ease-in-out',
    stagger: 50,
    enabled: true
  },
  accessibility: {
    enabled: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrast: false
  }
})

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateColumnDimensions,
    calculateColumnValueScale,
    getColumnPosition,
    sortColumnData,
    getDefaultColumnConfig
  }
}