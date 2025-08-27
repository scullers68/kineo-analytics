/**
 * Chart Filter Hook
 * 
 * Custom hook for connecting charts to the filtering system
 * Provides filtered data and filter management functions to components
 */

import { useFilterContext } from '../contexts/FilterContext'
import { UseChartFilterReturn } from '../types/filtering'

/**
 * Hook to connect chart components to the filtering system
 * 
 * @returns Object containing filtered data and filter management functions
 */
export const useChartFilter = (): UseChartFilterReturn => {
  const {
    filteredData,
    applyFilter,
    removeFilter,
    clearFilters,
    activeFilters
  } = useFilterContext()

  return {
    filteredData,
    applyFilter,
    removeFilter,
    clearFilters,
    activeFilters,
    isLoading: false // Could be extended for async filtering
  }
}