import React from 'react'
import { AccessibilityConfig } from '../../types/store'

interface AccessibleChartProps {
  accessibility?: AccessibilityConfig
  children?: React.ReactNode
  data?: any[]
}

export const AccessibleChart: React.FC<AccessibleChartProps> = ({
  accessibility = {
    enabled: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrast: false
  },
  children,
  data = []
}) => {
  const ariaLabel = accessibility.ariaLabel || 'Interactive chart'
  const description = accessibility.description || 'Chart displaying data visualization'

  return (
    <div 
      role="img"
      aria-label={ariaLabel}
      aria-description={description}
      tabIndex={accessibility.keyboardNavigation ? 0 : -1}
      className={`accessible-chart ${accessibility.highContrast ? 'high-contrast' : ''}`}
    >
      {children}
      {accessibility.screenReaderSupport && (
        <div className="sr-only">
          Chart contains {data.length} data points
        </div>
      )}
    </div>
  )
}

export default AccessibleChart