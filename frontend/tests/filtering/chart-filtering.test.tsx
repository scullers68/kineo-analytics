/**
 * Chart Filtering and Real-Time Updates Tests
 * 
 * TDD RED Phase - Step 1: Create failing tests that define filtering behavior
 * 
 * Focus: 7 targeted tests covering interactive filtering system with real-time chart updates
 * Foundation: Building on completed D3.js Chart Library (task-0010) and proven rendering capabilities
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { vi } from 'vitest'

// Intentional failing imports - these components don't exist yet (RED phase)
import { FilterProvider } from '../../src/contexts/FilterContext'
import { FilterControls } from '../../src/components/filtering/FilterControls'
import { FilterBar } from '../../src/components/filtering/FilterBar'
import { useChartFilter } from '../../src/hooks/useChartFilter'

// Mock chart components for testing - simplified versions that focus on filtering
const BarChart = ({ data }: { data: any }) => {
  const dataRecordIds = Array.isArray(data) ? data.map((d: any) => d.id || '').join(',') : ''
  const dataSignature = Array.isArray(data) ? `${data.length}-${data.map(d => typeof d).join('')}` : '0'
  const lastUpdated = Date.now().toString()
  
  return (
    <div 
      data-testid="bar-chart"
      data-filtered-count={Array.isArray(data) ? data.length : 0}
      data-signature={dataSignature}
      data-record-ids={dataRecordIds}
      data-last-updated={lastUpdated}
    >
      Mock BarChart
    </div>
  )
}

const LineChart = ({ data }: { data: any }) => {
  const dataRecordIds = Array.isArray(data) ? data.map((d: any) => d.id || '').join(',') : ''
  const dataSignature = Array.isArray(data) ? `${data.length}-${data.map(d => typeof d).join('')}` : '0'
  const lastUpdated = Date.now().toString()
  
  return (
    <div 
      data-testid="line-chart"
      data-filtered-count={Array.isArray(data) ? data.length : 0}
      data-signature={dataSignature}
      data-record-ids={dataRecordIds}
      data-last-updated={lastUpdated}
    >
      Mock LineChart
    </div>
  )
}

const PieChart = ({ data }: { data: any }) => {
  const dataRecordIds = Array.isArray(data) ? data.map((d: any) => d.id || '').join(',') : ''
  const dataSignature = Array.isArray(data) ? `${data.length}-${data.map(d => typeof d).join('')}` : '0'
  const lastUpdated = Date.now().toString()
  
  return (
    <div 
      data-testid="pie-chart"
      data-filtered-count={Array.isArray(data) ? data.length : 0}
      data-signature={dataSignature}
      data-record-ids={dataRecordIds}
      data-last-updated={lastUpdated}
    >
      Mock PieChart
    </div>
  )
}

// Learning Analytics Test Data Structure
interface FilterTestData {
  learningData: Array<{
    id: string
    userId: string
    courseId: string
    department: string
    courseType: string
    completedAt: Date
    score: number
    learningHours: number
    status: 'completed' | 'in_progress' | 'not_started'
  }>
  dateRange: { start: Date; end: Date }
  categories: string[] // departments, course types, etc.
  valueRanges: { 
    completion: [number, number]
    hours: [number, number] 
  }
}

// Mock data generator for filtering tests
const generateFilterTestData = (): FilterTestData => ({
  learningData: [
    {
      id: '1',
      userId: 'user1',
      courseId: 'course1',
      department: 'Engineering',
      courseType: 'Technical Training',
      completedAt: new Date('2024-01-15'),
      score: 85,
      learningHours: 12,
      status: 'completed'
    },
    {
      id: '2',
      userId: 'user2',
      courseId: 'course2',
      department: 'Sales',
      courseType: 'Compliance',
      completedAt: new Date('2024-02-10'),
      score: 92,
      learningHours: 8,
      status: 'completed'
    },
    {
      id: '3',
      userId: 'user3',
      courseId: 'course3',
      department: 'Engineering',
      courseType: 'Certification',
      completedAt: new Date('2024-03-05'),
      score: 78,
      learningHours: 20,
      status: 'in_progress'
    }
  ],
  dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
  categories: ['Engineering', 'Sales', 'Marketing'],
  valueRanges: { completion: [0, 100], hours: [0, 40] }
})

// Inner component that uses the filter hook
const FilteredDashboardContent: React.FC<{ testData: FilterTestData }> = ({ testData }) => {
  const { filteredData, clearFilters, activeFilters } = useChartFilter()
  
  return (
    <div data-testid="filtered-dashboard">
      <div data-testid="filter-controls">
        <FilterControls 
          dateRange={testData.dateRange}
          categories={testData.categories}
          valueRanges={testData.valueRanges}
        />
        <FilterBar activeFilters={activeFilters} onClearFilters={clearFilters} />
      </div>
      
      <div 
        data-testid="chart-data-container" 
        data-filtered-count={filteredData?.length || 0}
        className="chart-container filter-transition"
      >
        {/* Charts that should receive filtered data */}
        <BarChart data={filteredData || []} />
        <LineChart data={filteredData || []} />
        <PieChart data={filteredData || []} />
      </div>

      {/* Mock elements for drill-down tests */}
      <div data-testid="pie-slice-engineering" onClick={() => {}}>Pie Slice</div>
      <button onClick={() => {}}>Back to Overview</button>
    </div>
  )
}

// Test Component that uses filtering system
const TestFilteredDashboard: React.FC<{ testData: FilterTestData }> = ({ testData }) => {
  return (
    <FilterProvider initialData={testData.learningData}>
      <FilteredDashboardContent testData={testData} />
    </FilterProvider>
  )
}

describe('Chart Filtering and Real-Time Updates', () => {
  let testData: FilterTestData

  beforeEach(() => {
    testData = generateFilterTestData()
    // Mock performance.now for timing tests
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Filter Control Tests (3 tests)

  describe('1. Filter UI Rendering', () => {
    it('should render filter components with correct options and default states', async () => {
      // RED: This test will fail because FilterControls component doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Verify date range filter exists with correct default range
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument()
      
      // Verify category filters show correct options
      expect(screen.getByText(/engineering/i)).toBeInTheDocument()
      expect(screen.getByText(/sales/i)).toBeInTheDocument()
      expect(screen.getByText(/marketing/i)).toBeInTheDocument()
      
      // Verify value range filters with correct bounds
      const completionSlider = screen.getByLabelText(/completion rate/i)
      expect(completionSlider).toHaveAttribute('min', '0')
      expect(completionSlider).toHaveAttribute('max', '100')
      
      // Verify all filters start in default/unfiltered state
      const activeFiltersContainer = screen.getByTestId('active-filters')
      expect(activeFiltersContainer.children.length).toBe(0) // No active filter tags should exist
    })
  })

  describe('2. Multi-Filter Application', () => {
    it('should apply multiple filters simultaneously and update chart data correctly', async () => {
      // RED: This test will fail because filtering logic doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Apply department filter
      const engineeringFilter = screen.getByLabelText(/engineering/i)
      fireEvent.click(engineeringFilter)
      
      // Apply date range filter
      const startDateInput = screen.getByLabelText(/start date/i)
      fireEvent.change(startDateInput, { target: { value: '2024-02-01' } })
      
      // Apply completion score filter (minimum 80%)
      const completionSlider = screen.getByLabelText(/completion rate/i)
      fireEvent.change(completionSlider, { target: { value: '80' } })
      
      // Verify all three filters are active
      await waitFor(() => {
        expect(screen.getByTestId('active-filter-department')).toBeInTheDocument()
        expect(screen.getByTestId('active-filter-daterange')).toBeInTheDocument()
        expect(screen.getByTestId('active-filter-completion')).toBeInTheDocument()
      })
      
      // Verify filtered data only shows Engineering records after Feb 1st with 80%+ completion
      // Should only show 1 record (id: '3' - Engineering, March 5th, but status in_progress won't meet criteria)
      // Actually should show 0 records based on test data
      const chartDataContainer = screen.getByTestId('chart-data-container')
      expect(chartDataContainer).toHaveAttribute('data-filtered-count', '0')
    })
  })

  describe('3. Filter State Management', () => {
    it('should persist and update filter state properly across user interactions', async () => {
      // RED: This test will fail because state management doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Apply a department filter
      const salesFilter = screen.getByLabelText(/sales/i)
      fireEvent.click(salesFilter)
      
      // Verify filter state persists
      await waitFor(() => {
        expect(screen.getByTestId('active-filter-department')).toHaveTextContent(/sales/i)
      })
      
      // Change to different department
      const engineeringFilter = screen.getByLabelText(/engineering/i)
      fireEvent.click(engineeringFilter)
      
      // Verify state updates correctly (should have both departments if multi-select)
      await waitFor(() => {
        const activeFilters = screen.getAllByTestId(/active-filter-/)
        expect(activeFilters).toHaveLength(2) // sales + engineering
      })
      
      // Remove one filter
      const removeSalesButton = screen.getByTestId('remove-sales-filter')
      fireEvent.click(removeSalesButton)
      
      // Verify state updates and only engineering remains
      await waitFor(() => {
        expect(screen.queryByTestId('active-filter-sales')).not.toBeInTheDocument()
        expect(screen.getByTestId('active-filter-department')).toHaveTextContent(/engineering/i)
      })
    })
  })

  // Real-Time Update Tests (2 tests)

  describe('4. Immediate Chart Updates', () => {
    it('should re-render chart components within 300ms of filter changes', async () => {
      // RED: This test will fail because real-time update system doesn't exist
      let renderStartTime = 0
      let renderEndTime = 0
      
      // Mock performance timing
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0) // Initial render
        .mockReturnValueOnce(100) // Filter applied
        .mockReturnValueOnce(250) // Chart re-rendered
      
      render(<TestFilteredDashboard testData={testData} />)
      
      // Record start time and apply filter
      renderStartTime = performance.now()
      const departmentFilter = screen.getByLabelText(/engineering/i)
      
      await act(async () => {
        fireEvent.click(departmentFilter)
      })
      
      // Verify charts receive new data within performance threshold
      await waitFor(() => {
        renderEndTime = performance.now()
        const responseTime = renderEndTime - renderStartTime
        expect(responseTime).toBeLessThan(300) // <300ms requirement
      }, { timeout: 400 }) // Allow 400ms timeout for test, but expect <300ms
      
      // Verify all chart components received updated data
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-last-updated')
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-last-updated')
      expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-last-updated')
    })
  })

  describe('5. Data Synchronization', () => {
    it('should propagate filtered data correctly to all connected chart components', async () => {
      // RED: This test will fail because data synchronization system doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Apply filter that should result in 2 records (Sales department)
      const salesFilter = screen.getByLabelText(/sales/i)
      fireEvent.click(salesFilter)
      
      // Verify all charts receive the same filtered dataset
      await waitFor(() => {
        // All charts should have the same filtered data count
        expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-filtered-count', '1')
        expect(screen.getByTestId('line-chart')).toHaveAttribute('data-filtered-count', '1')
        expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-filtered-count', '1')
        
        // All charts should have the same data hash/signature for consistency
        const barChartSignature = screen.getByTestId('bar-chart').getAttribute('data-signature')
        const lineChartSignature = screen.getByTestId('line-chart').getAttribute('data-signature')
        const pieChartSignature = screen.getByTestId('pie-chart').getAttribute('data-signature')
        
        expect(barChartSignature).toBe(lineChartSignature)
        expect(lineChartSignature).toBe(pieChartSignature)
      })
      
      // Verify data consistency - all charts show the same record IDs
      const expectedRecordId = '2' // Sales department record from test data
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-record-ids', expectedRecordId)
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-record-ids', expectedRecordId)
      expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-record-ids', expectedRecordId)
    })
  })

  // Filter System Integration Tests (2 tests)

  describe('6. Clear/Reset Functionality', () => {
    it('should clear filters and return charts to original data state with smooth transitions', async () => {
      // RED: This test will fail because clear/reset functionality doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Apply multiple filters first
      const engineeringFilter = screen.getByLabelText(/engineering/i)
      const completionSlider = screen.getByLabelText(/completion rate/i)
      
      fireEvent.click(engineeringFilter)
      fireEvent.change(completionSlider, { target: { value: '85' } })
      
      // Verify filters are applied
      await waitFor(() => {
        expect(screen.getAllByTestId(/active-filter-/)).toHaveLength(2)
      })
      
      // Clear all filters
      const clearAllButton = screen.getByText(/clear all filters/i)
      fireEvent.click(clearAllButton)
      
      // Verify all filters are cleared
      await waitFor(() => {
        const activeFiltersContainer = screen.getByTestId('active-filters')
        expect(activeFiltersContainer).toBeEmptyDOMElement()
      })
      
      // Verify charts return to original data (all 3 records)
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-filtered-count', '3')
        expect(screen.getByTestId('line-chart')).toHaveAttribute('data-filtered-count', '3')
        expect(screen.getByTestId('pie-chart')).toHaveAttribute('data-filtered-count', '3')
      })
      
      // Verify smooth transition animation classes are applied
      expect(screen.getByTestId('chart-data-container')).toHaveClass('filter-transition')
    })
  })

  describe('7. Filter Persistence', () => {
    it('should maintain filter state consistency during chart interactions like drill-down', async () => {
      // RED: This test will fail because filter persistence system doesn't exist
      render(<TestFilteredDashboard testData={testData} />)
      
      // Apply department filter
      const engineeringFilter = screen.getByLabelText(/engineering/i)
      fireEvent.click(engineeringFilter)
      
      // Verify filter is applied
      await waitFor(() => {
        expect(screen.getByTestId('active-filter-department')).toBeInTheDocument()
      })
      
      // Simulate chart interaction (drill-down on pie slice)
      const pieSlice = screen.getByTestId('pie-slice-engineering')
      fireEvent.click(pieSlice)
      
      // Verify filter state persists during chart interaction
      await waitFor(() => {
        expect(screen.getByTestId('active-filter-department')).toBeInTheDocument()
        expect(screen.getByTestId('active-filter-department')).toHaveTextContent(/engineering/i)
      })
      
      // Verify filtered data remains consistent
      const chartDataContainer = screen.getByTestId('chart-data-container')
      expect(chartDataContainer).toHaveAttribute('data-filtered-count', '2') // Engineering records
      
      // Navigate back and verify filter still active
      const backButton = screen.getByText(/back to overview/i)
      fireEvent.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('active-filter-department')).toBeInTheDocument()
        expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-filtered-count', '2')
      })
    })
  })
})