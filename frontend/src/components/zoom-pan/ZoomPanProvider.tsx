/**
 * ZoomPanProvider - React Context for Zoom/Pan State Management
 * Provides centralized zoom and pan state across chart components
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { ZoomPanState, ZoomControls } from '../../types/zoom-pan'
import { useZoomPan } from '../../hooks/useZoomPan'

interface ZoomPanContextValue extends ZoomControls {
  zoomState: ZoomPanState
}

const ZoomPanContext = createContext<ZoomPanContextValue | null>(null)

export interface ZoomPanProviderProps {
  children: ReactNode
  initialTimeExtent?: [Date, Date]
  minScale?: number
  maxScale?: number
  enforceBoundaries?: boolean
  onZoomChange?: (state: ZoomPanState) => void
  onPanChange?: (state: ZoomPanState) => void
}

export function ZoomPanProvider({ 
  children,
  initialTimeExtent,
  minScale,
  maxScale,
  enforceBoundaries,
  onZoomChange,
  onPanChange
}: ZoomPanProviderProps) {
  const zoomPanControls = useZoomPan({
    initialTimeExtent,
    minScale,
    maxScale,
    enforceBoundaries,
    onZoomChange,
    onPanChange
  })

  return (
    <ZoomPanContext.Provider value={zoomPanControls}>
      {children}
    </ZoomPanContext.Provider>
  )
}

export function useZoomPanContext(): ZoomPanContextValue {
  const context = useContext(ZoomPanContext)
  if (!context) {
    throw new Error('useZoomPanContext must be used within a ZoomPanProvider')
  }
  return context
}