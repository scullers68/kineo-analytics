/**
 * Filter Bar Component
 * 
 * Visual display of active filters with indicators and removal controls
 * Shows current applied filters and provides clear/reset functionality
 */

import React from 'react'
import { FilterBarProps } from '../../types/filtering'
import { useChartFilter } from '../../hooks/useChartFilter'

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onClearFilters
}) => {
  const { removeFilter } = useChartFilter()
  return (
    <div className="filter-bar">
      {/* Active Filters Container */}
      <div data-testid="active-filters" className="active-filters-container">
        {activeFilters.map(filter => (
          <div
            key={filter.id}
            data-testid={
              filter.type === 'category' && filter.field === 'department' 
                ? 'active-filter-department' 
                : filter.id === 'daterange'
                  ? 'active-filter-daterange'
                  : filter.id === 'completion-range'
                    ? 'active-filter-completion'
                    : `active-filter-${filter.type}`
            }
            className="active-filter-tag"
          >
            <span className="filter-label">{filter.label}</span>
            <button
              data-testid={`remove-${filter.id}-filter`}
              onClick={() => removeFilter(filter.id)}
              className="remove-filter-button"
              aria-label={`Remove ${filter.label} filter`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Clear All Filters Button */}
      {activeFilters.length > 0 && (
        <button
          data-testid="clear-all-filters"
          onClick={onClearFilters}
          className="clear-all-filters-button"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
}

export default FilterBar