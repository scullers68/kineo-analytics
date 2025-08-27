import { useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDrillDown } from '../contexts/DrillDownProvider'

interface NavigationRouterOptions {
  baseRoute?: string
  updateURL?: boolean
  restoreFromURL?: boolean
}

interface UseNavigationRouterReturn {
  navigateWithURL: (level: string, targetId?: string) => void
  getCurrentURL: () => string
  parseNavigationFromURL: (url?: string) => {
    level: string
    department?: string
    team?: string
    individual?: string
  } | null
  generateNavigationURL: (level: string, department?: string, team?: string, individual?: string) => string
}

export const useNavigationRouter = (options: NavigationRouterOptions = {}): UseNavigationRouterReturn => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, drillDown, navigateUp } = useDrillDown()
  
  const {
    baseRoute = '/dashboard',
    updateURL = true,
    restoreFromURL = true
  } = options

  // Parse navigation state from URL parameters with sanitization
  const parseNavigationFromURL = useCallback((url?: string) => {
    const currentURL = url || window.location.href
    const urlObj = new URL(currentURL)
    
    // Get navigation parameters from search params with sanitization
    const level = urlObj.searchParams.get('level')?.toLowerCase() || 'department'
    
    // Validate level strictly
    if (!['department', 'team', 'individual'].includes(level)) {
      console.warn('Invalid navigation level in URL:', level)
      return null
    }
    
    // Sanitize string parameters to prevent injection
    const sanitizeParam = (param: string | null): string | undefined => {
      if (!param) return undefined
      // Remove potentially dangerous characters
      return param.replace(/[<>\"\'&]/g, '').substring(0, 100)
    }
    
    const department = sanitizeParam(urlObj.searchParams.get('dept'))
    const team = sanitizeParam(urlObj.searchParams.get('team'))
    const individual = sanitizeParam(urlObj.searchParams.get('user'))

    return {
      level,
      department,
      team,
      individual
    }
  }, [])

  // Generate URL with navigation parameters
  const generateNavigationURL = useCallback((
    level: string, 
    department?: string, 
    team?: string, 
    individual?: string
  ): string => {
    const url = new URL(baseRoute, window.location.origin)
    
    // Set level parameter
    url.searchParams.set('level', level)
    
    // Add department parameter if provided
    if (department) {
      url.searchParams.set('dept', department)
    }
    
    // Add team parameter if provided and level is team or individual
    if (team && (level === 'team' || level === 'individual')) {
      url.searchParams.set('team', team)
    }
    
    // Add individual parameter if provided and level is individual
    if (individual && level === 'individual') {
      url.searchParams.set('user', individual)
    }

    return url.pathname + url.search
  }, [baseRoute])

  // Navigate and update URL
  const navigateWithURL = useCallback((level: string, targetId?: string) => {
    if (!updateURL) return

    // Build new URL based on current state and navigation target
    let department = state.department
    let team = state.team
    let individual = state.individual

    // Update the appropriate level
    switch (level) {
      case 'department':
        department = targetId
        team = undefined // Clear deeper levels
        individual = undefined
        break
      case 'team':
        team = targetId
        individual = undefined // Clear deeper levels
        break
      case 'individual':
        individual = targetId
        break
    }

    const newURL = generateNavigationURL(level, department, team, individual)
    
    // Update browser URL without full page reload
    router.push(newURL)
    
    // Update drill-down state to match URL
    if (targetId) {
      drillDown(targetId, level as any)
    } else {
      navigateUp(level as any)
    }
  }, [state, updateURL, generateNavigationURL, router, drillDown, navigateUp])

  // Get current navigation URL
  const getCurrentURL = useCallback((): string => {
    return generateNavigationURL(
      state.level,
      state.department,
      state.team,
      state.individual
    )
  }, [state, generateNavigationURL])

  // Restore navigation state from URL on component mount
  useEffect(() => {
    if (!restoreFromURL) return

    const navigationFromURL = parseNavigationFromURL()
    if (!navigationFromURL) return

    // Check if URL state differs from current state
    const isDifferent = (
      navigationFromURL.level !== state.level ||
      navigationFromURL.department !== state.department ||
      navigationFromURL.team !== state.team ||
      navigationFromURL.individual !== state.individual
    )

    if (isDifferent) {
      // Restore navigation state from URL
      const { level, department, team, individual } = navigationFromURL
      
      if (level === 'department' && department) {
        drillDown(department, 'department')
      } else if (level === 'team' && team) {
        if (department) drillDown(department, 'department')
        drillDown(team, 'team')
      } else if (level === 'individual' && individual) {
        if (department) drillDown(department, 'department')
        if (team) drillDown(team, 'team')
        drillDown(individual, 'individual')
      }
    }
  }, [restoreFromURL, parseNavigationFromURL, state, drillDown])

  // Update URL when navigation state changes (if not triggered by URL)
  useEffect(() => {
    if (!updateURL) return

    const currentURLState = parseNavigationFromURL()
    if (!currentURLState) return

    // Check if state differs from URL
    const isDifferent = (
      currentURLState.level !== state.level ||
      currentURLState.department !== state.department ||
      currentURLState.team !== state.team ||
      currentURLState.individual !== state.individual
    )

    if (isDifferent) {
      const newURL = generateNavigationURL(
        state.level,
        state.department,
        state.team,
        state.individual
      )
      
      // Use replace to avoid adding unnecessary history entries
      router.replace(newURL)
    }
  }, [state, updateURL, parseNavigationFromURL, generateNavigationURL, router])

  return {
    navigateWithURL,
    getCurrentURL,
    parseNavigationFromURL,
    generateNavigationURL
  }
}

export type { NavigationRouterOptions, UseNavigationRouterReturn }