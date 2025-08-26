export interface AccessibleMarkupOptions {
  role?: string
  ariaLabel?: string
  ariaDescription?: string
  tabIndex?: number
  ariaExpanded?: boolean
  ariaSelected?: boolean
}

export const createAccessibleMarkup = (options: AccessibleMarkupOptions = {}) => {
  const attributes: Record<string, string | number | boolean> = {}
  
  if (options.role) attributes['role'] = options.role
  if (options.ariaLabel) attributes['aria-label'] = options.ariaLabel
  if (options.ariaDescription) attributes['aria-description'] = options.ariaDescription
  if (options.tabIndex !== undefined) attributes['tabIndex'] = options.tabIndex
  if (options.ariaExpanded !== undefined) attributes['aria-expanded'] = options.ariaExpanded
  if (options.ariaSelected !== undefined) attributes['aria-selected'] = options.ariaSelected
  
  return attributes
}

export const generateChartAriaLabel = (type: string, dataCount: number): string => {
  return `${type} chart with ${dataCount} data points`
}

export const generateDataPointAriaLabel = (value: any, label?: string, index?: number): string => {
  const labelText = label || `Data point ${(index || 0) + 1}`
  return `${labelText}: ${value}`
}

export const createAriaLabelledBy = (id: string): { 'aria-labelledby': string } => {
  return { 'aria-labelledby': id }
}

export const createAriaDescribedBy = (id: string): { 'aria-describedby': string } => {
  return { 'aria-describedby': id }
}

export default createAccessibleMarkup