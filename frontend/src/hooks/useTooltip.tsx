/**
 * useTooltip Hook
 * 
 * Custom hook for tooltip positioning logic and lifecycle management
 * Task: task-0023 - Rich Hover Effects and Contextual Tooltips
 */

import React, { useState, useCallback, useMemo } from 'react'
import { UseTooltipOptions, UseTooltipReturn, TooltipConfig } from '../types/tooltips'
import { RichTooltip } from '../components/tooltips/RichTooltip'

export const useTooltip = (options?: UseTooltipOptions): UseTooltipReturn => {
  const [currentTooltip, setCurrentTooltip] = useState<TooltipConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showTooltip = useCallback((config: TooltipConfig) => {
    setCurrentTooltip(config)
    setIsVisible(true)
    options?.onShow?.()
  }, [options])

  const hideTooltip = useCallback(() => {
    setIsVisible(false)
    setCurrentTooltip(null)
    options?.onHide?.()
  }, [options])

  const tooltip = useMemo(() => {
    if (!isVisible || !currentTooltip) return null

    return (
      <RichTooltip
        isVisible={isVisible}
        content={currentTooltip.content}
        position={currentTooltip.position}
        anchor={currentTooltip.anchor}
      />
    )
  }, [isVisible, currentTooltip])

  return {
    showTooltip,
    hideTooltip,
    tooltip,
    isVisible
  }
}