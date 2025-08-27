/**
 * TooltipProvider Component
 * 
 * React context provider for centralized tooltip state management
 * Task: task-0023 - Rich Hover Effects and Contextual Tooltips
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { TooltipContextValue, TooltipConfig } from '../../types/tooltips'

const TooltipContext = createContext<TooltipContextValue | null>(null)

export interface TooltipProviderProps {
  children: ReactNode
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [currentTooltip, setCurrentTooltip] = useState<TooltipConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showTooltip = (config: TooltipConfig) => {
    setCurrentTooltip(config)
    setIsVisible(true)
  }

  const hideTooltip = () => {
    setIsVisible(false)
    setCurrentTooltip(null)
  }

  const contextValue: TooltipContextValue = {
    showTooltip,
    hideTooltip,
    currentTooltip,
    isVisible
  }

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  )
}

export const useTooltipContext = () => {
  const context = useContext(TooltipContext)
  if (!context) {
    throw new Error('useTooltipContext must be used within a TooltipProvider')
  }
  return context
}