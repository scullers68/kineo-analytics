/**
 * Tooltip Types
 * 
 * TypeScript type definitions for the Rich Tooltip system
 * Task: task-0023 - Rich Hover Effects and Contextual Tooltips
 */

import React from 'react'

export type TooltipDataFormat = 'number' | 'percentage' | 'text' | 'date' | 'duration' | 'status'

export interface TooltipDataItem {
  label: string
  value: string
  format: TooltipDataFormat
}

export interface TooltipTrend {
  value: number
  period: string
  direction: 'up' | 'down'
}

export interface TooltipAction {
  label: string
  onClick: () => void
}

export interface TooltipContent {
  title: string
  data: TooltipDataItem[]
  trend?: TooltipTrend
  actions?: TooltipAction[]
}

export interface TooltipPosition {
  x: number
  y: number
}

export type TooltipAnchor = 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface TooltipConfig {
  content: TooltipContent
  position: TooltipPosition
  anchor?: TooltipAnchor
}

export interface UseTooltipOptions {
  onShow?: () => void
  onHide?: () => void
}

export interface UseTooltipReturn {
  showTooltip: (config: TooltipConfig) => void
  hideTooltip: () => void
  tooltip: React.ReactNode
  isVisible: boolean
}

export interface RichTooltipProps {
  isVisible: boolean
  content: TooltipContent
  position: TooltipPosition
  anchor?: TooltipAnchor
}

export interface TooltipContextValue {
  showTooltip: (config: TooltipConfig) => void
  hideTooltip: () => void
  currentTooltip: TooltipConfig | null
  isVisible: boolean
}