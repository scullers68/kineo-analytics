/**
 * Export Dialog - Modal Interface for Chart Export System - Task-0025
 * 
 * Modal component providing format selection, quality options, branding controls,
 * and export progress feedback with comprehensive user experience.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { X, Download, Settings, Palette, Image, FileText, Layout } from 'lucide-react'
import { useExport } from './ExportProvider'
import type {
  ExportDialogProps,
  ExportFormat,
  ExportQuality,
  ExportDimensions,
  ExportConfig
} from '../../types/export'

export function ExportDialog({
  chartId,
  format = 'png',
  quality = 'standard',
  dimensions = { width: 800, height: 600, dpi: 300 },
  branding,
  onExport,
  onClose,
  isOpen = false,
  measurePerformance = false,
  validateOutput = false,
  preserveInteractivity = true,
  embedFonts = true,
  layout = 'landscape',
  pageSize = 'A4',
  includeMetadata = true
}: ExportDialogProps) {
  const { exportChart, isExporting, progress, error, reset } = useExport()
  
  // Local state for export configuration
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(format)
  const [selectedQuality, setSelectedQuality] = useState<ExportQuality>(quality)
  const [selectedDimensions, setSelectedDimensions] = useState<ExportDimensions>(dimensions)
  const [selectedBranding, setSelectedBranding] = useState(branding || {})
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Format-specific options
  const [pngOptions, setPngOptions] = useState({
    dpi: dimensions.dpi || 300,
    backgroundColor: '#ffffff'
  })

  const [svgOptions, setSvgOptions] = useState({
    preserveInteractivity,
    embedFonts,
    optimizeOutput: true
  })

  const [pdfOptions, setPdfOptions] = useState({
    layout,
    pageSize,
    includeMetadata
  })

  const handleExport = useCallback(async () => {
    reset() // Clear any previous errors

    const exportConfig: ExportConfig = {
      format: selectedFormat,
      dimensions: selectedDimensions,
      quality: selectedQuality,
      filename: `${chartId}-${selectedFormat}-${Date.now()}.${selectedFormat}`
    }

    // Add branding if configured
    if (Object.keys(selectedBranding).length > 0) {
      exportConfig.branding = {
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

    try {
      const result = await exportChart(chartId, exportConfig)
      
      if (result.success) {
        onExport?.(result)
        onClose?.()
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }, [
    chartId,
    selectedFormat,
    selectedQuality,
    selectedDimensions,
    selectedBranding,
    exportChart,
    onExport,
    onClose,
    reset
  ])

  const formatIcons = {
    png: <Image className="w-4 h-4" />,
    svg: <FileText className="w-4 h-4" />,
    pdf: <Layout className="w-4 h-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Export Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'svg', 'pdf'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedFormat === fmt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {formatIcons[fmt]}
                  <span className="text-sm font-medium uppercase">{fmt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'high', 'print'] as ExportQuality[]).map((qual) => (
                <button
                  key={qual}
                  onClick={() => setSelectedQuality(qual)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedQuality === qual
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium capitalize">{qual}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width</label>
                <input
                  type="number"
                  value={selectedDimensions.width}
                  onChange={(e) => setSelectedDimensions(prev => ({
                    ...prev,
                    width: parseInt(e.target.value) || 800
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height</label>
                <input
                  type="number"
                  value={selectedDimensions.height}
                  onChange={(e) => setSelectedDimensions(prev => ({
                    ...prev,
                    height: parseInt(e.target.value) || 600
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Branding Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Branding Options
              </label>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBranding.includeLogo || false}
                  onChange={(e) => setSelectedBranding(prev => ({
                    ...prev,
                    includeLogo: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include logo</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBranding.applyColorScheme || false}
                  onChange={(e) => setSelectedBranding(prev => ({
                    ...prev,
                    applyColorScheme: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Apply brand colors</span>
              </label>
            </div>
          </div>

          {/* Format-specific options */}
          {showAdvanced && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {selectedFormat.toUpperCase()} Options
              </h3>
              
              {selectedFormat === 'png' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DPI</label>
                    <select
                      value={pngOptions.dpi}
                      onChange={(e) => setPngOptions(prev => ({
                        ...prev,
                        dpi: parseInt(e.target.value) as 72 | 150 | 300
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={72}>72 DPI (Web)</option>
                      <option value={150}>150 DPI (Standard)</option>
                      <option value={300}>300 DPI (Print)</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedFormat === 'svg' && (
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={svgOptions.embedFonts}
                      onChange={(e) => setSvgOptions(prev => ({
                        ...prev,
                        embedFonts: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Embed fonts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={svgOptions.optimizeOutput}
                      onChange={(e) => setSvgOptions(prev => ({
                        ...prev,
                        optimizeOutput: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Optimize output</span>
                  </label>
                </div>
              )}

              {selectedFormat === 'pdf' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Layout</label>
                    <select
                      value={pdfOptions.layout}
                      onChange={(e) => setPdfOptions(prev => ({
                        ...prev,
                        layout: e.target.value as 'portrait' | 'landscape'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Page Size</label>
                    <select
                      value={pdfOptions.pageSize}
                      onChange={(e) => setPdfOptions(prev => ({
                        ...prev,
                        pageSize: e.target.value as 'A4' | 'A3' | 'Letter' | 'Legal'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Exporting...</span>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <strong>Export failed:</strong> {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            role="button"
            aria-label={`export as ${selectedFormat}`}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportDialog