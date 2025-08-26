import React, { createContext, useContext, ReactNode } from 'react'
import { ChartTheme, PerformanceConfig, AnimationConfig, AccessibilityConfig } from '../../types/store'

interface ChartContextValue {
  theme: ChartTheme
  performance: PerformanceConfig
  animation: AnimationConfig
  accessibility: AccessibilityConfig
}

const defaultTheme: ChartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1f2937',
    grid: '#e5e7eb'
  },
  fonts: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    size: {
      small: 12,
      medium: 14,
      large: 16
    }
  },
  spacing: {
    small: 4,
    medium: 8,
    large: 16
  }
}

const defaultPerformance: PerformanceConfig = {
  enableVirtualization: true,
  maxDataPoints: 1000,
  enableWebWorkers: false,
  cacheSize: 100,
  renderThrottle: 16
}

const defaultAnimation: AnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  enabled: true
}

const defaultAccessibility: AccessibilityConfig = {
  enabled: true,
  keyboardNavigation: true,
  screenReaderSupport: true,
  highContrast: false
}

const ChartContext = createContext<ChartContextValue>({
  theme: defaultTheme,
  performance: defaultPerformance,
  animation: defaultAnimation,
  accessibility: defaultAccessibility
})

interface ChartProviderProps {
  children: ReactNode
  theme?: Partial<ChartTheme>
  performance?: Partial<PerformanceConfig>
  animation?: Partial<AnimationConfig>
  accessibility?: Partial<AccessibilityConfig>
}

export const ChartProvider: React.FC<ChartProviderProps> = ({
  children,
  theme = {},
  performance = {},
  animation = {},
  accessibility = {}
}) => {
  const contextValue: ChartContextValue = {
    theme: { ...defaultTheme, ...theme },
    performance: { ...defaultPerformance, ...performance },
    animation: { ...defaultAnimation, ...animation },
    accessibility: { ...defaultAccessibility, ...accessibility }
  }

  return (
    <ChartContext.Provider value={contextValue}>
      {children}
    </ChartContext.Provider>
  )
}

export const useChartContext = () => {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error('useChartContext must be used within a ChartProvider')
  }
  return context
}

export const useChartTheme = () => {
  const { theme } = useChartContext()
  return theme
}

export const useChartPerformanceConfig = () => {
  const { performance } = useChartContext()
  return performance
}

export default ChartProvider