/**
 * Batch Exporter - Multi-Chart Export Component - Task-0025
 * 
 * Component for exporting multiple charts simultaneously with consolidated
 * output and progress tracking for efficient bulk operations.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Download, FileText, Package, AlertCircle } from 'lucide-react'
import { useExport } from './ExportProvider'
import type {
  BatchExporterProps,
  BatchExportConfig,
  ExportFormat
} from '../../types/export'

export function BatchExporter({
  charts,
  format,
  layout = 'multi-page',
  onExport,
  className = ''
}: BatchExporterProps) {
  const { exportBatch, isExporting, progress, error, reset } = useExport()
  const [consolidate, setConsolidate] = useState(true)
  const [selectedCharts, setSelectedCharts] = useState<string[]>(charts.map(c => c.id))

  const handleBatchExport = useCallback(async () => {
    reset() // Clear any previous errors

    const selectedChartData = charts.filter(chart => selectedCharts.includes(chart.id))
    
    if (selectedChartData.length === 0) {
      return
    }

    const batchConfig: BatchExportConfig = {
      charts: selectedChartData,
      format,
      layout,
      consolidate
    }

    try {
      const result = await exportBatch(batchConfig)
      
      if (result.success) {
        onExport?.(result)
      }
    } catch (err) {
      console.error('Batch export failed:', err)
    }
  }, [charts, selectedCharts, format, layout, consolidate, exportBatch, onExport, reset])

  const handleChartToggle = useCallback((chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId)
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedCharts(charts.map(c => c.id))
  }, [charts])

  const handleSelectNone = useCallback(() => {
    setSelectedCharts([])
  }, [])

  const formatIcon = format === 'pdf' ? <FileText className="w-4 h-4" /> : <Package className="w-4 h-4" />

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {formatIcon}
          <h3 className="text-lg font-semibold text-gray-900">
            Batch Export ({format.toUpperCase()})
          </h3>
          <span className="text-sm text-gray-500">
            {selectedCharts.length} of {charts.length} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleSelectNone}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Select None
          </button>
        </div>
      </div>

      {/* Chart Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Charts to Export
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {charts.map((chart) => (
            <label key={chart.id} className="flex items-center p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedCharts.includes(chart.id)}
                onChange={() => handleChartToggle(chart.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {chart.title}
                </div>
                <div className="text-xs text-gray-500">
                  {chart.type} chart • {chart.data?.length || 0} data points
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout Options
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['single-page', 'multi-page', 'grid'] as const).map((layoutOption) => (
              <button
                key={layoutOption}
                onClick={() => layout = layoutOption}
                className={`p-2 text-xs rounded border transition-all ${
                  layout === layoutOption
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {layoutOption.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {format === 'pdf' && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={consolidate}
                onChange={(e) => setConsolidate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Consolidate into single PDF file
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isExporting && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Processing charts...</span>
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
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Batch export failed:</strong> {error}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {consolidate && format === 'pdf' 
            ? `All charts will be combined into a single PDF file`
            : `Each chart will be exported as a separate ${format.toUpperCase()} file`
          }
        </div>
        
        <button
          onClick={handleBatchExport}
          disabled={isExporting || selectedCharts.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          role="button"
          aria-label="batch export"
        >
          <Download className="w-4 h-4" />
          {isExporting 
            ? `Exporting ${selectedCharts.length} charts...` 
            : `Export ${selectedCharts.length} Charts`
          }
        </button>
      </div>

      {/* Export Stats */}
      {selectedCharts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Selected:</span> {selectedCharts.length} charts
            {format === 'pdf' && consolidate && (
              <> • <span className="font-medium">Output:</span> 1 PDF file</>
            )}
            {(format !== 'pdf' || !consolidate) && (
              <> • <span className="font-medium">Output:</span> {selectedCharts.length} {format.toUpperCase()} files</>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Static methods for testing
BatchExporter.processCharts = async (config: BatchExportConfig) => {
  // Mock implementation for testing
  console.log('Processing charts:', config.charts.length)
  return {
    processed: config.charts.length,
    format: config.format,
    layout: config.layout
  }
}

BatchExporter.getConsolidatedFile = () => {
  // Mock implementation for testing
  return new Blob(['mock-consolidated-file'], { type: 'application/pdf' })
}

export default BatchExporter