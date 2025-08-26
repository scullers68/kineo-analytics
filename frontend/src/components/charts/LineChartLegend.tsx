import React, { useState } from 'react'
import { TimeSeriesData } from '../../types/time-series'

export interface LineChartLegendProps {
  series: TimeSeriesData[]
  position?: 'top' | 'bottom' | 'left' | 'right'
  orientation?: 'horizontal' | 'vertical'
  interactive?: boolean
  showSwatches?: boolean
  showCounts?: boolean
  onSeriesToggle?: (seriesId: string, visible: boolean) => void
  onSeriesHighlight?: (seriesId: string | null) => void
  className?: string
}

export interface LegendItem {
  id: string
  label: string
  color: string
  visible: boolean
  count?: number
}

export const LineChartLegend: React.FC<LineChartLegendProps> = ({
  series,
  position = 'right',
  orientation = position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical',
  interactive = true,
  showSwatches = true,
  showCounts = false,
  onSeriesToggle,
  onSeriesHighlight,
  className = ''
}) => {
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(series.map(s => s.id))
  )

  const handleToggle = (seriesId: string) => {
    if (!interactive) return

    const newVisible = new Set(visibleSeries)
    const isVisible = !visibleSeries.has(seriesId)
    
    if (isVisible) {
      newVisible.add(seriesId)
    } else {
      newVisible.delete(seriesId)
    }
    
    setVisibleSeries(newVisible)
    onSeriesToggle?.(seriesId, isVisible)
  }

  const handleMouseEnter = (seriesId: string) => {
    if (!interactive) return
    onSeriesHighlight?.(seriesId)
  }

  const handleMouseLeave = () => {
    if (!interactive) return
    onSeriesHighlight?.(null)
  }

  const legendItems = createLegendItems(series, showCounts)

  const containerClasses = [
    'line-chart-legend',
    `legend-${position}`,
    `legend-${orientation}`,
    interactive ? 'interactive' : 'static',
    className
  ].filter(Boolean).join(' ')

  const itemsClasses = [
    'legend-items',
    orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'
  ].join(' ')

  return (
    <div className={containerClasses} role="group" aria-label="Chart legend">
      <div className={itemsClasses}>
        {legendItems.map(item => {
          const isVisible = visibleSeries.has(item.id)
          
          return (
            <div
              key={item.id}
              className={`
                legend-item flex items-center gap-2 
                ${interactive ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''} 
                ${!isVisible ? 'opacity-50' : ''}
              `}
              onClick={() => handleToggle(item.id)}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToggle(item.id)
                }
              }}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'button' : 'listitem'}
              aria-label={`${item.label} series, ${isVisible ? 'visible' : 'hidden'}`}
              aria-pressed={interactive ? isVisible : undefined}
            >
              {showSwatches && (
                <div
                  className="legend-swatch w-3 h-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
              )}
              
              <span className="legend-label text-sm font-medium">
                {item.label}
              </span>
              
              {showCounts && item.count !== undefined && (
                <span className="legend-count text-xs text-gray-500">
                  ({item.count})
                </span>
              )}
              
              {interactive && !isVisible && (
                <span className="text-xs text-gray-400 ml-auto">hidden</span>
              )}
            </div>
          )
        })}
      </div>
      
      {interactive && series.length > 1 && (
        <div className="legend-controls mt-3 pt-2 border-t border-gray-200">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                const allVisible = new Set(series.map(s => s.id))
                setVisibleSeries(allVisible)
                series.forEach(s => onSeriesToggle?.(s.id, true))
              }}
              className="text-blue-600 hover:text-blue-800 underline"
              disabled={visibleSeries.size === series.length}
            >
              Show All
            </button>
            
            <span className="text-gray-400">|</span>
            
            <button
              type="button"
              onClick={() => {
                setVisibleSeries(new Set())
                series.forEach(s => onSeriesToggle?.(s.id, false))
              }}
              className="text-blue-600 hover:text-blue-800 underline"
              disabled={visibleSeries.size === 0}
            >
              Hide All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Create legend items from series data
export const createLegendItems = (
  series: TimeSeriesData[],
  includeCounts: boolean = false
): LegendItem[] => {
  return series.map((s, i) => ({
    id: s.id,
    label: s.label,
    color: s.color || `hsl(${(i * 137.5) % 360}, 65%, 55%)`,
    visible: true,
    count: includeCounts ? s.points.length : undefined
  }))
}

// Handle legend interaction events
export const handleLegendInteraction = (
  action: 'toggle' | 'highlight' | 'unhighlight',
  seriesId: string,
  currentState: { visible: string[]; highlighted: string | null }
) => {
  switch (action) {
    case 'toggle':
      return {
        ...currentState,
        visible: currentState.visible.includes(seriesId)
          ? currentState.visible.filter(id => id !== seriesId)
          : [...currentState.visible, seriesId]
      }
    
    case 'highlight':
      return {
        ...currentState,
        highlighted: seriesId
      }
    
    case 'unhighlight':
      return {
        ...currentState,
        highlighted: null
      }
    
    default:
      return currentState
  }
}

export default LineChartLegend

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LineChartLegend,
    createLegendItems,
    handleLegendInteraction,
    default: LineChartLegend
  }
}