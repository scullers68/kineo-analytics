/**
 * useZoomPan Hook - Time-Series Zoom and Pan Functionality
 * Integrates D3.js zoom behavior with React state management
 */

import { useState, useCallback, useMemo } from 'react'
import { ZoomPanState, ZoomControls, ZoomPanOptions } from '../types/zoom-pan'

export function useZoomPan(options: ZoomPanOptions = {}): {
  zoomState: ZoomPanState
} & ZoomControls {
  const {
    initialTimeExtent = [new Date('2024-01-01'), new Date('2024-12-31')],
    minScale = 0.1,
    maxScale = 10.0,
    enforceBoundaries = true,
    onZoomChange,
    onPanChange
  } = options

  const [zoomState, setZoomState] = useState<ZoomPanState>({
    scale: 1.0,
    translateX: 0,
    translateY: 0,
    timeExtent: initialTimeExtent,
    zoomLevel: 'custom',
    atBoundary: false
  })

  const constrainScale = useCallback((scale: number): number => {
    return Math.max(minScale, Math.min(maxScale, scale))
  }, [minScale, maxScale])

  const constrainTimeExtent = useCallback((start: Date, end: Date): [Date, Date] => {
    if (!enforceBoundaries) return [start, end]
    
    const [dataStart, dataEnd] = initialTimeExtent
    const constrainedStart = start < dataStart ? dataStart : start
    const constrainedEnd = end > dataEnd ? dataEnd : end
    
    return [constrainedStart, constrainedEnd]
  }, [enforceBoundaries, initialTimeExtent])

  const updateZoomState = useCallback((updates: Partial<ZoomPanState>) => {
    setZoomState(prevState => {
      const newState = { ...prevState, ...updates }
      
      // Constrain scale
      if (updates.scale !== undefined) {
        newState.scale = constrainScale(updates.scale)
      }
      
      // Constrain time extent
      if (updates.timeExtent) {
        newState.timeExtent = constrainTimeExtent(updates.timeExtent[0], updates.timeExtent[1])
        
        // Check if at boundary
        const [dataStart, dataEnd] = initialTimeExtent
        newState.atBoundary = newState.timeExtent[0].getTime() === dataStart.getTime() ||
                             newState.timeExtent[1].getTime() === dataEnd.getTime()
      }
      
      // Trigger callbacks with performance tracking for tests
      if (onZoomChange && (updates.scale !== undefined || updates.timeExtent)) {
        // Synchronous callback for performance testing
        onZoomChange(newState)
      }
      if (onPanChange && (updates.translateX !== undefined || updates.translateY !== undefined)) {
        // Synchronous callback for performance testing
        onPanChange(newState)
      }
      
      return newState
    })
  }, [constrainScale, constrainTimeExtent, onZoomChange, onPanChange, initialTimeExtent])

  const zoomIn = useCallback((x = 400, y = 200) => {
    const newScale = constrainScale(zoomState.scale * 1.5)
    updateZoomState({ scale: newScale })
  }, [zoomState.scale, constrainScale, updateZoomState])

  const zoomOut = useCallback((x = 400, y = 200) => {
    const newScale = constrainScale(zoomState.scale / 1.5)
    updateZoomState({ scale: newScale })
  }, [zoomState.scale, constrainScale, updateZoomState])

  const zoomToScale = useCallback((scale: number) => {
    const constrainedScale = constrainScale(scale)
    updateZoomState({ scale: constrainedScale })
  }, [constrainScale, updateZoomState])

  const resetZoom = useCallback(() => {
    updateZoomState({
      scale: 1.0,
      translateX: 0,
      translateY: 0,
      timeExtent: initialTimeExtent,
      zoomLevel: 'custom',
      atBoundary: false
    })
  }, [initialTimeExtent, updateZoomState])

  const setPresetZoom = useCallback((period: string) => {
    const now = new Date()
    let start: Date, end: Date, zoomLevel: ZoomPanState['zoomLevel']

    switch (period.toLowerCase()) {
      case '1w':
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = new Date(now)
        zoomLevel = 'week'
        break
      case '1m':
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        end = new Date(now)
        zoomLevel = 'month'
        break
      case '3m':
      case 'quarter':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        end = new Date(now)
        zoomLevel = 'quarter'
        break
      case '1y':
      case 'year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        end = new Date(now)
        zoomLevel = 'year'
        break
      default:
        start = initialTimeExtent[0]
        end = initialTimeExtent[1]
        zoomLevel = 'custom'
    }

    updateZoomState({
      timeExtent: constrainTimeExtent(start, end),
      zoomLevel,
      scale: 1.0
    })
  }, [initialTimeExtent, constrainTimeExtent, updateZoomState])

  const zoomToTimeRange = useCallback((start: Date, end: Date) => {
    const constrainedExtent = constrainTimeExtent(start, end)
    updateZoomState({
      timeExtent: constrainedExtent,
      zoomLevel: 'custom'
    })
  }, [constrainTimeExtent, updateZoomState])

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    const newTranslateX = zoomState.translateX + deltaX
    const newTranslateY = zoomState.translateY + deltaY
    
    // Convert translate to time delta for time extent updates
    const currentDuration = zoomState.timeExtent[1].getTime() - zoomState.timeExtent[0].getTime()
    const timeDelta = (deltaX / 800) * currentDuration // Assume 800px chart width
    
    const newStart = new Date(zoomState.timeExtent[0].getTime() - timeDelta)
    const newEnd = new Date(zoomState.timeExtent[1].getTime() - timeDelta)
    
    updateZoomState({
      translateX: newTranslateX,
      translateY: newTranslateY,
      timeExtent: constrainTimeExtent(newStart, newEnd)
    })
  }, [zoomState, constrainTimeExtent, updateZoomState])

  const panTo = useCallback((date: Date) => {
    const currentDuration = zoomState.timeExtent[1].getTime() - zoomState.timeExtent[0].getTime()
    const newStart = new Date(date.getTime() - currentDuration / 2)
    const newEnd = new Date(date.getTime() + currentDuration / 2)
    
    updateZoomState({
      timeExtent: constrainTimeExtent(newStart, newEnd)
    })
  }, [zoomState.timeExtent, constrainTimeExtent, updateZoomState])

  return useMemo(() => ({
    zoomState,
    zoomIn,
    zoomOut,
    zoomToScale,
    resetZoom,
    setPresetZoom,
    zoomToTimeRange,
    panBy,
    panTo
  }), [zoomState, zoomIn, zoomOut, zoomToScale, resetZoom, setPresetZoom, zoomToTimeRange, panBy, panTo])
}