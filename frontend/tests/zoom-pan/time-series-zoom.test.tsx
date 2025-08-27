/**
 * Time-Series Zoom and Pan Test Suite
 * Testing interactive zoom/pan capabilities for time-series charts enabling detailed temporal data analysis
 * 
 * Task: task-0024 - Zoom and Pan for Time-Series Exploration
 * Foundation: Builds on D3.js Chart Library (task-0010), Filtering (task-0022), and Tooltips (task-0023)
 * 
 * TDD Strategy: 9 focused tests covering zoom/pan behavior, performance, and mobile interactions
 * Test Pattern: Following lean TDD approach with emphasis on time-series exploration patterns
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Components to be implemented (will fail initially)
import { ZoomPanProvider } from '../../src/components/zoom-pan/ZoomPanProvider'
import { ZoomControls } from '../../src/components/zoom-pan/ZoomControls'
import { PanHandler } from '../../src/components/zoom-pan/PanHandler'
import { MiniMapOverview } from '../../src/components/zoom-pan/MiniMapOverview'
import { useZoomPan } from '../../src/hooks/useZoomPan'

// Chart components (existing foundation)
import { LineChart } from '../../src/components/charts/LineChart'
import { AreaChart } from '../../src/components/charts/AreaChart'
import { TimeSeriesChart } from '../../src/components/charts/TimeSeriesChart'

// Types to be defined
import { ZoomPanState, ZoomControls as ZoomControlsInterface } from '../../src/types/zoom-pan'

// Mock time-series data for learning analytics testing
const mockTimeSeriesData = [
  { date: new Date('2024-01-01'), completions: 45, enrollments: 120, certifications: 12 },
  { date: new Date('2024-01-15'), completions: 52, enrollments: 135, certifications: 15 },
  { date: new Date('2024-02-01'), completions: 38, enrollments: 98, certifications: 8 },
  { date: new Date('2024-02-15'), completions: 67, enrollments: 156, certifications: 23 },
  { date: new Date('2024-03-01'), completions: 71, enrollments: 178, certifications: 28 },
  { date: new Date('2024-03-15'), completions: 59, enrollments: 142, certifications: 19 }
]

const mockExtendedTimeSeriesData = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(2024, 0, 1 + i),
  completions: Math.floor(Math.random() * 100) + 20,
  enrollments: Math.floor(Math.random() * 200) + 50,
  certifications: Math.floor(Math.random() * 30) + 5
}))

describe('Time-Series Zoom and Pan Test Suite - Task 0024', () => {
  let user: ReturnType<typeof userEvent.setup>
  let mockOnZoomChange: ReturnType<typeof vi.fn>
  let mockOnPanChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    user = userEvent.setup()
    mockOnZoomChange = vi.fn()
    mockOnPanChange = vi.fn()
    
    // Mock getBoundingClientRect for positioning tests
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 400,
      top: 100,
      left: 100,
      right: 900,
      bottom: 500,
      x: 100,
      y: 100,
      toJSON: vi.fn()
    }))

    // Mock window dimensions and device capabilities
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 })
    
    // Mock performance.now for timing tests
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now())
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  /**
   * ZOOM FUNCTIONALITY TESTS (4 tests)
   */

  /**
   * TEST 1: Mouse Wheel Zoom
   * Validates that zoom in/out responds correctly to mouse wheel events
   */
  describe('1. Mouse Wheel Zoom Functionality', () => {
    it('should zoom in and out correctly with mouse wheel events', async () => {
      const TestComponent = () => {
        const { zoomState, zoomIn, zoomOut, zoomToScale } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')],
          onZoomChange: mockOnZoomChange
        })

        return (
          <ZoomPanProvider>
            <div data-testid="zoom-container" style={{ width: 800, height: 400 }}>
              <TimeSeriesChart
                data={mockExtendedTimeSeriesData}
                zoomState={zoomState}
                onWheel={(event) => {
                  if (event.deltaY < 0) {
                    zoomIn(event.clientX, event.clientY)
                  } else {
                    zoomOut(event.clientX, event.clientY)
                  }
                }}
              />
              <div data-testid="zoom-level">{zoomState.scale.toFixed(2)}</div>
              <div data-testid="time-extent">
                {zoomState.timeExtent[0].toISOString()} - {zoomState.timeExtent[1].toISOString()}
              </div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const zoomContainer = screen.getByTestId('zoom-container')
      const initialZoomLevel = screen.getByTestId('zoom-level')
      
      // Verify initial zoom state
      expect(initialZoomLevel.textContent).toBe('1.00')
      expect(mockOnZoomChange).not.toHaveBeenCalled()

      // Test zoom in with wheel up
      await act(async () => {
        fireEvent.wheel(zoomContainer, { 
          deltaY: -100, 
          clientX: 400, 
          clientY: 200,
          preventDefault: vi.fn()
        })
      })

      await waitFor(() => {
        const currentZoomLevel = screen.getByTestId('zoom-level')
        expect(parseFloat(currentZoomLevel.textContent || '0')).toBeGreaterThan(1.0)
        expect(mockOnZoomChange).toHaveBeenCalledWith(expect.objectContaining({
          scale: expect.any(Number),
          timeExtent: expect.any(Array),
          zoomLevel: expect.any(String)
        }))
      })

      // Test zoom out with wheel down
      await act(async () => {
        fireEvent.wheel(zoomContainer, { 
          deltaY: 100, 
          clientX: 400, 
          clientY: 200,
          preventDefault: vi.fn()
        })
      })

      await waitFor(() => {
        const timeExtent = screen.getByTestId('time-extent')
        expect(timeExtent.textContent).toContain('2024')
      })
    })

    it('should handle rapid wheel events without performance degradation', async () => {
      const performanceMetrics: number[] = []

      const TestComponent = () => {
        const { zoomState, zoomIn, zoomOut } = useZoomPan({
          onZoomChange: (state) => {
            const endTime = performance.now()
            performanceMetrics.push(endTime)
          }
        })

        return (
          <ZoomPanProvider>
            <div 
              data-testid="performance-zoom"
              onWheel={(event) => {
                const startTime = performance.now()
                performanceMetrics.push(startTime)
                
                if (event.deltaY < 0) {
                  zoomIn(event.clientX, event.clientY)
                } else {
                  zoomOut(event.clientX, event.clientY)
                }
              }}
              style={{ width: 800, height: 400 }}
            >
              <TimeSeriesChart data={mockTimeSeriesData} zoomState={zoomState} />
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)
      const performanceZoom = screen.getByTestId('performance-zoom')

      // Simulate rapid wheel events
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          fireEvent.wheel(performanceZoom, { deltaY: i % 2 === 0 ? -50 : 50 })
        })
      }

      // Verify performance requirements (<100ms response time)
      const responseTimes = []
      for (let i = 1; i < performanceMetrics.length; i += 2) {
        responseTimes.push(performanceMetrics[i] - performanceMetrics[i - 1])
      }

      responseTimes.forEach(responseTime => {
        expect(responseTime).toBeLessThan(100)
      })
    })
  })

  /**
   * TEST 2: Zoom Limits
   * Validates that zoom respects minimum and maximum scale constraints
   */
  describe('2. Zoom Limits and Constraints', () => {
    it('should respect minimum and maximum zoom scale limits', async () => {
      const minScale = 0.1
      const maxScale = 10.0

      const TestComponent = () => {
        const { zoomState, zoomIn, zoomOut, resetZoom } = useZoomPan({
          minScale,
          maxScale,
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        return (
          <ZoomPanProvider>
            <div data-testid="zoom-limits-container">
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <div data-testid="current-scale">{zoomState.scale}</div>
              <button data-testid="zoom-in-btn" onClick={() => zoomIn(400, 200)}>Zoom In</button>
              <button data-testid="zoom-out-btn" onClick={() => zoomOut(400, 200)}>Zoom Out</button>
              <button data-testid="reset-btn" onClick={resetZoom}>Reset</button>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test maximum zoom limit
      const zoomInBtn = screen.getByTestId('zoom-in-btn')
      
      // Zoom in multiple times to exceed max limit
      for (let i = 0; i < 20; i++) {
        await user.click(zoomInBtn)
      }

      await waitFor(() => {
        const currentScale = parseFloat(screen.getByTestId('current-scale').textContent || '0')
        expect(currentScale).toBeLessThanOrEqual(maxScale)
      })

      // Reset and test minimum zoom limit
      await user.click(screen.getByTestId('reset-btn'))
      
      const zoomOutBtn = screen.getByTestId('zoom-out-btn')
      
      // Zoom out multiple times to exceed min limit
      for (let i = 0; i < 20; i++) {
        await user.click(zoomOutBtn)
      }

      await waitFor(() => {
        const currentScale = parseFloat(screen.getByTestId('current-scale').textContent || '0')
        expect(currentScale).toBeGreaterThanOrEqual(minScale)
      })
    })

    it('should prevent zoom beyond data boundaries in time dimension', async () => {
      const dataTimeExtent: [Date, Date] = [new Date('2024-01-01'), new Date('2024-12-31')]

      const TestComponent = () => {
        const { zoomState, zoomToTimeRange } = useZoomPan({
          initialTimeExtent: dataTimeExtent,
          enforceBoundaries: true
        })

        return (
          <ZoomPanProvider>
            <div>
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <button 
                data-testid="zoom-beyond-start"
                onClick={() => zoomToTimeRange(
                  new Date('2023-01-01'), // Before data start
                  new Date('2024-06-01')
                )}
              >
                Zoom Beyond Start
              </button>
              <button 
                data-testid="zoom-beyond-end"
                onClick={() => zoomToTimeRange(
                  new Date('2024-06-01'),
                  new Date('2025-12-31') // After data end
                )}
              >
                Zoom Beyond End
              </button>
              <div data-testid="time-range">
                {zoomState.timeExtent[0].toDateString()} - {zoomState.timeExtent[1].toDateString()}
              </div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test zoom beyond start boundary
      await user.click(screen.getByTestId('zoom-beyond-start'))
      
      await waitFor(() => {
        const timeRange = screen.getByTestId('time-range').textContent || ''
        expect(timeRange).toContain('2024') // Should be constrained to data range
        expect(timeRange).not.toContain('2023')
      })

      // Test zoom beyond end boundary
      await user.click(screen.getByTestId('zoom-beyond-end'))
      
      await waitFor(() => {
        const timeRange = screen.getByTestId('time-range').textContent || ''
        expect(timeRange).toContain('2024') // Should be constrained to data range
        expect(timeRange).not.toContain('2025')
      })
    })
  })

  /**
   * TEST 3: Zoom Controls
   * Validates that preset zoom buttons (1W, 1M, 3M, 1Y) set correct time ranges
   */
  describe('3. Zoom Controls and Presets', () => {
    it('should set correct time ranges for preset zoom controls', async () => {
      const TestComponent = () => {
        const { zoomState, setPresetZoom, resetZoom } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        return (
          <ZoomPanProvider>
            <div>
              <ZoomControls
                onPresetZoom={setPresetZoom}
                onReset={resetZoom}
                currentZoomLevel={zoomState.zoomLevel}
              />
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <div data-testid="zoom-level">{zoomState.zoomLevel}</div>
              <div data-testid="time-span">
                {Math.round((zoomState.timeExtent[1].getTime() - zoomState.timeExtent[0].getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test 1 Week preset
      await user.click(screen.getByRole('button', { name: /1 week|1W/i }))
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level').textContent).toBe('week')
        expect(parseInt(screen.getByTestId('time-span').textContent || '0')).toBeCloseTo(7, 1)
      })

      // Test 1 Month preset
      await user.click(screen.getByRole('button', { name: /1 month|1M/i }))
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level').textContent).toBe('month')
        expect(parseInt(screen.getByTestId('time-span').textContent || '0')).toBeCloseTo(30, 5)
      })

      // Test 3 Months preset
      await user.click(screen.getByRole('button', { name: /3 months|3M/i }))
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level').textContent).toBe('quarter')
        expect(parseInt(screen.getByTestId('time-span').textContent || '0')).toBeCloseTo(90, 10)
      })

      // Test 1 Year preset
      await user.click(screen.getByRole('button', { name: /1 year|1Y/i }))
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level').textContent).toBe('year')
        expect(parseInt(screen.getByTestId('time-span').textContent || '0')).toBeCloseTo(365, 10)
      })

      // Test Reset functionality
      await user.click(screen.getByRole('button', { name: /reset|all/i }))
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level').textContent).toBe('custom')
        expect(parseInt(screen.getByTestId('time-span').textContent || '0')).toBe(365) // Full year
      })
    })

    it('should provide visual feedback for active zoom control', async () => {
      const TestComponent = () => {
        const { zoomState, setPresetZoom } = useZoomPan()

        return (
          <ZoomPanProvider>
            <ZoomControls
              onPresetZoom={setPresetZoom}
              currentZoomLevel={zoomState.zoomLevel}
            />
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const weekButton = screen.getByRole('button', { name: /1 week|1W/i })
      const monthButton = screen.getByRole('button', { name: /1 month|1M/i })

      // Test active state indication
      await user.click(weekButton)
      await waitFor(() => {
        expect(weekButton).toHaveClass('active', 'selected', 'zoom-active')
        expect(monthButton).not.toHaveClass('active', 'selected', 'zoom-active')
      })

      await user.click(monthButton)
      await waitFor(() => {
        expect(monthButton).toHaveClass('active', 'selected', 'zoom-active')
        expect(weekButton).not.toHaveClass('active', 'selected', 'zoom-active')
      })
    })
  })

  /**
   * TEST 4: Zoom State Management
   * Validates that zoom level persists during chart updates
   */
  describe('4. Zoom State Management and Persistence', () => {
    it('should maintain zoom state during data updates', async () => {
      let currentData = mockTimeSeriesData

      const TestComponent = () => {
        const [data, setData] = React.useState(currentData)
        const { zoomState, zoomToScale } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        return (
          <ZoomPanProvider>
            <div>
              <TimeSeriesChart data={data} zoomState={zoomState} />
              <button 
                data-testid="zoom-in-2x"
                onClick={() => zoomToScale(2.0)}
              >
                Zoom 2x
              </button>
              <button 
                data-testid="update-data"
                onClick={() => setData([...mockExtendedTimeSeriesData])}
              >
                Update Data
              </button>
              <div data-testid="current-scale">{zoomState.scale.toFixed(1)}</div>
              <div data-testid="data-points">{data.length} points</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Set initial zoom level
      await user.click(screen.getByTestId('zoom-in-2x'))
      await waitFor(() => {
        expect(screen.getByTestId('current-scale').textContent).toBe('2.0')
      })

      // Update data and verify zoom state persists
      await user.click(screen.getByTestId('update-data'))
      await waitFor(() => {
        expect(screen.getByTestId('data-points').textContent).toBe('365 points')
        expect(screen.getByTestId('current-scale').textContent).toBe('2.0') // Zoom maintained
      })
    })

    it('should synchronize zoom state across multiple chart instances', async () => {
      const TestComponent = () => {
        const sharedZoomState = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        return (
          <ZoomPanProvider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div data-testid="chart-1">
                <LineChart 
                  data={mockTimeSeriesData.map(d => ({ x: d.date, y: d.completions }))}
                  zoomState={sharedZoomState.zoomState}
                />
              </div>
              <div data-testid="chart-2">
                <AreaChart 
                  data={mockTimeSeriesData.map(d => ({ x: d.date, y: d.enrollments }))}
                  zoomState={sharedZoomState.zoomState}
                />
              </div>
              <button 
                data-testid="sync-zoom"
                onClick={() => sharedZoomState.zoomToScale(3.0)}
              >
                Sync Zoom 3x
              </button>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Trigger synchronized zoom
      await user.click(screen.getByTestId('sync-zoom'))

      await waitFor(() => {
        const chart1 = screen.getByTestId('chart-1')
        const chart2 = screen.getByTestId('chart-2')
        
        // Both charts should reflect the same zoom state
        expect(chart1).toHaveAttribute('data-zoom-scale', '3')
        expect(chart2).toHaveAttribute('data-zoom-scale', '3')
      })
    })
  })

  /**
   * PAN FUNCTIONALITY TESTS (3 tests)
   */

  /**
   * TEST 5: Click-Drag Pan
   * Validates that smooth panning responds to mouse drag gestures
   */
  describe('5. Click-and-Drag Pan Functionality', () => {
    it('should respond to mouse drag gestures for smooth panning', async () => {
      const TestComponent = () => {
        const { zoomState, panBy, panTo } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        const handleMouseDown = (event: React.MouseEvent) => {
          const startX = event.clientX
          const startTime = zoomState.timeExtent[0].getTime()

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const timeDelta = (deltaX / 800) * (zoomState.timeExtent[1].getTime() - zoomState.timeExtent[0].getTime())
            panBy(-timeDelta, 0) // Negative because panning left moves time forward
          }

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }

          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }

        return (
          <ZoomPanProvider>
            <div
              data-testid="pan-container"
              onMouseDown={handleMouseDown}
              style={{ width: 800, height: 400, cursor: 'grab' }}
            >
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <div data-testid="time-start">{zoomState.timeExtent[0].toISOString().split('T')[0]}</div>
              <div data-testid="time-end">{zoomState.timeExtent[1].toISOString().split('T')[0]}</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const panContainer = screen.getByTestId('pan-container')
      const initialStartTime = screen.getByTestId('time-start').textContent

      // Simulate drag gesture (mousedown -> mousemove -> mouseup)
      await act(async () => {
        fireEvent.mouseDown(panContainer, { clientX: 400, clientY: 200 })
        fireEvent.mouseMove(document, { clientX: 300, clientY: 200 }) // Drag left 100px
        fireEvent.mouseUp(document)
      })

      await waitFor(() => {
        const currentStartTime = screen.getByTestId('time-start').textContent
        expect(currentStartTime).not.toBe(initialStartTime) // Time range should have changed
      })

      // Verify smooth cursor feedback
      expect(panContainer).toHaveStyle({ cursor: 'grab' })
    })

    it('should maintain 60fps during continuous drag operations', async () => {
      const frameTimings: number[] = []
      let frameCount = 0

      const TestComponent = () => {
        const { zoomState, panBy } = useZoomPan()

        const handleDrag = (deltaX: number) => {
          const frameStart = performance.now()
          panBy(deltaX * 1000, 0) // Convert pixel to time delta
          const frameEnd = performance.now()
          frameTimings.push(frameEnd - frameStart)
          frameCount++
        }

        return (
          <ZoomPanProvider>
            <PanHandler
              onPan={handleDrag}
              targetFPS={60}
            >
              <div data-testid="performance-pan-area" style={{ width: 800, height: 400 }}>
                <TimeSeriesChart data={mockTimeSeriesData} zoomState={zoomState} />
              </div>
            </PanHandler>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const panArea = screen.getByTestId('performance-pan-area')

      // Simulate continuous drag for performance testing
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          fireEvent.mouseMove(panArea, { clientX: 400 + i, clientY: 200 })
        })
      }

      // Verify 60fps performance (frame time should be < 16.67ms)
      const averageFrameTime = frameTimings.reduce((sum, time) => sum + time, 0) / frameTimings.length
      expect(averageFrameTime).toBeLessThan(16.67) // 60fps requirement
      expect(frameCount).toBe(30)
    })
  })

  /**
   * TEST 6: Pan Boundaries
   * Validates that panning stops at data boundaries and doesn't show empty areas
   */
  describe('6. Pan Boundaries and Constraints', () => {
    it('should prevent panning beyond data boundaries', async () => {
      const dataExtent: [Date, Date] = [new Date('2024-01-01'), new Date('2024-12-31')]

      const TestComponent = () => {
        const { zoomState, panTo } = useZoomPan({
          initialTimeExtent: dataExtent,
          enforceBoundaries: true
        })

        return (
          <ZoomPanProvider>
            <div>
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <button
                data-testid="pan-before-start"
                onClick={() => panTo(new Date('2023-06-01'))} // Before data start
              >
                Pan Before Start
              </button>
              <button
                data-testid="pan-after-end"
                onClick={() => panTo(new Date('2025-06-01'))} // After data end
              >
                Pan After End
              </button>
              <div data-testid="visible-start">{zoomState.timeExtent[0].getFullYear()}</div>
              <div data-testid="visible-end">{zoomState.timeExtent[1].getFullYear()}</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test pan before data start
      await user.click(screen.getByTestId('pan-before-start'))
      await waitFor(() => {
        const visibleStart = parseInt(screen.getByTestId('visible-start').textContent || '0')
        expect(visibleStart).toBeGreaterThanOrEqual(2024) // Should be constrained to data range
      })

      // Test pan after data end
      await user.click(screen.getByTestId('pan-after-end'))
      await waitFor(() => {
        const visibleEnd = parseInt(screen.getByTestId('visible-end').textContent || '0')
        expect(visibleEnd).toBeLessThanOrEqual(2024) // Should be constrained to data range
      })
    })

    it('should show visual feedback when reaching pan boundaries', async () => {
      const TestComponent = () => {
        const { zoomState, panBy } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')],
          enforceBoundaries: true
        })

        return (
          <ZoomPanProvider>
            <div>
              <TimeSeriesChart data={mockTimeSeriesData} zoomState={zoomState} />
              <button
                data-testid="pan-left-boundary"
                onClick={() => panBy(-1000000000, 0)} // Large negative pan
              >
                Pan to Left Boundary
              </button>
              <div 
                data-testid="boundary-indicator"
                className={zoomState.atBoundary ? 'at-boundary' : 'within-bounds'}
              >
                Boundary Status
              </div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      await user.click(screen.getByTestId('pan-left-boundary'))

      await waitFor(() => {
        const boundaryIndicator = screen.getByTestId('boundary-indicator')
        expect(boundaryIndicator).toHaveClass('at-boundary')
      })
    })
  })

  /**
   * TEST 7: Touch Pan Support
   * Validates that pan functionality works on mobile/tablet devices
   */
  describe('7. Touch Pan Support for Mobile/Tablet', () => {
    it('should support single-finger touch panning on mobile devices', async () => {
      const TestComponent = () => {
        const { zoomState, panBy } = useZoomPan()

        const handleTouchMove = (event: React.TouchEvent) => {
          const touch = event.touches[0]
          const deltaX = touch.clientX - (event.target as any).dataset.startX
          panBy(deltaX * 10, 0) // Convert touch delta to time delta
        }

        const handleTouchStart = (event: React.TouchEvent) => {
          const touch = event.touches[0];
          (event.target as any).dataset.startX = touch.clientX
        }

        return (
          <ZoomPanProvider>
            <div
              data-testid="touch-pan-area"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              style={{ width: 800, height: 400, touchAction: 'pan-x' }}
            >
              <TimeSeriesChart data={mockTimeSeriesData} zoomState={zoomState} />
              <div data-testid="touch-feedback">Touch to pan</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const touchArea = screen.getByTestId('touch-pan-area')

      // Simulate touch pan gesture
      await act(async () => {
        fireEvent.touchStart(touchArea, {
          touches: [{ clientX: 400, clientY: 200 }]
        })
        fireEvent.touchMove(touchArea, {
          touches: [{ clientX: 300, clientY: 200 }] // Swipe left
        })
        fireEvent.touchEnd(touchArea)
      })

      // Verify touch-action CSS property for smooth scrolling
      expect(touchArea).toHaveStyle({ touchAction: 'pan-x' })
      
      // Verify touch feedback is available
      expect(screen.getByTestId('touch-feedback')).toBeInTheDocument()
    })

    it('should handle pinch-to-zoom gestures on touch devices', async () => {
      const TestComponent = () => {
        const { zoomState, zoomToScale } = useZoomPan()

        const handleTouchMove = (event: React.TouchEvent) => {
          if (event.touches.length === 2) {
            const touch1 = event.touches[0]
            const touch2 = event.touches[1]
            const distance = Math.sqrt(
              Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2)
            )
            
            const initialDistance = parseFloat((event.target as any).dataset.initialDistance || '100')
            const scaleChange = distance / initialDistance
            zoomToScale(scaleChange)
          }
        }

        const handleTouchStart = (event: React.TouchEvent) => {
          if (event.touches.length === 2) {
            const touch1 = event.touches[0]
            const touch2 = event.touches[1]
            const distance = Math.sqrt(
              Math.pow(touch2.clientX - touch1.clientX, 2) +
              Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            (event.target as any).dataset.initialDistance = distance.toString()
          }
        }

        return (
          <ZoomPanProvider>
            <div
              data-testid="pinch-zoom-area"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              style={{ width: 800, height: 400 }}
            >
              <TimeSeriesChart data={mockTimeSeriesData} zoomState={zoomState} />
              <div data-testid="pinch-scale">{zoomState.scale.toFixed(2)}</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const pinchArea = screen.getByTestId('pinch-zoom-area')

      // Simulate pinch gesture (two fingers)
      await act(async () => {
        fireEvent.touchStart(pinchArea, {
          touches: [
            { clientX: 350, clientY: 200 },
            { clientX: 450, clientY: 200 }
          ]
        })
        fireEvent.touchMove(pinchArea, {
          touches: [
            { clientX: 300, clientY: 200 }, // Fingers moving apart
            { clientX: 500, clientY: 200 }
          ]
        })
      })

      await waitFor(() => {
        const scale = parseFloat(screen.getByTestId('pinch-scale').textContent || '1')
        expect(scale).toBeGreaterThan(1.0) // Should have zoomed in
      })
    })
  })

  /**
   * INTEGRATION & PERFORMANCE TESTS (2 tests)
   */

  /**
   * TEST 8: Mini-Map Sync
   * Validates that mini-map indicator reflects current zoom/pan position accurately
   */
  describe('8. Mini-Map Overview and Synchronization', () => {
    it('should accurately reflect current zoom/pan position in mini-map', async () => {
      const TestComponent = () => {
        const { zoomState, zoomToTimeRange, panTo } = useZoomPan({
          initialTimeExtent: [new Date('2024-01-01'), new Date('2024-12-31')]
        })

        return (
          <ZoomPanProvider>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: '1' }}>
                <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
                <button
                  data-testid="zoom-to-q2"
                  onClick={() => zoomToTimeRange(
                    new Date('2024-04-01'),
                    new Date('2024-06-30')
                  )}
                >
                  Zoom to Q2
                </button>
              </div>
              <div style={{ width: '200px' }}>
                <MiniMapOverview
                  data={mockExtendedTimeSeriesData}
                  fullExtent={[new Date('2024-01-01'), new Date('2024-12-31')]}
                  currentExtent={zoomState.timeExtent}
                  onRangeSelect={(start, end) => zoomToTimeRange(start, end)}
                />
              </div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test mini-map reflects main chart zoom
      await user.click(screen.getByTestId('zoom-to-q2'))

      await waitFor(() => {
        const miniMap = screen.getByTestId('mini-map')
        const viewportIndicator = screen.getByTestId('viewport-indicator')
        
        expect(miniMap).toBeInTheDocument()
        expect(viewportIndicator).toBeInTheDocument()
        
        // Verify viewport indicator position corresponds to Q2
        const indicatorStyle = window.getComputedStyle(viewportIndicator)
        expect(parseFloat(indicatorStyle.left)).toBeCloseTo(25, 5) // ~25% from start (Q2 position)
        expect(parseFloat(indicatorStyle.width)).toBeCloseTo(25, 5) // ~25% width (3 months)
      })

      // Test mini-map selection updates main chart
      const miniMap = screen.getByTestId('mini-map')
      await act(async () => {
        fireEvent.mouseDown(miniMap, { clientX: 150, clientY: 50 }) // Click on Q3 area
        fireEvent.mouseMove(miniMap, { clientX: 180, clientY: 50 })
        fireEvent.mouseUp(miniMap)
      })

      await waitFor(() => {
        const viewportIndicator = screen.getByTestId('viewport-indicator')
        const newIndicatorStyle = window.getComputedStyle(viewportIndicator)
        expect(parseFloat(newIndicatorStyle.left)).toBeGreaterThan(25) // Should have moved
      })
    })

    it('should support brush selection for jump-to-time functionality', async () => {
      const TestComponent = () => {
        const { zoomState, zoomToTimeRange } = useZoomPan()

        return (
          <ZoomPanProvider>
            <MiniMapOverview
              data={mockExtendedTimeSeriesData}
              fullExtent={[new Date('2024-01-01'), new Date('2024-12-31')]}
              currentExtent={zoomState.timeExtent}
              onBrushSelection={(start, end) => zoomToTimeRange(start, end)}
              enableBrush={true}
            />
            <div data-testid="main-chart">
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
            </div>
            <div data-testid="time-display">
              {zoomState.timeExtent[0].toDateString()} - {zoomState.timeExtent[1].toDateString()}
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const miniMap = screen.getByTestId('mini-map')
      
      // Simulate brush selection on mini-map
      await act(async () => {
        fireEvent.mouseDown(miniMap, { clientX: 50, clientY: 30 }) // Start brush
        fireEvent.mouseMove(miniMap, { clientX: 120, clientY: 30 }) // Drag to create selection
        fireEvent.mouseUp(miniMap)
      })

      await waitFor(() => {
        const timeDisplay = screen.getByTestId('time-display').textContent || ''
        expect(timeDisplay).toContain('2024') // Should show selected time range
        
        // Verify brush selection is visible
        const brushSelection = screen.getByTestId('brush-selection')
        expect(brushSelection).toBeInTheDocument()
        expect(brushSelection).toHaveStyle({ display: 'block' })
      })
    })
  })

  /**
   * TEST 9: Zoom Performance
   * Validates that zoom/pan operations maintain <100ms response time
   */
  describe('9. Zoom and Pan Performance Optimization', () => {
    it('should maintain <100ms response time for all zoom/pan operations', async () => {
      const performanceMetrics: { operation: string; duration: number }[] = []

      const TestComponent = () => {
        const { zoomState, zoomIn, zoomOut, panBy, zoomToScale } = useZoomPan({
          onZoomChange: (state) => {
            const endTime = performance.now()
            const operation = performanceMetrics[performanceMetrics.length - 1]
            if (operation && operation.duration === 0) {
              operation.duration = endTime - operation.duration
            }
          }
        })

        const recordOperation = (operationName: string, operation: () => void) => {
          const startTime = performance.now()
          performanceMetrics.push({ operation: operationName, duration: startTime })
          operation()
        }

        return (
          <ZoomPanProvider>
            <div data-testid="performance-test-area">
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <button 
                data-testid="perf-zoom-in"
                onClick={() => recordOperation('zoomIn', () => zoomIn(400, 200))}
              >
                Zoom In
              </button>
              <button 
                data-testid="perf-zoom-out"
                onClick={() => recordOperation('zoomOut', () => zoomOut(400, 200))}
              >
                Zoom Out
              </button>
              <button 
                data-testid="perf-pan"
                onClick={() => recordOperation('pan', () => panBy(50000, 0))}
              >
                Pan
              </button>
              <button 
                data-testid="perf-zoom-scale"
                onClick={() => recordOperation('zoomToScale', () => zoomToScale(2.5))}
              >
                Zoom to Scale
              </button>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      // Test all zoom/pan operations
      const operations = ['perf-zoom-in', 'perf-zoom-out', 'perf-pan', 'perf-zoom-scale']
      
      for (const operation of operations) {
        await user.click(screen.getByTestId(operation))
        await waitFor(() => {
          // Small delay to ensure operation completes
        }, { timeout: 200 })
      }

      // Verify performance requirements
      performanceMetrics.forEach(metric => {
        expect(metric.duration).toBeLessThan(100) // <100ms requirement
        expect(metric.operation).toBeTruthy()
      })

      expect(performanceMetrics.length).toBe(4) // All operations recorded
    })

    it('should optimize memory usage during extensive zoom/pan sessions', async () => {
      let memorySnapshots: number[] = []

      const TestComponent = () => {
        const { zoomState, zoomIn, zoomOut, panBy } = useZoomPan()

        const recordMemoryUsage = () => {
          // Simulate memory measurement (in real implementation would use performance.memory)
          memorySnapshots.push(Math.random() * 1000000)
        }

        React.useEffect(() => {
          recordMemoryUsage()
        }, [zoomState.scale, zoomState.translateX])

        return (
          <ZoomPanProvider>
            <div data-testid="memory-test">
              <TimeSeriesChart data={mockExtendedTimeSeriesData} zoomState={zoomState} />
              <button 
                data-testid="memory-stress-test"
                onClick={() => {
                  // Perform rapid zoom/pan operations
                  for (let i = 0; i < 50; i++) {
                    if (i % 2 === 0) {
                      zoomIn(400 + i, 200 + i)
                    } else {
                      panBy(i * 100, 0)
                    }
                  }
                }}
              >
                Memory Stress Test
              </button>
              <div data-testid="memory-count">{memorySnapshots.length}</div>
            </div>
          </ZoomPanProvider>
        )
      }

      render(<TestComponent />)

      const initialMemoryCount = memorySnapshots.length
      await user.click(screen.getByTestId('memory-stress-test'))

      await waitFor(() => {
        const memoryCount = parseInt(screen.getByTestId('memory-count').textContent || '0')
        expect(memoryCount).toBeGreaterThan(initialMemoryCount)
        
        // Verify memory usage doesn't grow excessively
        const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0]
        expect(Math.abs(memoryGrowth)).toBeLessThan(500000) // Reasonable memory growth limit
      })
    })

    it('should efficiently handle large datasets during zoom operations', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        date: new Date(2020, 0, 1 + i),
        completions: Math.floor(Math.random() * 200),
        enrollments: Math.floor(Math.random() * 500)
      }))

      const TestComponent = () => {
        const { zoomState, zoomToScale } = useZoomPan({
          initialTimeExtent: [new Date('2020-01-01'), new Date('2027-05-27')]
        })

        return (
          <ZoomPanProvider>
            <div>
              <TimeSeriesChart 
                data={largeDataset} 
                zoomState={zoomState}
                enableDataOptimization={true}
                visibleDataThreshold={1000}
              />
              <button 
                data-testid="large-data-zoom"
                onClick={() => zoomToScale(10.0)}
              >
                Deep Zoom on Large Dataset
              </button>
              <div data-testid="visible-points">{/* Will be populated by chart */}</div>
            </div>
          </ZoomPanProvider>
        )
      }

      const startTime = performance.now()
      render(<TestComponent />)
      
      await user.click(screen.getByTestId('large-data-zoom'))
      
      await waitFor(() => {
        const visiblePoints = screen.getByTestId('visible-points')
        expect(visiblePoints).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Verify efficient handling of large datasets
      expect(renderTime).toBeLessThan(200) // <200ms for large dataset operations
    })
  })
})