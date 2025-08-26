import { useState, useCallback, useMemo } from 'react'
import { PieSlice } from '../types/pie-chart'

export interface SliceSelectionConfig {
  multiSelect?: boolean
  maxSelections?: number
  enableToggle?: boolean
  onSelectionChange?: (selectedIndices: number[], selectedSlices: PieSlice[]) => void
  onMaxExceeded?: (maxSelections: number) => void
}

export const useSliceSelection = (
  slices: PieSlice[],
  config: SliceSelectionConfig = {}
) => {
  const {
    multiSelect = false,
    maxSelections,
    enableToggle = true,
    onSelectionChange,
    onMaxExceeded
  } = config

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  // Get selected slices
  const selectedSlices = useMemo(() => {
    return selectedIndices.map(index => slices[index]).filter(Boolean)
  }, [selectedIndices, slices])

  // Check if a slice is selected
  const isSelected = useCallback((sliceIndex: number) => {
    return selectedIndices.includes(sliceIndex)
  }, [selectedIndices])

  // Select a single slice
  const selectSlice = useCallback((sliceIndex: number) => {
    if (sliceIndex < 0 || sliceIndex >= slices.length) return false

    setSelectedIndices(current => {
      let newSelection: number[]

      if (multiSelect) {
        if (current.includes(sliceIndex)) {
          if (enableToggle) {
            // Remove from selection
            newSelection = current.filter(index => index !== sliceIndex)
          } else {
            // Already selected and toggle disabled
            return current
          }
        } else {
          // Check max selections limit
          if (maxSelections && current.length >= maxSelections) {
            onMaxExceeded?.(maxSelections)
            return current
          }
          // Add to selection
          newSelection = [...current, sliceIndex]
        }
      } else {
        // Single select mode
        if (current.includes(sliceIndex)) {
          if (enableToggle) {
            // Deselect
            newSelection = []
          } else {
            // Already selected and toggle disabled
            return current
          }
        } else {
          // Select only this slice
          newSelection = [sliceIndex]
        }
      }

      // Notify of change
      const newSelectedSlices = newSelection.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(newSelection, newSelectedSlices)

      return newSelection
    })

    return true
  }, [slices, multiSelect, maxSelections, enableToggle, onSelectionChange, onMaxExceeded])

  // Select multiple slices
  const selectSlices = useCallback((sliceIndices: number[]) => {
    if (!multiSelect) {
      // In single select mode, select only the first valid index
      const validIndex = sliceIndices.find(index => index >= 0 && index < slices.length)
      if (validIndex !== undefined) {
        return selectSlice(validIndex)
      }
      return false
    }

    // Filter valid indices
    const validIndices = sliceIndices.filter(index => index >= 0 && index < slices.length)
    
    if (validIndices.length === 0) return false

    setSelectedIndices(current => {
      let newSelection = [...current]

      validIndices.forEach(index => {
        if (!newSelection.includes(index)) {
          // Check max selections limit
          if (maxSelections && newSelection.length >= maxSelections) {
            onMaxExceeded?.(maxSelections)
            return
          }
          newSelection.push(index)
        }
      })

      // Notify of change
      const newSelectedSlices = newSelection.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(newSelection, newSelectedSlices)

      return newSelection
    })

    return true
  }, [slices, multiSelect, maxSelections, selectSlice, onSelectionChange, onMaxExceeded])

  // Deselect a slice
  const deselectSlice = useCallback((sliceIndex: number) => {
    setSelectedIndices(current => {
      if (!current.includes(sliceIndex)) return current

      const newSelection = current.filter(index => index !== sliceIndex)
      const newSelectedSlices = newSelection.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(newSelection, newSelectedSlices)

      return newSelection
    })
    return true
  }, [slices, onSelectionChange])

  // Toggle selection of a slice
  const toggleSlice = useCallback((sliceIndex: number) => {
    if (isSelected(sliceIndex)) {
      return deselectSlice(sliceIndex)
    } else {
      return selectSlice(sliceIndex)
    }
  }, [isSelected, deselectSlice, selectSlice])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIndices(current => {
      if (current.length === 0) return current

      onSelectionChange?.([], [])
      return []
    })
  }, [onSelectionChange])

  // Select all slices (only in multi-select mode)
  const selectAll = useCallback(() => {
    if (!multiSelect) return false

    const allIndices = slices.map((_, index) => index)
    
    // Apply max selections limit
    const indicesToSelect = maxSelections ? allIndices.slice(0, maxSelections) : allIndices

    setSelectedIndices(current => {
      if (current.length === indicesToSelect.length && 
          indicesToSelect.every(index => current.includes(index))) {
        return current // No change needed
      }

      const newSelectedSlices = indicesToSelect.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(indicesToSelect, newSelectedSlices)

      return indicesToSelect
    })

    return true
  }, [slices, multiSelect, maxSelections, onSelectionChange])

  // Invert selection (only in multi-select mode)
  const invertSelection = useCallback(() => {
    if (!multiSelect) return false

    setSelectedIndices(current => {
      const allIndices = slices.map((_, index) => index)
      const newSelection = allIndices.filter(index => !current.includes(index))
      
      // Apply max selections limit
      const finalSelection = maxSelections ? newSelection.slice(0, maxSelections) : newSelection
      
      const newSelectedSlices = finalSelection.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(finalSelection, newSelectedSlices)

      return finalSelection
    })

    return true
  }, [slices, multiSelect, maxSelections, onSelectionChange])

  // Update selection when a slice changes
  const updateSliceSelection = useCallback((slice: PieSlice, selected: boolean) => {
    const sliceIndex = slices.findIndex(s => s.index === slice.index)
    if (sliceIndex === -1) return false

    if (selected) {
      return selectSlice(sliceIndex)
    } else {
      return deselectSlice(sliceIndex)
    }
  }, [slices, selectSlice, deselectSlice])

  // Get selection statistics
  const selectionStats = useMemo(() => ({
    selectedCount: selectedIndices.length,
    totalCount: slices.length,
    selectedPercentage: slices.length > 0 ? (selectedIndices.length / slices.length) * 100 : 0,
    hasSelection: selectedIndices.length > 0,
    hasMaxSelection: maxSelections ? selectedIndices.length >= maxSelections : false,
    canSelectMore: maxSelections ? selectedIndices.length < maxSelections : true
  }), [selectedIndices.length, slices.length, maxSelections])

  // Get selected values and their sum
  const selectionValues = useMemo(() => {
    const selectedSliceData = selectedSlices.map(slice => slice.data)
    const totalValue = selectedSliceData.reduce((sum, data) => sum + data.value, 0)
    const averageValue = selectedSliceData.length > 0 ? totalValue / selectedSliceData.length : 0

    return {
      slices: selectedSliceData,
      totalValue,
      averageValue,
      labels: selectedSliceData.map(data => data.label)
    }
  }, [selectedSlices])

  return {
    // State
    selectedIndices,
    selectedSlices,
    selectionStats,
    selectionValues,

    // Actions
    selectSlice,
    selectSlices,
    deselectSlice,
    toggleSlice,
    clearSelection,
    selectAll,
    invertSelection,
    updateSliceSelection,

    // Queries
    isSelected,
    
    // Bulk operations
    getSelectionState: () => ({
      selectedIndices: [...selectedIndices],
      config: { multiSelect, maxSelections, enableToggle }
    }),

    setSelectionState: (indices: number[]) => {
      const validIndices = indices.filter(index => index >= 0 && index < slices.length)
      let finalIndices = validIndices

      if (maxSelections && validIndices.length > maxSelections) {
        finalIndices = validIndices.slice(0, maxSelections)
        onMaxExceeded?.(maxSelections)
      }

      setSelectedIndices(finalIndices)
      const newSelectedSlices = finalIndices.map(index => slices[index]).filter(Boolean)
      onSelectionChange?.(finalIndices, newSelectedSlices)
    }
  }
}

export default useSliceSelection

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useSliceSelection, default: useSliceSelection }
}