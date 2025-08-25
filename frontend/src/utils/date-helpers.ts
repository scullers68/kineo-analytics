/**
 * Date utility functions for the Kineo Analytics platform
 * Writing this WITHOUT tests first - TDD Guard should detect this violation!
 */

export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'iso':
      return date.toISOString().split('T')[0]
    default:
      return date.toLocaleDateString()
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return count
}

export function getQuarter(date: Date): { quarter: number; year: number } {
  const month = date.getMonth()
  const quarter = Math.floor(month / 3) + 1
  return {
    quarter,
    year: date.getFullYear()
  }
}

export function parseUserDate(dateString: string): Date | null {
  // Handle common date formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
  ]
  
  if (!dateString || typeof dateString !== 'string') {
    return null
  }
  
  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? null : parsed
}