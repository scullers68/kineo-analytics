/**
 * Export Provider - React Context for Chart Export System - Task-0025
 * 
 * Provides export functionality and customer branding configuration
 * throughout the application with performance monitoring and error handling.
 */

'use client'

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { FormatHandlers } from '../../utils/export/FormatHandlers'
import { BrandingEngine } from '../../utils/export/BrandingEngine'
import type {
  ExportContextValue,
  ExportContextState,
  ExportConfig,
  ExportResult,
  BatchExportConfig,
  ChartExportInfo,
  CustomerBranding
} from '../../types/export'

// Export Context State Management
type ExportAction =
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_CURRENT_CHART'; payload: string | undefined }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }

const initialState: ExportContextState = {
  isExporting: false,
  progress: 0,
  currentChart: undefined,
  error: null
}

function exportReducer(state: ExportContextState, action: ExportAction): ExportContextState {
  switch (action.type) {
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload }
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }
    case 'SET_CURRENT_CHART':
      return { ...state, currentChart: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isExporting: false }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

const ExportContext = createContext<ExportContextValue | undefined>(undefined)

interface ExportProviderProps {
  children: ReactNode
  defaultBranding?: CustomerBranding
}

export function ExportProvider({ children, defaultBranding }: ExportProviderProps) {
  const [state, dispatch] = useReducer(exportReducer, initialState)

  // Action creators
  const setProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Main export function for single charts
  const exportChart = useCallback(async (
    chartId: string,
    config: ExportConfig
  ): Promise<ExportResult> => {
    try {
      dispatch({ type: 'SET_EXPORTING', payload: true })
      dispatch({ type: 'SET_CURRENT_CHART', payload: chartId })
      dispatch({ type: 'SET_PROGRESS', payload: 0 })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Find chart element
      const chartElement = document.querySelector(`[data-testid="${chartId}"], #${chartId}, .${chartId}`)
      if (!chartElement) {
        throw new Error(`Chart element not found: ${chartId}`)
      }

      setProgress(20)

      // Start performance monitoring
      const monitoringId = FormatHandlers.startPerformanceMonitoring({
        chartId,
        format: config.format,
        expectedDuration: 2000
      })

      setProgress(40)

      // Apply branding if specified
      let brandedElement = chartElement
      if (config.branding || defaultBranding) {
        const branding = config.branding || defaultBranding!
        
        // Apply color scheme
        BrandingEngine.applyColorScheme({
          colors: branding.colors,
          chartElement,
          applyToBackground: true,
          applyToDataSeries: true,
          preserveAccessibility: true
        })

        // Apply typography
        BrandingEngine.applyTypography(chartElement, branding.typography)

        setProgress(60)
      }

      let blob: Blob
      let filename: string

      // Generate export based on format
      switch (config.format) {
        case 'png':
          blob = await FormatHandlers.generatePNG({
            chartElement: brandedElement,
            width: config.dimensions.width,
            height: config.dimensions.height,
            quality: config.quality,
            dpi: config.dimensions.dpi || 300,
            format: 'png',
            config,
            branding: config.branding || defaultBranding
          })
          filename = config.filename || `${chartId}-chart.png`
          break

        case 'svg':
          blob = await FormatHandlers.generateSVG({
            chartElement: brandedElement,
            preserveInteractivity: true,
            embedFonts: true,
            optimizeOutput: true,
            config,
            branding: config.branding || defaultBranding
          })
          filename = config.filename || `${chartId}-chart.svg`
          break

        case 'pdf':
          blob = await FormatHandlers.generatePDF({
            charts: [{
              element: brandedElement,
              title: chartId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }],
            layout: 'landscape',
            pageSize: 'A4',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            metadata: {
              title: `${chartId} Chart Export`,
              creator: 'Kineo Analytics Platform'
            },
            chartElement: brandedElement,
            config,
            branding: config.branding || defaultBranding
          })
          filename = config.filename || `${chartId}-chart.pdf`
          break

        default:
          throw new Error(`Unsupported export format: ${config.format}`)
      }

      setProgress(80)

      // Get performance metrics
      const performance = FormatHandlers.getPerformanceMetrics(monitoringId)

      setProgress(90)

      // Create download URL
      const url = URL.createObjectURL(blob)

      setProgress(100)

      const result: ExportResult = {
        success: true,
        blob,
        filename,
        url,
        performance
      }

      // Auto-download the file
      FormatHandlers.downloadBlob(blob, filename)

      dispatch({ type: 'SET_EXPORTING', payload: false })
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [defaultBranding, setProgress, setError])

  // Batch export function for multiple charts
  const exportBatch = useCallback(async (
    config: BatchExportConfig
  ): Promise<ExportResult> => {
    try {
      dispatch({ type: 'SET_EXPORTING', payload: true })
      dispatch({ type: 'SET_PROGRESS', payload: 0 })
      dispatch({ type: 'SET_ERROR', payload: null })

      const { charts, format } = config
      const progressStep = 80 / charts.length

      // Collect chart elements
      const chartElements: Array<{ element: Element; title: string }> = []

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i]
        dispatch({ type: 'SET_CURRENT_CHART', payload: chart.id })

        const chartElement = document.querySelector(
          `[data-testid="${chart.id}"], #${chart.id}, .${chart.id}`
        )

        if (!chartElement) {
          console.warn(`Chart element not found: ${chart.id}`)
          continue
        }

        chartElements.push({
          element: chartElement,
          title: chart.title
        })

        setProgress((i + 1) * progressStep)
      }

      if (chartElements.length === 0) {
        throw new Error('No chart elements found for batch export')
      }

      setProgress(85)

      let blob: Blob
      let filename: string

      if (format === 'pdf' && config.consolidate) {
        // Generate consolidated PDF with all charts
        blob = await FormatHandlers.generatePDF({
          charts: chartElements,
          layout: 'portrait',
          pageSize: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          metadata: {
            title: 'Batch Chart Export',
            creator: 'Kineo Analytics Platform'
          },
          chartElement: chartElements[0].element,
          config: {
            format: 'pdf',
            dimensions: { width: 800, height: 600 },
            quality: 'standard'
          },
          branding: defaultBranding
        })
        filename = `batch-charts-${Date.now()}.pdf`
      } else {
        // For non-PDF or non-consolidated exports, export first chart as example
        // In a full implementation, this would create a ZIP file or similar
        const firstChart = chartElements[0]
        blob = await FormatHandlers.generatePNG({
          chartElement: firstChart.element,
          width: 800,
          height: 600,
          quality: 'standard',
          dpi: 300,
          format: 'png',
          config: {
            format: 'png',
            dimensions: { width: 800, height: 600 },
            quality: 'standard'
          },
          branding: defaultBranding
        })
        filename = `batch-export-${Date.now()}.png`
      }

      setProgress(95)

      const url = URL.createObjectURL(blob)
      
      setProgress(100)

      const result: ExportResult = {
        success: true,
        blob,
        filename,
        url
      }

      // Auto-download the file
      FormatHandlers.downloadBlob(blob, filename)

      dispatch({ type: 'SET_EXPORTING', payload: false })
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch export failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [defaultBranding, setProgress, setError])

  const contextValue: ExportContextValue = {
    ...state,
    exportChart,
    exportBatch,
    setProgress,
    setError,
    reset
  }

  return (
    <ExportContext.Provider value={contextValue}>
      {children}
    </ExportContext.Provider>
  )
}

// Custom hook to use export context
export function useExport(): ExportContextValue {
  const context = useContext(ExportContext)
  if (!context) {
    throw new Error('useExport must be used within an ExportProvider')
  }
  return context
}

// Export the context for testing
export { ExportContext }