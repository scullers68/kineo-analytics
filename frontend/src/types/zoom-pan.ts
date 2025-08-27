/**
 * Zoom and Pan Types for Time-Series Exploration
 * Supporting interactive temporal data analysis with performance optimization
 */

import React from 'react'

export interface ZoomPanState {
  scale: number
  translateX: number
  translateY: number
  timeExtent: [Date, Date]
  zoomLevel: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  atBoundary?: boolean
}

export interface ZoomControls {
  zoomIn: (x?: number, y?: number) => void
  zoomOut: (x?: number, y?: number) => void
  resetZoom: () => void
  setPresetZoom: (period: string) => void
  zoomToScale: (scale: number) => void
  zoomToTimeRange: (start: Date, end: Date) => void
  panBy: (deltaX: number, deltaY: number) => void
  panTo: (date: Date) => void
}

export interface ZoomPanOptions {
  initialTimeExtent?: [Date, Date]
  minScale?: number
  maxScale?: number
  enforceBoundaries?: boolean
  onZoomChange?: (state: ZoomPanState) => void
  onPanChange?: (state: ZoomPanState) => void
}

export interface MiniMapOverviewProps {
  data: Array<{ date: Date; [key: string]: any }>
  fullExtent: [Date, Date]
  currentExtent: [Date, Date]
  onRangeSelect?: (start: Date, end: Date) => void
  onBrushSelection?: (start: Date, end: Date) => void
  enableBrush?: boolean
}

export interface PanHandlerProps {
  children: React.ReactNode
  onPan: (deltaX: number) => void
  targetFPS?: number
}

export interface TimeSeriesChartProps {
  data: Array<{ date: Date; [key: string]: any }>
  zoomState: ZoomPanState
  onWheel?: (event: React.WheelEvent) => void
  enableDataOptimization?: boolean
  visibleDataThreshold?: number
}