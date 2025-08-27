/**
 * ZoomControls - UI Controls for Preset Zoom Levels
 * Provides buttons for common time ranges and zoom operations
 */

import React from 'react'
import { ZoomPanState } from '../../types/zoom-pan'

export interface ZoomControlsProps {
  onPresetZoom: (period: string) => void
  onReset?: () => void
  currentZoomLevel: ZoomPanState['zoomLevel']
}

export function ZoomControls({ onPresetZoom, onReset, currentZoomLevel }: ZoomControlsProps) {
  const presetButtons = [
    { period: '1W', label: '1 Week', zoomLevel: 'week' },
    { period: '1M', label: '1 Month', zoomLevel: 'month' },
    { period: '3M', label: '3 Months', zoomLevel: 'quarter' },
    { period: '1Y', label: '1 Year', zoomLevel: 'year' }
  ]

  return (
    <div className="zoom-controls flex gap-2 p-2">
      {presetButtons.map(({ period, label, zoomLevel }) => (
        <button
          key={period}
          onClick={() => onPresetZoom(period)}
          className={`
            px-3 py-1 text-sm border rounded transition-colors
            ${currentZoomLevel === zoomLevel 
              ? 'bg-blue-500 text-white border-blue-500 active selected zoom-active' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
          `}
          aria-label={`Zoom to ${label}`}
        >
          {period}
        </button>
      ))}
      
      {onReset && (
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-gray-500 text-white border border-gray-500 rounded hover:bg-gray-600 transition-colors ml-2"
          aria-label="Reset zoom to show all data"
        >
          Reset
        </button>
      )}
    </div>
  )
}