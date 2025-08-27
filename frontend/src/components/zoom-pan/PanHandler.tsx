/**
 * PanHandler - Touch and Mouse Gesture Handler for Smooth Panning
 * Handles drag operations with 60fps performance optimization
 */

import React, { useCallback, useRef } from 'react'
import { PanHandlerProps } from '../../types/zoom-pan'

export function PanHandler({ children, onPan, targetFPS = 60 }: PanHandlerProps) {
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const frameId = useRef<number>()
  
  const targetFrameTime = 1000 / targetFPS // 16.67ms for 60fps

  const handlePanUpdate = useCallback((deltaX: number) => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current)
    }
    
    const startTime = performance.now()
    
    frameId.current = requestAnimationFrame(() => {
      onPan(deltaX)
      
      // Performance tracking for test validation
      const frameTime = performance.now() - startTime
      if (frameTime > targetFrameTime) {
        console.warn(`Frame time exceeded target: ${frameTime}ms > ${targetFrameTime}ms`)
      }
    })
  }, [onPan, targetFrameTime])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    isDragging.current = true
    lastX.current = event.clientX
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return
      
      const deltaX = moveEvent.clientX - lastX.current
      lastX.current = moveEvent.clientX
      
      handlePanUpdate(deltaX)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handlePanUpdate])

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      event.preventDefault()
      const touch = event.touches[0]
      lastX.current = touch.clientX
    }
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      event.preventDefault()
      const touch = event.touches[0]
      const deltaX = touch.clientX - lastX.current
      lastX.current = touch.clientX
      
      handlePanUpdate(deltaX)
    }
  }, [handlePanUpdate])

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ 
        cursor: isDragging.current ? 'grabbing' : 'grab',
        touchAction: 'pan-x'
      }}
    >
      {children}
    </div>
  )
}