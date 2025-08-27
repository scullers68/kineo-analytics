/**
 * Filter Context Provider
 * 
 * Centralized filter state management using React Context
 * Provides filtering functionality to all chart components
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FilterState, FilterContextValue, FilterCriteria, LearningDataItem } from '../types/filtering'

// Create the filter context
const FilterContext = createContext<FilterContextValue | undefined>(undefined)

// Provider props
interface FilterProviderProps {
  children: ReactNode
  initialData?: LearningDataItem[]
}

// Filter Provider component
export const FilterProvider: React.FC<FilterProviderProps> = ({ 
  children, 
  initialData = [] 
}) => {
  // Initialize filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    categories: {},
    valueRanges: {},
    activeFilters: []
  })

  const [sourceData] = useState<LearningDataItem[]>(initialData)

  // Apply a new filter
  const applyFilter = useCallback((criteria: FilterCriteria) => {
    setFilters(prev => {
      // For category filters, accumulate values instead of replacing
      if (criteria.type === 'category') {
        const existingCategories = prev.categories?.[criteria.field] || []
        const newValue = criteria.value as string
        
        // Check if this value is already selected
        const isAlreadySelected = existingCategories.includes(newValue)
        
        if (isAlreadySelected) {
          // Remove from selection
          const updatedCategories = existingCategories.filter(v => v !== newValue)
          const updatedActiveFilters = prev.activeFilters.filter(f => 
            !(f.field === criteria.field && f.type === 'category' && f.value === newValue)
          )
          
          return {
            ...prev,
            categories: {
              ...prev.categories,
              [criteria.field]: updatedCategories
            },
            activeFilters: updatedActiveFilters
          }
        } else {
          // Add to selection
          const updatedActiveFilters = [...prev.activeFilters, criteria]
          
          return {
            ...prev,
            categories: {
              ...prev.categories,
              [criteria.field]: [...existingCategories, newValue]
            },
            activeFilters: updatedActiveFilters
          }
        }
      }
      
      // For non-category filters, replace existing filter for the same field and type
      const existingFilterIndex = prev.activeFilters.findIndex(
        f => f.field === criteria.field && f.type === criteria.type
      )

      let updatedActiveFilters = [...prev.activeFilters]
      
      if (existingFilterIndex >= 0) {
        // Replace existing filter
        updatedActiveFilters[existingFilterIndex] = criteria
      } else {
        // Add new filter
        updatedActiveFilters.push(criteria)
      }

      // Update specific filter type state
      const updatedFilters = { ...prev, activeFilters: updatedActiveFilters }

      if (criteria.type === 'date') {
        updatedFilters.dateRange = criteria.value as { start: Date; end: Date }
      } else if (criteria.type === 'value' || criteria.type === 'range') {
        updatedFilters.valueRanges = {
          ...prev.valueRanges,
          [criteria.field]: criteria.value as [number, number]
        }
      }

      return updatedFilters
    })
  }, [])

  // Remove a specific filter
  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => {
      const filterToRemove = prev.activeFilters.find(f => f.id === filterId)
      if (!filterToRemove) return prev

      const updatedActiveFilters = prev.activeFilters.filter(f => f.id !== filterId)
      const updatedFilters = { ...prev, activeFilters: updatedActiveFilters }

      // Clean up specific filter type state
      if (filterToRemove.type === 'date') {
        updatedFilters.dateRange = undefined
      } else if (filterToRemove.type === 'category') {
        const { [filterToRemove.field]: removed, ...remainingCategories } = prev.categories || {}
        updatedFilters.categories = remainingCategories
      } else if (filterToRemove.type === 'value' || filterToRemove.type === 'range') {
        const { [filterToRemove.field]: removed, ...remainingRanges } = prev.valueRanges || {}
        updatedFilters.valueRanges = remainingRanges
      }

      return updatedFilters
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: undefined,
      categories: {},
      valueRanges: {},
      activeFilters: []
    })
  }, [])

  // Helper function to safely get field value from item
  const getFieldValue = (item: LearningDataItem, field: string): any => {
    // Validate input to prevent XSS and ensure type safety
    if (!field || typeof field !== 'string') {
      return undefined
    }
    
    // Sanitize field name (allow only alphanumeric and underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
      console.warn(`Invalid field name: ${field}`);
      return undefined
    }

    switch (field) {
      case 'id':
        return item.id
      case 'userId':
        return item.userId
      case 'courseId':
        return item.courseId
      case 'department':
        return item.department
      case 'courseType':
        return item.courseType
      case 'completedAt':
        return item.completedAt
      case 'score':
        return item.score
      case 'learningHours':
        return item.learningHours
      case 'status':
        return item.status
      default:
        console.warn(`Unknown field: ${field}`);
        return undefined
    }
  }

  // Apply filters to source data
  const filteredData = React.useMemo<LearningDataItem[]>(() => {
    if (filters.activeFilters.length === 0) {
      return sourceData
    }

    return sourceData.filter(item => {
      // Apply date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.completedAt)
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false
        }
      }

      // Apply category filters
      for (const [field, selectedValues] of Object.entries(filters.categories || {})) {
        if (selectedValues.length > 0) {
          const itemValue = getFieldValue(item, field)
          if (!selectedValues.includes(itemValue)) {
            return false
          }
        }
      }

      // Apply value range filters
      for (const [field, range] of Object.entries(filters.valueRanges || {})) {
        if (Array.isArray(range)) {
          const [min, max] = range
          const itemValue = getFieldValue(item, field)
          if (typeof itemValue === 'number' && (itemValue < min || itemValue > max)) {
            return false
          }
        }
      }

      return true
    })
  }, [sourceData, filters])

  const contextValue: FilterContextValue = {
    filters,
    filteredData,
    applyFilter,
    removeFilter,
    clearFilters,
    activeFilters: filters.activeFilters
  }

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  )
}

// Hook to use filter context
export const useFilterContext = () => {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider')
  }
  return context
}

export default FilterProvider