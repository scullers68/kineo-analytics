/**
 * useExport Hook - Chart Export Functionality - Task-0025
 * 
 * Custom hook for chart export functionality providing easy access
 * to export methods, progress tracking, and error handling.
 */

import { useState, useCallback, useRef } from 'react'
import { FormatHandlers } from '../utils/export/FormatHandlers'
import { BrandingEngine } from '../utils/export/BrandingEngine'
import type {
  UseExportOptions,
  UseExportReturn,
  ExportConfig,
  ExportResult,
  ChartExportInfo,
  BatchExportConfig
} from '../types/export'

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const {
    defaultFormat = 'png',
    defaultQuality = 'standard',
    customerBranding
  } = options

  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortController = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    setIsExporting(false)
    setProgress(0)
    setError(null)
    if (abortController.current) {
      abortController.current.abort()
      abortController.current = null
    }
  }, [])

  const exportChart = useCallback(async (
    chartId: string,
    options: Partial<ExportConfig> = {}
  ): Promise<ExportResult> => {
    try {
      setIsExporting(true)
      setProgress(0)
      setError(null)
      
      // Create abort controller for cancellation
      abortController.current = new AbortController()

      // Build export configuration with defaults
      const config: ExportConfig = {
        format: options.format || defaultFormat,
        quality: options.quality || defaultQuality,
        dimensions: options.dimensions || { width: 800, height: 600, dpi: 300 },
        branding: options.branding || customerBranding,
        filename: options.filename || `${chartId}-export.${options.format || defaultFormat}`
      }

      setProgress(10)

      // Find chart element
      const chartElement = document.querySelector(
        `[data-testid="${chartId}"], #${chartId}, .${chartId}`
      )
      
      if (!chartElement) {
        throw new Error(`Chart element not found: ${chartId}`)
      }

      setProgress(25)

      // Start performance monitoring
      const monitoringId = FormatHandlers.startPerformanceMonitoring({
        chartId,
        format: config.format,
        expectedDuration: 2000
      })

      setProgress(40)

      // Apply branding if specified
      if (config.branding) {
        BrandingEngine.applyColorScheme({
          colors: config.branding.colors,
          chartElement,
          applyToBackground: true,
          applyToDataSeries: true,
          preserveAccessibility: true
        })

        BrandingEngine.applyTypography(chartElement, config.branding.typography)
      }

      setProgress(60)

      // Generate export based on format
      let blob: Blob

      switch (config.format) {
        case 'png':
          blob = await FormatHandlers.generatePNG({
            chartElement,
            width: config.dimensions.width,
            height: config.dimensions.height,
            quality: config.quality,
            dpi: config.dimensions.dpi || 300,
            format: 'png',
            config,
            branding: config.branding
          })
          break

        case 'svg':
          blob = await FormatHandlers.generateSVG({
            chartElement,
            preserveInteractivity: true,
            embedFonts: true,
            optimizeOutput: true,
            config,
            branding: config.branding
          })
          break

        case 'pdf':
          blob = await FormatHandlers.generatePDF({
            charts: [{
              element: chartElement,
              title: chartId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }],
            layout: 'landscape',
            pageSize: 'A4',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            metadata: {
              title: `${chartId} Chart Export`,
              creator: 'Kineo Analytics Platform'
            },
            chartElement,
            config,
            branding: config.branding
          })
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
        filename: config.filename,
        url,
        performance
      }

      // Auto-download the file
      FormatHandlers.downloadBlob(blob, config.filename!)

      setIsExporting(false)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed'
      setError(errorMessage)
      setIsExporting(false)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [defaultFormat, defaultQuality, customerBranding])

  const exportBatch = useCallback(async (
    charts: ChartExportInfo[],
    options: Partial<BatchExportConfig> = {}
  ): Promise<ExportResult> => {
    try {
      setIsExporting(true)
      setProgress(0)
      setError(null)

      const config: BatchExportConfig = {
        charts,
        format: options.format || defaultFormat,
        layout: options.layout || 'multi-page',
        consolidate: options.consolidate ?? true
      }

      setProgress(20)

      // Collect chart elements
      const chartElements: Array<{ element: Element; title: string }> = []
      
      for (const chart of charts) {
        const chartElement = document.querySelector(
          `[data-testid="${chart.id}"], #${chart.id}, .${chart.id}`
        )
        
        if (chartElement) {
          chartElements.push({
            element: chartElement,
            title: chart.title
          })
        }
      }

      if (chartElements.length === 0) {
        throw new Error('No chart elements found for batch export')
      }

      setProgress(50)

      // Generate batch export
      let blob: Blob
      let filename: string

      if (config.format === 'pdf' && config.consolidate) {
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
          branding: customerBranding
        })
        filename = `batch-charts-${Date.now()}.pdf`
      } else {
        // For non-PDF or non-consolidated exports, export first chart as example
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
          branding: customerBranding
        })
        filename = `batch-export-${Date.now()}.png`
      }

      setProgress(90)

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

      setIsExporting(false)
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch export failed'
      setError(errorMessage)
      setIsExporting(false)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [defaultFormat, customerBranding])

  return {
    exportChart,
    exportBatch,
    isExporting,
    progress,
    error,
    reset
  }
}