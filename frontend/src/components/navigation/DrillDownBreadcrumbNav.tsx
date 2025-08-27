'use client'

import React, { useCallback } from 'react'
import { DrillDownBreadcrumb } from './DrillDownBreadcrumb'
import { useDrillDown, BreadcrumbItem } from '../../contexts/DrillDownProvider'

interface DrillDownBreadcrumbNavProps {
  className?: string
  separator?: React.ReactNode
  maxItems?: number
  showLevelIcons?: boolean
  onNavigate?: (level: string, targetId?: string) => void
  onChartUpdate?: (level: string) => void
}

export const DrillDownBreadcrumbNav: React.FC<DrillDownBreadcrumbNavProps> = ({
  className = '',
  separator = '/',
  maxItems = 4,
  showLevelIcons = true,
  onNavigate,
  onChartUpdate
}) => {
  const { state, navigateUp, updateBreadcrumbs } = useDrillDown()

  // Handle breadcrumb click navigation
  const handleBreadcrumbClick = useCallback((item: BreadcrumbItem, level: string) => {
    if (level === 'ellipsis' || level === state.level) {
      return // Don't navigate to ellipsis or current level
    }

    // Navigate up to the clicked level
    navigateUp(level as any)

    // Update chart data for target level
    if (onChartUpdate) {
      onChartUpdate(level)
    }

    // Update URL to reflect navigation state
    if (onNavigate) {
      const targetId = getTargetIdForLevel(level)
      onNavigate(level, targetId)
    }

    // Visual feedback - update breadcrumbs to reflect change
    updateBreadcrumbsForLevel(level)
  }, [state.level, navigateUp, onChartUpdate, onNavigate, updateBreadcrumbs])

  // Get target ID based on level for URL updates
  const getTargetIdForLevel = useCallback((level: string): string | undefined => {
    switch (level) {
      case 'department':
        return state.department
      case 'team':
        return state.team
      case 'individual':
        return state.individual
      default:
        return undefined
    }
  }, [state.department, state.team, state.individual])

  // Update breadcrumbs to reflect the navigation change
  const updateBreadcrumbsForLevel = useCallback((level: string) => {
    const newBreadcrumbs: BreadcrumbItem[] = []

    // Always include department
    newBreadcrumbs.push({
      label: state.department || 'Department',
      level: 'department',
      onClick: () => handleBreadcrumbClick({ label: state.department || 'Department', level: 'department', onClick: () => {} }, 'department')
    })

    // Include team if navigating to team level or below
    if ((level === 'team' || level === 'individual') && state.team) {
      newBreadcrumbs.push({
        label: state.team,
        level: 'team',
        onClick: () => handleBreadcrumbClick({ label: state.team || 'Team', level: 'team', onClick: () => {} }, 'team')
      })
    }

    // Include individual if navigating to individual level
    if (level === 'individual' && state.individual) {
      newBreadcrumbs.push({
        label: state.individual,
        level: 'individual',
        onClick: () => handleBreadcrumbClick({ label: state.individual || 'Individual', level: 'individual', onClick: () => {} }, 'individual')
      })
    }

    updateBreadcrumbs(newBreadcrumbs)
  }, [state.department, state.team, state.individual, updateBreadcrumbs, handleBreadcrumbClick])

  return (
    <DrillDownBreadcrumb
      className={className}
      separator={separator}
      maxItems={maxItems}
      showLevelIcons={showLevelIcons}
      onBreadcrumbClick={handleBreadcrumbClick}
    />
  )
}

export default DrillDownBreadcrumbNav