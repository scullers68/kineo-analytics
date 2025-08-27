/**
 * Filtering Types
 * 
 * TypeScript interfaces for the filtering system components
 * Defines core filter state management and data structures
 */

// Core filter value types
export type FilterValue = string | number | Date | [number, number] | string[]

// Filter criteria types
export type FilterType = 'date' | 'category' | 'value' | 'range'

// Individual filter criterion
export interface FilterCriteria {
  id: string
  type: FilterType
  label: string
  value: FilterValue
  field: string // The data field this filter applies to
}

// Filter state interface
export interface FilterState {
  dateRange?: { start: Date; end: Date }
  categories?: Record<string, string[]> // field -> selected values
  valueRanges?: Record<string, [number, number]> // field -> [min, max]
  activeFilters: FilterCriteria[]
}

// Filter context interface
export interface FilterContextValue {
  filters: FilterState
  filteredData: any[] | null
  applyFilter: (criteria: FilterCriteria) => void
  removeFilter: (filterId: string) => void
  clearFilters: () => void
  activeFilters: FilterCriteria[]
}

// Filter control props interfaces
export interface FilterControlsProps {
  dateRange: { start: Date; end: Date }
  categories: string[]
  valueRanges: { 
    completion: [number, number]
    hours: [number, number] 
  }
}

export interface FilterBarProps {
  activeFilters: FilterCriteria[]
  onClearFilters: () => void
}

// Learning data structure for filtering
export interface LearningDataItem {
  id: string
  userId: string
  courseId: string
  department: string
  courseType: string
  completedAt: Date
  score: number
  learningHours: number
  status: 'completed' | 'in_progress' | 'not_started'
}

// Chart filter hook return type
export interface UseChartFilterReturn {
  filteredData: LearningDataItem[] | null
  applyFilter: (criteria: FilterCriteria) => void
  removeFilter: (filterId: string) => void
  clearFilters: () => void
  activeFilters: FilterCriteria[]
  isLoading?: boolean
}