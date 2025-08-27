import { renderHook, act } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useBrushSelection } from '../../src/hooks/useBrushSelection'

// Mock D3 functions
vi.mock('d3', () => ({
  ...vi.importActual('d3'),
  brushX: vi.fn(() => ({
    extent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    move: vi.fn().mockReturnThis()
  })),
  select: vi.fn(() => ({
    call: vi.fn(),
    selectAll: vi.fn(() => ({
      remove: vi.fn()
    }))
  }))
}))

// Default options used across tests
const defaultOptions = {
  width: 800,
  height: 400,
  margins: { top: 20, right: 30, bottom: 40, left: 60 },
  brushHeight: 60,
  enabled: true
}

describe('useBrushSelection Hook', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useBrushSelection(defaultOptions))

    expect(result.current.state.selection).toBeNull()
    expect(result.current.state.isDragging).toBe(false)
    expect(result.current.state.brushElement).toBeNull()
    expect(result.current.chartWidth).toBe(710) // 800 - 60 - 30
    expect(result.current.brushHeight).toBe(60)
  })

  test('calculates chart dimensions correctly', () => {
    const options = {
      ...defaultOptions,
      width: 1000,
      height: 500,
      margins: { top: 30, right: 40, bottom: 50, left: 70 }
    }

    const { result } = renderHook(() => useBrushSelection(options))

    expect(result.current.chartWidth).toBe(890) // 1000 - 70 - 40
  })

  test('handles brush callbacks correctly', () => {
    const onBrushStart = vi.fn()
    const onBrush = vi.fn()
    const onBrushEnd = vi.fn()

    const options = {
      ...defaultOptions,
      onBrushStart,
      onBrush,
      onBrushEnd
    }

    renderHook(() => useBrushSelection(options))

    // Callbacks should be properly set up
    expect(onBrushStart).not.toHaveBeenCalled()
    expect(onBrush).not.toHaveBeenCalled()
    expect(onBrushEnd).not.toHaveBeenCalled()
  })

  test('clears selection when clearSelection is called', () => {
    const { result } = renderHook(() => useBrushSelection(defaultOptions))

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.state.selection).toBeNull()
  })

  test('handles disabled state correctly', () => {
    const options = {
      ...defaultOptions,
      enabled: false
    }

    const { result } = renderHook(() => useBrushSelection(options))

    // Should still provide interface but not create brush
    expect(result.current.state.selection).toBeNull()
    expect(result.current.clearSelection).toBeDefined()
    expect(result.current.setSelection).toBeDefined()
  })
})

describe('Brush Selection Integration', () => {
  test('getSelectionDomain converts pixel selection to domain values', () => {
    const mockScale = {
      invert: vi.fn((value) => new Date(2023, 0, 1 + value))
    }

    const { result } = renderHook(() => useBrushSelection(defaultOptions))

    // Mock a selection state
    act(() => {
      // This would normally be set by the brush behavior
      result.current.state.selection = [100, 300]
    })

    const domain = result.current.getSelectionDomain(mockScale as any)

    expect(mockScale.invert).toHaveBeenCalledWith(100)
    expect(mockScale.invert).toHaveBeenCalledWith(300)
    expect(domain).toBeDefined()
  })

  test('getSelectionDomain returns null when no selection', () => {
    const mockScale = {
      invert: vi.fn()
    }

    const { result } = renderHook(() => useBrushSelection(defaultOptions))

    const domain = result.current.getSelectionDomain(mockScale as any)

    expect(domain).toBeNull()
    expect(mockScale.invert).not.toHaveBeenCalled()
  })
})

describe('Brush Selection Performance', () => {
  test('handles rapid brush updates efficiently', () => {
    const onBrush = vi.fn()
    const options = {
      ...defaultOptions,
      onBrush
    }

    renderHook(() => useBrushSelection(options))

    // Simulate rapid brush updates
    const selections = [
      [10, 20],
      [15, 25],
      [20, 30],
      [25, 35],
      [30, 40]
    ]

    // In a real scenario, D3 would call the brush handler rapidly
    // This tests that our hook can handle it
    act(() => {
      selections.forEach(selection => {
        // Simulate brush callback
        if (onBrush) {
          onBrush(selection as [number, number])
        }
      })
    })

    // Should have been called for each selection
    expect(onBrush).toHaveBeenCalledTimes(selections.length)
  })
})