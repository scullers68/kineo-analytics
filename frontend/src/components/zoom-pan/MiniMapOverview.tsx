/**
 * MiniMapOverview - Small Overview Chart with Brush Selection
 * Shows current zoom window in context of full dataset
 */

import React, { useMemo, useCallback } from 'react'
import { MiniMapOverviewProps } from '../../types/zoom-pan'

export function MiniMapOverview({ 
  data, 
  fullExtent, 
  currentExtent, 
  onRangeSelect,
  onBrushSelection,
  enableBrush = false 
}: MiniMapOverviewProps) {
  const miniMapWidth = 200
  const miniMapHeight = 60

  // Calculate viewport indicator position and size
  const viewportMetrics = useMemo(() => {
    const [fullStart, fullEnd] = fullExtent
    const [currentStart, currentEnd] = currentExtent
    
    const fullDuration = fullEnd.getTime() - fullStart.getTime()
    const currentDuration = currentEnd.getTime() - currentStart.getTime()
    const startOffset = currentStart.getTime() - fullStart.getTime()
    
    const left = (startOffset / fullDuration) * miniMapWidth
    const width = (currentDuration / fullDuration) * miniMapWidth
    
    return {
      left: Math.max(0, Math.min(left, miniMapWidth)),
      width: Math.max(10, Math.min(width, miniMapWidth - left))
    }
  }, [fullExtent, currentExtent, miniMapWidth])

  const handleClick = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / miniMapWidth
    
    const [fullStart, fullEnd] = fullExtent
    const fullDuration = fullEnd.getTime() - fullStart.getTime()
    const currentDuration = currentExtent[1].getTime() - currentExtent[0].getTime()
    
    const newStartTime = fullStart.getTime() + (percentage * fullDuration) - (currentDuration / 2)
    const newStart = new Date(newStartTime)
    const newEnd = new Date(newStartTime + currentDuration)
    
    onRangeSelect?.(newStart, newEnd)
  }, [fullExtent, currentExtent, onRangeSelect, miniMapWidth])

  const handleBrushStart = useCallback((event: React.MouseEvent) => {
    if (!enableBrush) return
    
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const startX = event.clientX - rect.left
    
    let brushSelection: HTMLElement | null = null
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left
      const left = Math.min(startX, currentX)
      const width = Math.abs(currentX - startX)
      
      if (!brushSelection) {
        brushSelection = document.createElement('div')
        brushSelection.setAttribute('data-testid', 'brush-selection')
        brushSelection.style.cssText = `
          position: absolute;
          background: rgba(0, 123, 255, 0.3);
          border: 1px solid #007bff;
          pointer-events: none;
          display: block;
        `
        event.currentTarget.appendChild(brushSelection)
      }
      
      brushSelection.style.left = `${left}px`
      brushSelection.style.width = `${width}px`
      brushSelection.style.top = '0px'
      brushSelection.style.height = `${miniMapHeight}px`
    }
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      if (brushSelection) {
        const left = parseFloat(brushSelection.style.left)
        const width = parseFloat(brushSelection.style.width)
        
        // Convert brush selection to time range
        const [fullStart, fullEnd] = fullExtent
        const fullDuration = fullEnd.getTime() - fullStart.getTime()
        
        const startPercent = left / miniMapWidth
        const endPercent = (left + width) / miniMapWidth
        
        const selectionStart = new Date(fullStart.getTime() + (startPercent * fullDuration))
        const selectionEnd = new Date(fullStart.getTime() + (endPercent * fullDuration))
        
        onBrushSelection?.(selectionStart, selectionEnd)
        
        // Clean up brush selection element
        brushSelection.remove()
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [enableBrush, fullExtent, onBrushSelection, miniMapHeight, miniMapWidth])

  // Simple data visualization for mini-map (simplified line chart)
  const pathData = useMemo(() => {
    if (!data.length) return ''
    
    const [fullStart, fullEnd] = fullExtent
    const fullDuration = fullEnd.getTime() - fullStart.getTime()
    const maxValue = Math.max(...data.map(d => Object.values(d).filter(v => typeof v === 'number')[0] as number || 0))
    
    return data
      .map((d, i) => {
        const x = ((d.date.getTime() - fullStart.getTime()) / fullDuration) * miniMapWidth
        const value = Object.values(d).filter(v => typeof v === 'number')[0] as number || 0
        const y = miniMapHeight - ((value / maxValue) * miniMapHeight)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [data, fullExtent, miniMapWidth, miniMapHeight])

  return (
    <div 
      data-testid="mini-map"
      className="relative bg-gray-50 border border-gray-200 rounded"
      style={{ width: miniMapWidth, height: miniMapHeight }}
      onClick={handleClick}
      onMouseDown={handleBrushStart}
    >
      {/* Data visualization */}
      <svg width={miniMapWidth} height={miniMapHeight} className="absolute inset-0">
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
        />
      </svg>
      
      {/* Viewport indicator */}
      <div
        data-testid="viewport-indicator"
        className="absolute bg-blue-200 border-2 border-blue-500 opacity-70 pointer-events-none"
        style={{
          left: `${viewportMetrics.left}px`,
          width: `${viewportMetrics.width}px`,
          top: 0,
          height: '100%'
        }}
      />
    </div>
  )
}