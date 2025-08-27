/**
 * Export Types for Chart Export System - Task-0025
 * 
 * Comprehensive type definitions for multi-format chart export functionality
 * supporting PNG, SVG, and PDF formats with customer branding.
 */

// Export Format Types
export type ExportFormat = 'png' | 'svg' | 'pdf'

export type ExportQuality = 'standard' | 'high' | 'print'

export interface ExportDimensions {
  width: number
  height: number
  dpi?: number // For PNG exports
}

// Customer Branding Types
export interface CustomerBranding {
  customerId: string
  logo?: string // Base64 or URL
  colors: {
    primary: string
    secondary: string
    background: string
  }
  typography: {
    fontFamily: string
    fontSize: number
  }
  watermark?: boolean
}

export interface LogoBranding {
  includeLogo: boolean
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  logoSize: { width: number; height: number }
  opacity?: number
}

export interface ColorBranding {
  applyColorScheme: boolean
  overrideChartColors: boolean
  preserveAccessibility?: boolean
}

// Export Configuration Types
export interface ExportConfig {
  format: ExportFormat
  dimensions: ExportDimensions
  quality: ExportQuality
  branding?: CustomerBranding
  filename?: string
}

export interface PNGExportOptions extends ExportConfig {
  format: 'png'
  dpi: 72 | 150 | 300
  backgroundColor?: string
  useCORS?: boolean
}

export interface SVGExportOptions extends ExportConfig {
  format: 'svg'
  preserveInteractivity?: boolean
  embedFonts?: boolean
  optimizeOutput?: boolean
}

export interface PDFExportOptions extends ExportConfig {
  format: 'pdf'
  layout: 'portrait' | 'landscape'
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  includeMetadata?: boolean
}

// Batch Export Types
export interface ChartExportInfo {
  id: string
  type: string
  element: Element | null
  title: string
  data: any[]
}

export interface BatchExportConfig {
  charts: ChartExportInfo[]
  format: ExportFormat
  layout: 'single-page' | 'multi-page' | 'grid'
  consolidate: boolean
}

// Performance Types
export interface ExportPerformanceConfig {
  measurePerformance: boolean
  expectedDuration: number // milliseconds
  memoryLimit?: number // MB
}

export interface ExportPerformanceMetrics {
  duration: number
  withinBudget: boolean
  memoryUsage: number
  timestamp: number
}

// Quality Validation Types
export interface QualityValidationConfig {
  validateOutput: boolean
  qualityThreshold: number // 0-1 scale
  compareMetrics: ('dimensions' | 'colors' | 'text' | 'shapes')[]
}

export interface FidelityScore {
  score: number // 0-1 scale
  passed: boolean
  details: {
    dimensions: number
    colors: number
    text: number
    shapes: number
  }
}

// Export Result Types
export interface ExportResult {
  success: boolean
  blob?: Blob
  filename?: string
  url?: string
  error?: string
  performance?: ExportPerformanceMetrics
  fidelityScore?: FidelityScore
}

// Export Context Types
export interface ExportContextState {
  isExporting: boolean
  progress: number
  currentChart?: string
  error?: string
}

export interface ExportContextActions {
  exportChart: (chartId: string, config: ExportConfig) => Promise<ExportResult>
  exportBatch: (config: BatchExportConfig) => Promise<ExportResult>
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type ExportContextValue = ExportContextState & ExportContextActions

// Component Props Types
export interface ExportDialogProps {
  chartId: string
  format?: ExportFormat
  quality?: ExportQuality
  dimensions?: ExportDimensions
  branding?: Partial<LogoBranding & ColorBranding>
  onExport?: (result: ExportResult) => void
  onClose?: () => void
  isOpen?: boolean
  measurePerformance?: boolean
  validateOutput?: boolean
  preserveInteractivity?: boolean
  embedFonts?: boolean
  layout?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal'
  includeMetadata?: boolean
}

export interface BatchExporterProps {
  charts: ChartExportInfo[]
  format: ExportFormat
  layout: 'single-page' | 'multi-page' | 'grid'
  onExport?: (result: ExportResult) => void
  className?: string
}

// Format Handler Types
export interface FormatHandlerConfig {
  chartElement: Element
  config: ExportConfig
  branding?: CustomerBranding
}

export interface PNGHandlerConfig extends FormatHandlerConfig {
  width: number
  height: number
  quality: ExportQuality
  dpi: number
  format: 'png'
}

export interface SVGHandlerConfig extends FormatHandlerConfig {
  preserveInteractivity: boolean
  embedFonts: boolean
  optimizeOutput: boolean
}

export interface PDFHandlerConfig extends FormatHandlerConfig {
  charts: {
    element: Element
    title: string
  }[]
  layout: 'portrait' | 'landscape'
  pageSize: string
  margins: object
  metadata: {
    title: string
    creator: string
  }
}

// Branding Engine Types
export interface LogoApplicationConfig {
  logoData: string
  position: string
  size: { width: number; height: number }
  chartDimensions: { width: number; height: number }
  opacity: number
}

export interface ColorSchemeApplicationConfig {
  colors: CustomerBranding['colors']
  chartElement: Element
  applyToBackground: boolean
  applyToDataSeries: boolean
  preserveAccessibility: boolean
}

export interface ColorContrastValidation {
  primaryColor: string
  backgroundColor: string
  minimumRatio: number
}

// Hook Types
export interface UseExportOptions {
  defaultFormat?: ExportFormat
  defaultQuality?: ExportQuality
  customerBranding?: CustomerBranding
}

export interface UseExportReturn {
  exportChart: (chartId: string, options?: Partial<ExportConfig>) => Promise<ExportResult>
  exportBatch: (charts: ChartExportInfo[], options?: Partial<BatchExportConfig>) => Promise<ExportResult>
  isExporting: boolean
  progress: number
  error: string | null
  reset: () => void
}