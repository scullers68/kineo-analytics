import { Breakpoint, ViewportDimensions } from '../types/responsive'
import { BREAKPOINTS, RESPONSIVE_DIMENSIONS } from '../constants/breakpoints'

export interface ResponsiveLayoutConfig {
  breakpoint: Breakpoint
  columns: number
  gap: number
  margin: number
  containerMaxWidth?: number
}

export const calculateResponsiveLayout = (
  viewportDimensions: ViewportDimensions,
  itemCount: number = 1
): ResponsiveLayoutConfig => {
  const { width } = viewportDimensions
  
  let breakpoint: Breakpoint
  let columns: number
  let gap: number
  let margin: number
  
  if (width >= BREAKPOINTS['2xl']) {
    breakpoint = '2xl'
    columns = Math.min(itemCount, 4)
    gap = 24
    margin = 32
  } else if (width >= BREAKPOINTS.xl) {
    breakpoint = 'xl'
    columns = Math.min(itemCount, 3)
    gap = 20
    margin = 24
  } else if (width >= BREAKPOINTS.lg) {
    breakpoint = 'lg'
    columns = Math.min(itemCount, 2)
    gap = 16
    margin = 20
  } else if (width >= BREAKPOINTS.md) {
    breakpoint = 'md'
    columns = Math.min(itemCount, 2)
    gap = 12
    margin = 16
  } else if (width >= BREAKPOINTS.sm) {
    breakpoint = 'sm'
    columns = 1
    gap = 8
    margin = 12
  } else {
    breakpoint = 'xs'
    columns = 1
    gap = 8
    margin = 8
  }
  
  return {
    breakpoint,
    columns,
    gap,
    margin,
    containerMaxWidth: width - (margin * 2)
  }
}

export const getItemDimensions = (
  layout: ResponsiveLayoutConfig,
  aspectRatio: number = 16/9
): { width: number; height: number } => {
  const { containerMaxWidth = 1200, columns, gap } = layout
  
  const totalGaps = (columns - 1) * gap
  const availableWidth = containerMaxWidth - totalGaps
  const itemWidth = Math.floor(availableWidth / columns)
  const itemHeight = Math.floor(itemWidth / aspectRatio)
  
  return { width: itemWidth, height: itemHeight }
}

export const calculateGridLayout = (
  containerWidth: number,
  itemCount: number,
  minItemWidth: number = 200,
  gap: number = 16
): { columns: number; rows: number; itemWidth: number } => {
  const availableWidth = containerWidth - gap
  const maxColumns = Math.floor(availableWidth / (minItemWidth + gap))
  const columns = Math.min(maxColumns, itemCount)
  const rows = Math.ceil(itemCount / columns)
  
  const totalGaps = (columns - 1) * gap
  const itemWidth = Math.floor((availableWidth - totalGaps) / columns)
  
  return { columns, rows, itemWidth }
}

export const createResponsiveGrid = (
  items: any[],
  containerWidth: number,
  minItemWidth: number = 200
) => {
  const layout = calculateGridLayout(containerWidth, items.length, minItemWidth)
  
  return {
    ...layout,
    items: items.map((item, index) => ({
      ...item,
      gridColumn: (index % layout.columns) + 1,
      gridRow: Math.floor(index / layout.columns) + 1
    }))
  }
}

export default calculateResponsiveLayout