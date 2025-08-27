'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Drill-down navigation types matching test expectations
interface BreadcrumbItem {
  label: string
  level: string
  onClick: () => void
}

interface DrillDownState {
  level: 'department' | 'team' | 'individual'
  department?: string
  team?: string
  individual?: string
  breadcrumbs: BreadcrumbItem[]
}

interface DrillDownContextType {
  state: DrillDownState
  drillDown: (targetId: string, targetLevel: DrillDownState['level']) => void
  navigateUp: (targetLevel: DrillDownState['level']) => void
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
}

// Create context
const DrillDownContext = createContext<DrillDownContextType | undefined>(undefined)

// Provider component
interface DrillDownProviderProps {
  children: ReactNode
  initialState?: Partial<DrillDownState>
}

export const DrillDownProvider: React.FC<DrillDownProviderProps> = ({
  children,
  initialState = {}
}) => {
  const [state, setState] = useState<DrillDownState>({
    level: 'department',
    breadcrumbs: [],
    ...initialState
  })

  const drillDown = useCallback((targetId: string, targetLevel: DrillDownState['level']) => {
    // Input validation for security
    if (!targetId || typeof targetId !== 'string') {
      console.error('Invalid targetId provided to drillDown')
      return
    }
    
    if (!['department', 'team', 'individual'].includes(targetLevel)) {
      console.error('Invalid targetLevel provided to drillDown')
      return
    }
    
    // Sanitize targetId to prevent injection
    const sanitizedId = targetId.replace(/[<>\"\']/g, '')
    
    setState(prevState => {
      const newState: DrillDownState = {
        ...prevState,
        level: targetLevel
      }

      // Update specific level based on target
      switch (targetLevel) {
        case 'department':
          newState.department = sanitizedId
          break
        case 'team':
          newState.team = sanitizedId
          break
        case 'individual':
          newState.individual = sanitizedId
          break
      }

      return newState
    })
  }, [])

  const navigateUp = useCallback((targetLevel: DrillDownState['level']) => {
    setState(prevState => ({
      ...prevState,
      level: targetLevel,
      // Clear deeper levels when navigating up
      ...(targetLevel === 'department' && { team: undefined, individual: undefined }),
      ...(targetLevel === 'team' && { individual: undefined })
    }))
  }, [])

  const updateBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setState(prevState => ({
      ...prevState,
      breadcrumbs
    }))
  }, [])

  const value: DrillDownContextType = {
    state,
    drillDown,
    navigateUp,
    updateBreadcrumbs
  }

  return (
    <DrillDownContext.Provider value={value}>
      {children}
    </DrillDownContext.Provider>
  )
}

// Hook to use drill-down context
export const useDrillDown = () => {
  const context = useContext(DrillDownContext)
  if (context === undefined) {
    throw new Error('useDrillDown must be used within a DrillDownProvider')
  }
  return context
}

// Export types for use in other components
export type { DrillDownState, BreadcrumbItem, DrillDownContextType }