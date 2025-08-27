/**
 * Basic Export Functionality Test - Task-0025 Validation
 * 
 * Simplified test to validate core export components work without hanging
 * Focus on integration and basic functionality rather than comprehensive testing
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock external dependencies first
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toBlob: vi.fn((callback) => {
      const mockBlob = new Blob(['mock-png-data'], { type: 'image/png' })
      callback(mockBlob)
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata')
  })
}))

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['mock-pdf'], { type: 'application/pdf' })),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297)
      }
    },
    setProperties: vi.fn()
  }))
}))

vi.mock('../../src/stores/customer-store', () => ({
  useCustomerStore: vi.fn(() => ({
    currentCustomer: null,
    setCurrentCustomer: vi.fn()
  }))
}))

// Mock URL.createObjectURL and navigation
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock HTMLAnchorElement click to prevent navigation errors
HTMLAnchorElement.prototype.click = vi.fn()
Object.defineProperty(HTMLAnchorElement.prototype, 'download', {
  writable: true,
  value: ''
})
Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
  writable: true,
  value: ''
})

// Mock Performance API
;(global as any).performance.mark = vi.fn()
;(global as any).performance.measure = vi.fn(() => ({ duration: 1000 }))
;(global as any).performance.getEntriesByName = vi.fn(() => [{ duration: 1000 }])

// Import components after mocks
import { ExportProvider } from '../../src/components/export/ExportProvider'
import { ExportDialog } from '../../src/components/export/ExportDialog'
import { FormatHandlers } from '../../src/utils/export/FormatHandlers'
import { CustomerContext } from '../../src/contexts/CustomerContext'

// Mock customer context value
const mockCustomerContext = {
  customer: null,
  setCustomer: vi.fn(),
  branding: {
    customerId: 'customer_001',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+',
    colors: {
      primary: '#0066CC',
      secondary: '#FF6B35',
      background: '#FFFFFF'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 14
    },
    watermark: false
  }
}

// Mock chart component for testing
const MockChart = ({ chartId }: { chartId: string }) => (
  <div data-testid={chartId} className="mock-chart" style={{ width: '800px', height: '600px' }}>
    <svg width="800" height="600">
      <rect x="10" y="10" width="100" height="50" fill="#0066CC" />
      <text x="60" y="35" textAnchor="middle">Mock Chart</text>
    </svg>
  </div>
)

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CustomerContext.Provider value={mockCustomerContext}>
    <ExportProvider>
      {children}
    </ExportProvider>
  </CustomerContext.Provider>
)

describe('Basic Export System Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('1. Export components render without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <MockChart chartId="test-chart" />
        <ExportDialog 
          chartId="test-chart"
          isOpen={true}
          onClose={vi.fn()}
        />
      </TestWrapper>
    )
    
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Export Chart')).toBeInTheDocument()
  })

  test('2. Format selection works', async () => {
    render(
      <TestWrapper>
        <MockChart chartId="format-test-chart" />
        <ExportDialog 
          chartId="format-test-chart"
          isOpen={true}
          onClose={vi.fn()}
        />
      </TestWrapper>
    )

    // Check format buttons are present by finding them more specifically
    const formatButtons = screen.getAllByRole('button')
    const pngButton = formatButtons.find(btn => btn.textContent?.includes('PNG'))
    const svgButton = formatButtons.find(btn => btn.textContent?.includes('SVG'))
    const pdfButton = formatButtons.find(btn => btn.textContent?.includes('PDF'))
    
    expect(pngButton).toBeInTheDocument()
    expect(svgButton).toBeInTheDocument()
    expect(pdfButton).toBeInTheDocument()

    // Test format selection
    if (svgButton) {
      fireEvent.click(svgButton)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export as svg/i })).toBeInTheDocument()
      })
    }
  })

  test('3. Export functionality executes without errors', async () => {
    const onExport = vi.fn()
    
    render(
      <TestWrapper>
        <MockChart chartId="export-test-chart" />
        <ExportDialog 
          chartId="export-test-chart"
          isOpen={true}
          onClose={vi.fn()}
          onExport={onExport}
        />
      </TestWrapper>
    )

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export as png/i })
    fireEvent.click(exportButton)

    // Wait for export to complete
    await waitFor(() => {
      expect(onExport).toHaveBeenCalled()
    }, { timeout: 5000 })
  })

  test('4. FormatHandlers can generate PNG', async () => {
    // Create a mock element
    const mockElement = document.createElement('div')
    mockElement.innerHTML = '<svg><rect width="100" height="50" fill="red" /></svg>'
    
    const result = await FormatHandlers.generatePNG({
      chartElement: mockElement,
      width: 800,
      height: 600,
      quality: 'standard',
      dpi: 300,
      format: 'png',
      config: {
        format: 'png',
        dimensions: { width: 800, height: 600 },
        quality: 'standard'
      }
    })

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/png')
  })

  test('5. Performance monitoring works', () => {
    const monitoringId = FormatHandlers.startPerformanceMonitoring({
      chartId: 'perf-test',
      format: 'png', 
      expectedDuration: 2000
    })

    expect(monitoringId).toContain('perf-test-png')
    expect(performance.mark).toHaveBeenCalled()
    
    const metrics = FormatHandlers.getPerformanceMetrics(monitoringId)
    expect(metrics).toHaveProperty('duration')
    expect(metrics).toHaveProperty('withinBudget')
  })

  test('6. Dimensions can be configured', () => {
    render(
      <TestWrapper>
        <MockChart chartId="dimensions-test" />
        <ExportDialog 
          chartId="dimensions-test"
          isOpen={true}
          dimensions={{ width: 1200, height: 800 }}
          onClose={vi.fn()}
        />
      </TestWrapper>
    )

    const widthInput = screen.getByDisplayValue('1200')
    const heightInput = screen.getByDisplayValue('800')
    
    expect(widthInput).toBeInTheDocument()
    expect(heightInput).toBeInTheDocument()
  })

  test('7. Branding options are configurable', () => {
    render(
      <TestWrapper>
        <MockChart chartId="branding-test" />
        <ExportDialog 
          chartId="branding-test"
          isOpen={true}
          onClose={vi.fn()}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Include logo')).toBeInTheDocument()
    expect(screen.getByText('Apply brand colors')).toBeInTheDocument()
  })

  test('8. Export process shows progress', async () => {
    render(
      <TestWrapper>
        <MockChart chartId="progress-test" />
        <ExportDialog 
          chartId="progress-test"
          isOpen={true}
          onClose={vi.fn()}
        />
      </TestWrapper>
    )

    const exportButton = screen.getByRole('button', { name: /export as png/i })
    fireEvent.click(exportButton)

    // Should show progress during export
    await waitFor(() => {
      expect(screen.getByText(/exporting/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
