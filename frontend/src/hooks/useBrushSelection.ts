import { useState, useCallback, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { brushX } from '../utils/d3-imports'

export interface BrushSelectionOptions {
  width: number
  height: number
  margins: { top: number; right: number; bottom: number; left: number }
  onBrushStart?: (selection: [number, number] | null) => void
  onBrush?: (selection: [number, number] | null) => void
  onBrushEnd?: (selection: [number, number] | null) => void
  brushHeight?: number
  enabled?: boolean
}

export interface BrushSelectionState {
  selection: [number, number] | null
  isDragging: boolean
  brushElement: d3.Selection<SVGGElement, unknown, null, undefined> | null
}

export const useBrushSelection = ({
  width,
  height,
  margins,
  onBrushStart,
  onBrush,
  onBrushEnd,
  brushHeight = 40,
  enabled = true
}: BrushSelectionOptions) => {
  const brushRef = useRef<SVGGElement>(null)
  const [state, setState] = useState<BrushSelectionState>({
    selection: null,
    isDragging: false,
    brushElement: null
  })

  const chartWidth = width - margins.left - margins.right
  const chartHeight = height - margins.top - margins.bottom

  // Create brush behavior
  const createBrush = useCallback(() => {
    if (!enabled || !brushRef.current) return null

    const brush = d3.brushX()
      .extent([[0, 0], [chartWidth, brushHeight]])
      .on('start', function(event) {
        setState(prev => ({ ...prev, isDragging: true }))
        if (onBrushStart) {
          onBrushStart(event.selection)
        }
      })
      .on('brush', function(event) {
        const selection = event.selection as [number, number] | null
        setState(prev => ({ ...prev, selection }))
        if (onBrush) {
          onBrush(selection)
        }
      })
      .on('end', function(event) {
        const selection = event.selection as [number, number] | null
        setState(prev => ({ 
          ...prev, 
          selection, 
          isDragging: false 
        }))
        if (onBrushEnd) {
          onBrushEnd(selection)
        }
      })

    return brush
  }, [enabled, chartWidth, brushHeight, onBrushStart, onBrush, onBrushEnd])

  // Initialize brush
  useEffect(() => {
    if (!brushRef.current || !enabled) return

    const brushElement = d3.select(brushRef.current)
    const brush = createBrush()

    if (brush) {
      brushElement.call(brush)
      setState(prev => ({ ...prev, brushElement }))
    }

    return () => {
      if (brushElement) {
        brushElement.selectAll('*').remove()
      }
    }
  }, [createBrush, enabled])

  // Clear selection
  const clearSelection = useCallback(() => {
    if (state.brushElement) {
      state.brushElement.call(d3.brushX().clear)
      setState(prev => ({ ...prev, selection: null }))
    }
  }, [state.brushElement])

  // Set selection programmatically
  const setSelection = useCallback((selection: [number, number] | null) => {
    if (state.brushElement) {
      if (selection) {
        state.brushElement.call(d3.brushX().move, selection)
      } else {
        state.brushElement.call(d3.brushX().clear)
      }
      setState(prev => ({ ...prev, selection }))
    }
  }, [state.brushElement])

  // Get selection in domain units (requires scale)
  const getSelectionDomain = useCallback((
    scale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>
  ): [any, any] | null => {
    if (!state.selection) return null
    return [scale.invert(state.selection[0]), scale.invert(state.selection[1])]
  }, [state.selection])

  return {
    brushRef,
    state,
    clearSelection,
    setSelection,
    getSelectionDomain,
    chartWidth,
    brushHeight
  }
}

export default useBrushSelection

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useBrushSelection, default: useBrushSelection }
}