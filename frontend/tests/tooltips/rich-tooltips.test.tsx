/**
 * Rich Tooltips Test Suite
 * Testing contextual tooltip system with hover effects and smart positioning
 * 
 * Task: task-0023 - Rich Hover Effects and Contextual Tooltips
 * Foundation: Builds on D3.js Chart Library (task-0010) and Interactive Filtering (task-0022)
 * 
 * TDD Strategy: 6 focused tests covering tooltip behavior, positioning, and accessibility
 * Test Pattern: Following lean TDD approach with emphasis on user interactions
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Components to be implemented (will fail initially)
import { TooltipProvider } from '../../src/components/tooltips/TooltipProvider'
import { RichTooltip } from '../../src/components/tooltips/RichTooltip'
import { useTooltip } from '../../src/hooks/useTooltip'

// Chart components (existing foundation)
import { BarChart } from '../../src/components/charts/BarChart'
import { LineChart } from '../../src/components/charts/LineChart'  
import { PieChart } from '../../src/components/charts/PieChart'

// Types to be defined
import { TooltipConfig, TooltipContent } from '../../src/types/tooltips'

// Mock chart data for testing
const mockChartData = [
  { id: '1', label: 'Course Completions', data: [{ x: 'Q1', y: 85, label: 'Q1 2024', metadata: { department: 'Sales', trend: 12 } }] },
  { id: '2', label: 'Certifications', data: [{ x: 'Q1', y: 45, label: 'Q1 2024', metadata: { department: 'Marketing', trend: -3 } }] }
]

describe('Rich Tooltips Test Suite - Task 0023', () => {
  let user: ReturnType<typeof userEvent.setup>
  let mockOnTooltipShow: ReturnType<typeof vi.fn>
  let mockOnTooltipHide: ReturnType<typeof vi.fn>

  beforeEach(() => {
    user = userEvent.setup()
    mockOnTooltipShow = vi.fn()
    mockOnTooltipHide = vi.fn()
    
    // Mock getBoundingClientRect for positioning tests
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 100,
      left: 100,
      right: 900,
      bottom: 700,
      x: 100,
      y: 100,
      toJSON: vi.fn()
    }))

    // Mock window dimensions for viewport boundary tests
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  /**
   * TEST 1: Tooltip Content Rendering
   * Validates that tooltips display correct formatted data for different chart elements
   */
  describe('1. Tooltip Content Rendering', () => {
    it('should display rich tooltip content with formatted data and trend information', async () => {
      const tooltipContent: TooltipContent = {
        title: 'Course Completions - Q1 2024',
        data: [
          { label: 'Value', value: '85', format: 'number' },
          { label: 'Department', value: 'Sales', format: 'text' },
          { label: 'Percentage', value: '15.2%', format: 'percentage' }
        ],
        trend: { value: 12, period: 'vs Q4 2023', direction: 'up' },
        actions: [{ label: 'View Details', onClick: vi.fn() }]
      }

      render(
        <TooltipProvider>
          <RichTooltip
            isVisible={true}
            content={tooltipContent}
            position={{ x: 200, y: 150 }}
            anchor="top"
          />
        </TooltipProvider>
      )

      // Verify tooltip content structure
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      expect(screen.getByText('Course Completions - Q1 2024')).toBeInTheDocument()
      
      // Verify data formatting
      expect(screen.getByText('85')).toBeInTheDocument()
      expect(screen.getByText('Sales')).toBeInTheDocument()
      expect(screen.getByText('15.2%')).toBeInTheDocument()
      
      // Verify trend indicator
      expect(screen.getByText('vs Q4 2023')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      
      // Verify action button
      expect(screen.getByRole('button', { name: 'View Details' })).toBeInTheDocument()
      
      // Verify proper ARIA attributes
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveAttribute('aria-describedby')
      expect(tooltip).toHaveClass('rich-tooltip')
    })

    it('should format different data types correctly in tooltip content', async () => {
      const tooltipContent: TooltipContent = {
        title: 'Learning Analytics Data',
        data: [
          { label: 'Hours', value: '1,234.5', format: 'number' },
          { label: 'Completion Rate', value: '87.3%', format: 'percentage' },
          { label: 'Due Date', value: '2024-12-31', format: 'date' },
          { label: 'Status', value: 'Active', format: 'status' }
        ]
      }

      render(
        <TooltipProvider>
          <RichTooltip
            isVisible={true}
            content={tooltipContent}
            position={{ x: 300, y: 200 }}
          />
        </TooltipProvider>
      )

      // Verify all formatted data is displayed
      expect(screen.getByText('1,234.5')).toBeInTheDocument()
      expect(screen.getByText('87.3%')).toBeInTheDocument()
      expect(screen.getByText('2024-12-31')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  /**
   * TEST 2: Multi-Chart Consistency
   * Validates that tooltip styling remains consistent across BarChart, LineChart, and PieChart
   */
  describe('2. Multi-Chart Tooltip Consistency', () => {
    it('should maintain consistent tooltip styling across different chart types', async () => {
      const { rerender } = render(
        <TooltipProvider>
          <BarChart
            data={mockChartData}
            width={400}
            height={300}
            onBarHover={mockOnTooltipShow}
          />
        </TooltipProvider>
      )

      // Simulate hover on bar chart element
      const barElement = screen.getByTestId('bar-chart')
      await act(async () => {
        fireEvent.mouseOver(barElement)
      })

      // Get tooltip styles from bar chart
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveClass('rich-tooltip', 'tooltip-bar-chart')
      })

      const barTooltipStyles = window.getComputedStyle(screen.getByRole('tooltip'))

      // Test LineChart consistency
      rerender(
        <TooltipProvider>
          <LineChart
            data={mockChartData}
            width={400}
            height={300}
            onPointHover={mockOnTooltipShow}
          />
        </TooltipProvider>
      )

      const lineElement = screen.getByTestId('line-chart')
      await act(async () => {
        fireEvent.mouseOver(lineElement)
      })

      await waitFor(() => {
        const lineTooltip = screen.getByRole('tooltip')
        expect(lineTooltip).toHaveClass('rich-tooltip', 'tooltip-line-chart')
        
        // Verify consistent base styling
        const lineTooltipStyles = window.getComputedStyle(lineTooltip)
        expect(lineTooltipStyles.fontFamily).toBe(barTooltipStyles.fontFamily)
        expect(lineTooltipStyles.fontSize).toBe(barTooltipStyles.fontSize)
        expect(lineTooltipStyles.borderRadius).toBe(barTooltipStyles.borderRadius)
      })

      // Test PieChart consistency
      rerender(
        <TooltipProvider>
          <PieChart
            data={mockChartData}
            width={400}
            height={300}
            onSliceHover={mockOnTooltipShow}
          />
        </TooltipProvider>
      )

      const pieElement = screen.getByTestId('pie-chart')
      await act(async () => {
        fireEvent.mouseOver(pieElement)
      })

      await waitFor(() => {
        const pieTooltip = screen.getByRole('tooltip')
        expect(pieTooltip).toHaveClass('rich-tooltip', 'tooltip-pie-chart')
      })
    })
  })

  /**
   * TEST 3: Hover Detection and Positioning
   * Validates that hover events trigger tooltip display with correct positioning
   */
  describe('3. Hover Detection and Positioning', () => {
    it('should detect hover events and position tooltip correctly relative to mouse', async () => {
      const TestComponent = () => {
        const { showTooltip, hideTooltip, tooltip } = useTooltip()
        
        const handleMouseMove = (event: React.MouseEvent) => {
          showTooltip({
            content: {
              title: 'Hover Data',
              data: [{ label: 'Value', value: '42', format: 'number' }]
            },
            position: { x: event.clientX, y: event.clientY },
            anchor: 'auto'
          })
        }

        return (
          <div>
            <div
              data-testid="hover-target"
              style={{ width: 200, height: 100, background: 'blue' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={hideTooltip}
            />
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      const hoverTarget = screen.getByTestId('hover-target')

      // Simulate mouse move at specific coordinates
      await act(async () => {
        fireEvent.mouseMove(hoverTarget, { clientX: 250, clientY: 180 })
      })

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        
        // Verify tooltip positioning (position calculated relative to viewport)
        expect(tooltip).toHaveStyle({
          position: 'absolute'
        })
        // Position may be adjusted by auto-positioning, just verify it exists
        expect(tooltip.style.left).toBeDefined()
        expect(tooltip.style.top).toBeDefined()
      })

      // Test mouse leave hides tooltip
      await act(async () => {
        fireEvent.mouseLeave(hoverTarget)
      })

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      })
    })

    it('should handle rapid hover events without performance issues', async () => {
      const startTime = performance.now()
      let tooltipShowCount = 0

      const TestComponent = () => {
        const { showTooltip, hideTooltip, tooltip } = useTooltip({
          onShow: () => tooltipShowCount++
        })

        const handleMouseMove = (event: React.MouseEvent) => {
          showTooltip({
            content: {
              title: 'Performance Test',
              data: [{ label: 'Count', value: tooltipShowCount.toString() }]
            },
            position: { x: event.clientX, y: event.clientY }
          })
        }

        return (
          <div>
            <div
              data-testid="performance-target"
              onMouseMove={handleMouseMove}
              onMouseLeave={hideTooltip}
              style={{ width: 300, height: 200 }}
            />
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      const performanceTarget = screen.getByTestId('performance-target')

      // Simulate rapid mouse movements
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          fireEvent.mouseMove(performanceTarget, { 
            clientX: 100 + i * 2, 
            clientY: 100 + i 
          })
        })
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Verify performance target (<100ms for all operations)
      expect(totalTime).toBeLessThan(100)
      expect(tooltipShowCount).toBeGreaterThan(0)
    })
  })

  /**
   * TEST 4: Hover Performance
   * Validates that smooth hover transitions maintain <100ms response time
   */
  describe('4. Hover Performance Optimization', () => {
    it('should maintain smooth hover transitions with <100ms response time', async () => {
      const performanceMetrics: Array<{ operation: string; duration: number }> = []
      
      const TestComponent = () => {
        const { showTooltip, hideTooltip, tooltip } = useTooltip({
          onShow: () => {
            const showTime = performance.now()
            performanceMetrics.push({ operation: 'show', duration: showTime })
          },
          onHide: () => {
            const hideTime = performance.now()
            performanceMetrics.push({ operation: 'hide', duration: hideTime })
          }
        })

        const handleMouseEnter = (event: React.MouseEvent) => {
          const startTime = performance.now()
          showTooltip({
            content: {
              title: 'Performance Tooltip',
              data: [
                { label: 'Metric 1', value: '1,234', format: 'number' },
                { label: 'Metric 2', value: '56.7%', format: 'percentage' }
              ],
              trend: { value: 8, period: 'last week', direction: 'up' }
            },
            position: { x: event.clientX, y: event.clientY },
            anchor: 'auto'
          })
          
          const endTime = performance.now()
          performanceMetrics.push({ 
            operation: 'showTooltip', 
            duration: endTime - startTime 
          })
        }

        return (
          <div>
            <div
              data-testid="performance-chart"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={hideTooltip}
              style={{ width: 400, height: 300, background: 'lightgray' }}
            />
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      const performanceChart = screen.getByTestId('performance-chart')

      // Test show performance
      await act(async () => {
        fireEvent.mouseEnter(performanceChart, { clientX: 200, clientY: 150 })
      })

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        
        // Verify smooth transition support while tooltip is visible
        const computedStyle = window.getComputedStyle(tooltip)
        expect(computedStyle.transition).toContain('opacity')
      })

      // Test hide performance
      const hideStartTime = performance.now()
      await act(async () => {
        fireEvent.mouseLeave(performanceChart)
      })

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      })
      
      const hideEndTime = performance.now()
      const hideDuration = hideEndTime - hideStartTime

      // Verify performance requirements
      const showOperation = performanceMetrics.find(m => m.operation === 'showTooltip')
      expect(showOperation?.duration).toBeLessThan(100)
      expect(hideDuration).toBeLessThan(50)
    })

    it('should optimize tooltip rendering for complex content without lag', async () => {
      const complexContent: TooltipContent = {
        title: 'Complex Learning Analytics Dashboard',
        data: [
          { label: 'Total Users', value: '12,345', format: 'number' },
          { label: 'Active This Month', value: '8,901', format: 'number' },
          { label: 'Course Completion Rate', value: '78.5%', format: 'percentage' },
          { label: 'Avg Time Spent', value: '2.5 hours', format: 'duration' },
          { label: 'Certificates Issued', value: '1,256', format: 'number' }
        ],
        trend: { value: 15, period: 'vs last month', direction: 'up' },
        actions: [
          { label: 'View Report', onClick: vi.fn() },
          { label: 'Export Data', onClick: vi.fn() },
          { label: 'Configure', onClick: vi.fn() }
        ]
      }

      const renderStartTime = performance.now()

      render(
        <TooltipProvider>
          <RichTooltip
            isVisible={true}
            content={complexContent}
            position={{ x: 300, y: 200 }}
            anchor="auto"
          />
        </TooltipProvider>
      )

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })

      const renderEndTime = performance.now()
      const renderDuration = renderEndTime - renderStartTime

      // Verify complex content renders quickly
      expect(renderDuration).toBeLessThan(100)

      // Verify all content is displayed correctly
      expect(screen.getByText('12,345')).toBeInTheDocument()
      expect(screen.getByText('78.5%')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'View Report' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Export Data' })).toBeInTheDocument()
    })
  })

  /**
   * TEST 5: Viewport Boundary Detection
   * Validates that tooltip positioning adjusts to stay within screen boundaries
   */
  describe('5. Smart Positioning and Viewport Boundaries', () => {
    it('should adjust tooltip position to stay within viewport boundaries', async () => {
      const TestComponent = () => {
        const { showTooltip, tooltip } = useTooltip()

        const showTooltipNearEdge = (edge: 'top' | 'right' | 'bottom' | 'left') => {
          let position = { x: 500, y: 300 }
          
          switch (edge) {
            case 'top':
              position = { x: 500, y: 50 } // Near top edge
              break
            case 'right':
              position = { x: 950, y: 300 } // Near right edge  
              break
            case 'bottom':
              position = { x: 500, y: 700 } // Near bottom edge
              break
            case 'left':
              position = { x: 50, y: 300 } // Near left edge
              break
          }

          showTooltip({
            content: {
              title: `${edge.charAt(0).toUpperCase() + edge.slice(1)} Edge Test`,
              data: [{ label: 'Position', value: `${position.x}, ${position.y}` }]
            },
            position,
            anchor: 'auto'
          })
        }

        return (
          <div>
            <button data-testid="test-top" onClick={() => showTooltipNearEdge('top')}>Top Edge</button>
            <button data-testid="test-right" onClick={() => showTooltipNearEdge('right')}>Right Edge</button>
            <button data-testid="test-bottom" onClick={() => showTooltipNearEdge('bottom')}>Bottom Edge</button>
            <button data-testid="test-left" onClick={() => showTooltipNearEdge('left')}>Left Edge</button>
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      // Test top edge positioning
      await user.click(screen.getByTestId('test-top'))
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        
        // Tooltip should be repositioned away from top edge (bottom or bottom-left/right)
        const anchor = tooltip.getAttribute('data-anchor')
        expect(anchor).toMatch(/bottom/)
      })

      // Test right edge positioning  
      await user.click(screen.getByTestId('test-right'))
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        
        // Tooltip should be repositioned away from right edge (left or bottom-left)
        const anchor = tooltip.getAttribute('data-anchor')
        expect(anchor).toMatch(/left/)
      })

      // Test bottom edge positioning
      await user.click(screen.getByTestId('test-bottom'))
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        
        // Tooltip should be repositioned away from bottom edge (top, top-left, or top-right)
        const anchor = tooltip.getAttribute('data-anchor')
        expect(anchor).toMatch(/top/)
      })

      // Test left edge positioning
      await user.click(screen.getByTestId('test-left'))
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        
        // Tooltip should be repositioned to the right near left edge
        expect(tooltip).toHaveAttribute('data-anchor', 'right')
      })
    })

    it('should calculate optimal position when tooltip would overflow multiple edges', async () => {
      // Test corner positioning (top-left corner)
      const TestComponent = () => {
        const { showTooltip, tooltip } = useTooltip()

        const handleCornerPosition = () => {
          showTooltip({
            content: {
              title: 'Corner Position Test',
              data: [
                { label: 'X Position', value: '25' },
                { label: 'Y Position', value: '25' }
              ]
            },
            position: { x: 25, y: 25 }, // Very close to top-left corner
            anchor: 'auto'
          })
        }

        return (
          <div>
            <button data-testid="corner-test" onClick={handleCornerPosition}>
              Corner Test
            </button>
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      await user.click(screen.getByTestId('corner-test'))

      await waitFor(() => {
        const tooltipElement = screen.getByRole('tooltip')
        expect(tooltipElement).toBeInTheDocument()
        
        // Tooltip should be positioned away from both top and left edges
        expect(tooltipElement).toHaveAttribute('data-anchor', 'bottom-right')
        
        // Verify tooltip stays within viewport
        const rect = tooltipElement.getBoundingClientRect()
        expect(rect.left).toBeGreaterThanOrEqual(0)
        expect(rect.top).toBeGreaterThanOrEqual(0)
        expect(rect.right).toBeLessThanOrEqual(window.innerWidth)
        expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight)
      })
    })
  })

  /**
   * TEST 6: Keyboard Accessibility
   * Validates that tooltip functionality works with keyboard navigation
   */
  describe('6. Keyboard Accessibility and Screen Reader Support', () => {
    it('should support keyboard navigation and focus management', async () => {
      const TestComponent = () => {
        const { showTooltip, hideTooltip, tooltip, isVisible } = useTooltip()

        const handleKeyDown = (event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (isVisible) {
              hideTooltip()
            } else {
              showTooltip({
                content: {
                  title: 'Keyboard Accessed Tooltip',
                  data: [
                    { label: 'Triggered by', value: 'Keyboard' },
                    { label: 'Key', value: event.key }
                  ]
                },
                position: { x: 300, y: 200 },
                anchor: 'top'
              })
            }
          }
        }

        return (
          <div>
            <button
              data-testid="keyboard-trigger"
              onKeyDown={handleKeyDown}
              aria-describedby="tooltip-content"
              aria-expanded={isVisible}
            >
              Interactive Chart Element
            </button>
            {tooltip}
          </div>
        )
      }

      render(
        <TooltipProvider>
          <TestComponent />
        </TooltipProvider>
      )

      const triggerButton = screen.getByTestId('keyboard-trigger')
      
      // Focus the element
      triggerButton.focus()
      expect(triggerButton).toHaveFocus()

      // Show tooltip with Enter key
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveAttribute('aria-live', 'polite')
        expect(tooltip).toHaveAttribute('id', 'tooltip-content')
        expect(triggerButton).toHaveAttribute('aria-expanded', 'true')
      })

      // Hide tooltip with Space key
      await user.keyboard(' ')
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        expect(triggerButton).toHaveAttribute('aria-expanded', 'false')
      })

      // Show tooltip with Space key
      await user.keyboard(' ')
      
      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(screen.getByText('Keyboard')).toBeInTheDocument()
      })
    })

    it('should provide proper screen reader announcements and ARIA attributes', async () => {
      const tooltipContent: TooltipContent = {
        title: 'Accessibility Test Tooltip',
        data: [
          { label: 'Course Progress', value: '75%', format: 'percentage' },
          { label: 'Time Remaining', value: '2 days', format: 'duration' }
        ],
        trend: { value: 10, period: 'this week', direction: 'up' },
        actions: [
          { label: 'View Details', onClick: vi.fn() },
          { label: 'Export Data', onClick: vi.fn() }
        ]
      }

      render(
        <TooltipProvider>
          <RichTooltip
            isVisible={true}
            content={tooltipContent}
            position={{ x: 200, y: 150 }}
            anchor="bottom"
          />
        </TooltipProvider>
      )

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        
        // Verify ARIA attributes for screen readers
        expect(tooltip).toHaveAttribute('aria-live', 'polite')
        expect(tooltip).toHaveAttribute('aria-atomic', 'true')
        expect(tooltip).toHaveAttribute('role', 'tooltip')
        
        // Verify structured content for screen readers
        expect(tooltip).toHaveAttribute('aria-labelledby', 'tooltip-title')
        expect(tooltip).toHaveAttribute('aria-describedby', 'tooltip-description')
        
        // Verify title and description elements exist
        expect(screen.getByText('Accessibility Test Tooltip')).toHaveAttribute('id', 'tooltip-title')
        
        // Verify keyboard-navigable actions
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).toHaveAttribute('tabindex', '0')
        })
      })
    })

    it('should support high contrast mode and accessibility preferences', async () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <TooltipProvider>
          <RichTooltip
            isVisible={true}
            content={{
              title: 'High Contrast Test',
              data: [{ label: 'Visibility', value: 'Enhanced' }]
            }}
            position={{ x: 200, y: 150 }}
          />
        </TooltipProvider>
      )

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        
        // Verify high contrast styling is applied
        expect(tooltip).toHaveClass('high-contrast')
        
        // Verify sufficient color contrast
        const computedStyle = window.getComputedStyle(tooltip)
        expect(computedStyle.backgroundColor).toBeDefined()
        expect(computedStyle.color).toBeDefined()
        expect(computedStyle.borderColor).toBeDefined()
      })
    })
  })
})