/**
 * Filter Controls Component
 * 
 * Reusable filter control library for date, category, and range filters
 * Integrates with the filtering system to provide interactive controls
 */

import React, { useCallback } from 'react'
import { FilterControlsProps, FilterCriteria } from '../../types/filtering'
import { useChartFilter } from '../../hooks/useChartFilter'

export const FilterControls: React.FC<FilterControlsProps> = ({
  dateRange,
  categories,
  valueRanges
}) => {
  const { applyFilter } = useChartFilter()

  // Handle date range changes
  const handleDateChange = useCallback((field: 'start' | 'end', value: string) => {
    const date = new Date(value)
    
    // Create or update date range filter
    const criteria: FilterCriteria = {
      id: 'daterange',
      type: 'date',
      label: 'Date Range',
      value: field === 'start' 
        ? { start: date, end: dateRange.end }
        : { start: dateRange.start, end: date },
      field: 'completedAt'
    }
    
    applyFilter(criteria)
  }, [applyFilter, dateRange])

  // Handle category filter changes
  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    // Generate unique ID for this category filter
    const filterId = `${category.toLowerCase()}`
    
    const criteria: FilterCriteria = {
      id: filterId,
      type: 'category',
      label: category,
      value: category,
      field: 'department' // Assuming department field for now
    }
    
    if (checked) {
      applyFilter(criteria)
    }
  }, [applyFilter])

  // Handle value range changes
  const handleRangeChange = useCallback((field: 'completion' | 'hours', value: string) => {
    const numValue = parseInt(value, 10)
    const [currentMin, currentMax] = valueRanges[field]
    
    const criteria: FilterCriteria = {
      id: `${field}-range`,
      type: 'range',
      label: field === 'completion' ? 'Completion Rate' : 'Learning Hours',
      value: field === 'completion' 
        ? [numValue, currentMax] as [number, number]
        : [0, numValue] as [number, number],
      field: field === 'completion' ? 'score' : 'learningHours'
    }
    
    applyFilter(criteria)
  }, [applyFilter, valueRanges])

  return (
    <div className="filter-controls-container">
      {/* Date Range Filter */}
      <div className="filter-group">
        <fieldset>
          <legend aria-label="Date Range" className="filter-label">Date Range</legend>
          <div className="date-inputs">
            <input
              type="date"
              aria-label="Start Date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="date-input"
            />
            <input
              type="date"
              aria-label="End Date"  
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="date-input"
            />
          </div>
        </fieldset>
      </div>

      {/* Category Filters */}
      <div className="filter-group">
        <span className="filter-label">Department</span>
        <div className="category-filters">
          {categories.map(category => (
            <label key={category} className="category-filter">
              <input
                type="checkbox"
                aria-label={category}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
                className="category-checkbox"
              />
              <span className="category-label">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Completion Rate Range Filter */}
      <div className="filter-group">
        <label htmlFor="completion-range" className="filter-label">
          Completion Rate
        </label>
        <input
          type="range"
          id="completion-range"
          min={valueRanges.completion[0]}
          max={valueRanges.completion[1]}
          onChange={(e) => handleRangeChange('completion', e.target.value)}
          className="range-slider"
        />
      </div>

      {/* Learning Hours Range Filter */}  
      <div className="filter-group">
        <label htmlFor="hours-range" className="filter-label">
          Learning Hours
        </label>
        <input
          type="range"
          id="hours-range"
          aria-label="Learning Hours"
          min={valueRanges.hours[0]}
          max={valueRanges.hours[1]}
          onChange={(e) => handleRangeChange('hours', e.target.value)}
          className="range-slider"
        />
      </div>
    </div>
  )
}

export default FilterControls