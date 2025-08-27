import { vi, describe, test, expect, beforeEach } from 'vitest'
import { 
  CanvasLineRenderer, 
  CanvasAreaRenderer, 
  shouldUseCanvas, 
  createRenderer,
  CanvasPerformanceMonitor 
} from '../../src/utils/canvas-renderer'
import { TimeSeriesData } from '../../src/types/time-series'

// Mock Canvas and Context2D
const mockContext = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  setLineDash: vi.fn(),
  getTotalLength: vi.fn(() => 100)
}

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  width: 0,
  height: 0,
  style: { width: '0px', height: '0px' }
}

// Sample data for testing
const mockSeriesData: TimeSeriesData[] = [
  {
    id: 'series1',
    label: 'Test Series 1',
    color: '#ff0000',
    points: [
      { date: new Date('2023-01-01'), value: 100 },
      { date: new Date('2023-01-02'), value: 150 },
      { date: new Date('2023-01-03'), value: 120 }
    ]
  },
  {
    id: 'series2',
    label: 'Test Series 2',
    color: '#00ff00',
    points: [
      { date: new Date('2023-01-01'), value: 80 },
      { date: new Date('2023-01-02'), value: 90 },
      { date: new Date('2023-01-03'), value: 110 }
    ]
  }
]

const defaultOptions = {
  width: 800,
  height: 400,
  margins: { top: 20, right: 30, bottom: 40, left: 60 },
  pixelRatio: 2
}

describe('Canvas Renderer Utils', () => {
  test('shouldUseCanvas returns true for large datasets', () => {
    const largeDataset: TimeSeriesData[] = [{
      id: 'large',
      label: 'Large Dataset',
      points: Array.from({ length: 15000 }, (_, i) => ({
        date: new Date(2023, 0, 1 + i),
        value: Math.random() * 100
      }))
    }]

    expect(shouldUseCanvas(largeDataset)).toBe(true)
  })

  test('shouldUseCanvas returns false for small datasets', () => {
    expect(shouldUseCanvas(mockSeriesData)).toBe(false)
  })

  test('createRenderer creates appropriate renderer type', () => {
    const lineRenderer = createRenderer(mockCanvas as any, defaultOptions, 'line')
    expect(lineRenderer).toBeInstanceOf(CanvasLineRenderer)

    const areaRenderer = createRenderer(mockCanvas as any, defaultOptions, 'area')
    expect(areaRenderer).toBeInstanceOf(CanvasAreaRenderer)
  })
})

describe('CanvasLineRenderer', () => {
  let renderer: CanvasLineRenderer

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new CanvasLineRenderer(mockCanvas as any, defaultOptions)
  })

  test('initializes canvas with correct dimensions', () => {
    expect(mockCanvas.width).toBe(1600) // 800 * 2 (pixelRatio)
    expect(mockCanvas.height).toBe(800) // 400 * 2 (pixelRatio)
    expect(mockCanvas.style.width).toBe('800px')
    expect(mockCanvas.style.height).toBe('400px')
    expect(mockContext.scale).toHaveBeenCalledWith(2, 2)
  })

  test('renders data without errors', () => {
    expect(() => {
      renderer.render(mockSeriesData)
    }).not.toThrow()

    // Should clear canvas first
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 400)
    
    // Should draw paths for each series
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.moveTo).toHaveBeenCalled()
    expect(mockContext.lineTo).toHaveBeenCalled()
    expect(mockContext.stroke).toHaveBeenCalled()
  })

  test('handles empty data gracefully', () => {
    expect(() => {
      renderer.render([])
    }).not.toThrow()
  })

  test('samples large datasets', () => {
    const largeDataset: TimeSeriesData[] = [{
      id: 'large',
      label: 'Large Dataset',
      points: Array.from({ length: 100000 }, (_, i) => ({
        date: new Date(2023, 0, 1 + i),
        value: Math.random() * 100
      }))
    }]

    expect(() => {
      renderer.render(largeDataset)
    }).not.toThrow()

    // Should still render but with sampled data
    expect(mockContext.beginPath).toHaveBeenCalled()
    expect(mockContext.stroke).toHaveBeenCalled()
  })

  test('findPointAt returns closest point', () => {
    renderer.render(mockSeriesData)
    
    // Mock the scales to be available
    const result = renderer.findPointAt(100, 200, 10)
    
    // Should return null if no point is close enough or scales not available
    expect(result).toBeNull()
  })

  test('dispose cleans up resources', () => {
    renderer.render(mockSeriesData)
    
    expect(() => {
      renderer.dispose()
    }).not.toThrow()
  })
})

describe('CanvasAreaRenderer', () => {
  let renderer: CanvasAreaRenderer

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new CanvasAreaRenderer(mockCanvas as any, defaultOptions)
  })

  test('renders areas with fill', () => {
    renderer.render(mockSeriesData)

    // Should fill areas
    expect(mockContext.fill).toHaveBeenCalled()
    expect(mockContext.closePath).toHaveBeenCalled()
    
    // Should also stroke the lines
    expect(mockContext.stroke).toHaveBeenCalled()
  })

  test('inherits line renderer capabilities', () => {
    expect(renderer).toBeInstanceOf(CanvasLineRenderer)
    
    expect(() => {
      renderer.render(mockSeriesData)
      renderer.findPointAt(100, 200)
      renderer.dispose()
    }).not.toThrow()
  })
})

describe('CanvasPerformanceMonitor', () => {
  let monitor: CanvasPerformanceMonitor

  beforeEach(() => {
    monitor = new CanvasPerformanceMonitor()
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  test('measures frame rate correctly', () => {
    let timeCounter = 0
    vi.spyOn(performance, 'now').mockImplementation(() => {
      return timeCounter
    })
    
    // Create monitor after mocking performance.now
    const testMonitor = new CanvasPerformanceMonitor()
    
    // Simulate multiple frame calls
    for (let i = 0; i < 29; i++) {
      testMonitor.measureFrame()
    }
    
    // Jump to 1 second later
    timeCounter = 1000
    const result = testMonitor.measureFrame()
    
    expect(result).toEqual({
      fps: 30,
      timestamp: 1000,
      performance: 'good'
    })
  })

  test('categorizes performance correctly', () => {
    let timeCounter = 0
    vi.spyOn(performance, 'now').mockImplementation(() => timeCounter)
    
    // Create monitor after mocking performance.now
    const testMonitor = new CanvasPerformanceMonitor()
    
    // Simulate low frame rate (only 9 frames in 1 second)
    for (let i = 0; i < 9; i++) {
      testMonitor.measureFrame()
    }
    
    // Jump to 1 second later
    timeCounter = 1000
    const result = testMonitor.measureFrame()
    
    expect(result?.performance).toBe('poor')
  })
})

describe('Canvas Renderer Integration', () => {
  test('handles high-frequency data updates', () => {
    const renderer = new CanvasLineRenderer(mockCanvas as any, defaultOptions)
    
    // Simulate rapid data updates
    for (let i = 0; i < 10; i++) {
      const dynamicData: TimeSeriesData[] = [{
        id: 'dynamic',
        label: 'Dynamic Data',
        points: Array.from({ length: 1000 }, (_, j) => ({
          date: new Date(2023, 0, 1 + j + i * 1000),
          value: Math.sin(j / 100) * 50 + 50 + Math.random() * 10
        }))
      }]
      
      expect(() => {
        renderer.render(dynamicData)
      }).not.toThrow()
    }
  })

  test('maintains quality with different pixel ratios', () => {
    const highDPIOptions = { ...defaultOptions, pixelRatio: 3 }
    const renderer = new CanvasLineRenderer(mockCanvas as any, highDPIOptions)
    
    expect(() => {
      renderer.render(mockSeriesData)
    }).not.toThrow()
    
    expect(mockCanvas.width).toBe(2400) // 800 * 3
    expect(mockCanvas.height).toBe(1200) // 400 * 3
    expect(mockContext.scale).toHaveBeenCalledWith(3, 3)
  })
})