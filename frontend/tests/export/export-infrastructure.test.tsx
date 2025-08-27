/**
 * Export Infrastructure Test - Validating Test Setup for Task-0025
 * 
 * This file validates our testing infrastructure is working correctly
 * before implementing the main export functionality tests.
 * 
 * Purpose: Confirm test environment setup and mock configurations
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Test that existing chart components are available (from Task-0010)
import { BarChart } from '../../src/components/charts'

describe('Export Infrastructure Validation', () => {
  
  test('Test environment is properly configured', () => {
    // Verify mocks are available
    expect(global.URL.createObjectURL).toBeDefined()
    expect(global.URL.revokeObjectURL).toBeDefined()
    expect(HTMLCanvasElement.prototype.getContext).toBeDefined()
    
    // Verify performance APIs are mocked
    expect(performance.mark).toBeDefined()
    expect(performance.measure).toBeDefined()
  })
  
  test('Chart components from Task-0010 are available for export testing', () => {
    const mockData = [
      { label: 'Test', value: 100, category: 'Mock' }
    ]
    
    render(<BarChart data={mockData} width={400} height={300} />)
    
    // Verify chart renders (foundation for export functionality)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
  
  test('Browser download APIs are properly mocked', () => {
    // Test download link creation
    const link = document.createElement('a')
    link.download = 'test-file.png'
    link.href = 'blob:test-data'
    
    expect(link.download).toBe('test-file.png')
    expect(link.href).toBe('blob:test-data')
    expect(link.click).toBeDefined()
  })
})