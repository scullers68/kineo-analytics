import * as d3 from 'd3'
import { ChartDataPoint } from '../types/store'
import { BarChartConfig } from '../types/bar-chart'

// Bar positioning calculations
export const calculateBarDimensions = (
  data: ChartDataPoint[],
  width: number,
  height: number,
  config: BarChartConfig = {},
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const { barPadding = 0.1, groupPadding = 0.05 } = config
  
  if (orientation === 'vertical') {
    const bandScale = d3.scaleBand()
      .domain(data.map(d => String(d.x)))
      .range([0, width])
      .padding(barPadding)
    
    return {
      bandwidth: bandScale.bandwidth(),
      scale: bandScale
    }
  } else {
    const bandScale = d3.scaleBand()
      .domain(data.map(d => String(d.x)))
      .range([height, 0])
      .padding(barPadding)
    
    return {
      bandwidth: bandScale.bandwidth(),
      scale: bandScale
    }
  }
}

// Value scale calculations
export const calculateValueScale = (
  data: ChartDataPoint[],
  width: number,
  height: number,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const maxValue = d3.max(data, d => d.y) || 0
  const minValue = Math.min(0, d3.min(data, d => d.y) || 0)
  
  if (orientation === 'vertical') {
    return d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([height, 0])
      .nice()
  } else {
    return d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, width])
      .nice()
  }
}

// Bar positioning helper
export const getBarPosition = (
  dataPoint: ChartDataPoint,
  bandScale: d3.ScaleBand<string>,
  valueScale: d3.ScaleLinear<number, number>,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const x = String(dataPoint.x)
  const bandPosition = bandScale(x) || 0
  const valuePosition = valueScale(dataPoint.y)
  
  if (orientation === 'vertical') {
    return {
      x: bandPosition,
      y: valuePosition,
      width: bandScale.bandwidth(),
      height: Math.abs(valueScale(0) - valuePosition)
    }
  } else {
    return {
      x: Math.min(valueScale(0), valuePosition),
      y: bandPosition,
      width: Math.abs(valuePosition - valueScale(0)),
      height: bandScale.bandwidth()
    }
  }
}

// Sort data based on configuration
export const sortBarData = (
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

// Default bar chart configuration
export const getDefaultBarConfig = (): Required<BarChartConfig> => ({
  barPadding: 0.1,
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
    calculateBarDimensions,
    calculateValueScale,
    getBarPosition,
    sortBarData,
    getDefaultBarConfig
  }
}