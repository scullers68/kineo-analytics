import { useState, useEffect, useMemo } from 'react'
import { useDrillDown } from '../contexts/DrillDownProvider'

// Learning analytics data interfaces matching test expectations
interface ChartData {
  label: string
  value: number
  category: string
  id?: string
}

interface DepartmentData {
  id: string
  name: string
  metrics: ChartData[]
}

interface TeamData {
  id: string
  name: string
  departmentId: string
  metrics: ChartData[]
}

interface IndividualData {
  id: string
  name: string
  teamId: string
  metrics: ChartData[]
}

interface DrillDownData {
  department: DepartmentData
  teams: TeamData[]
  individuals: IndividualData[]
}

interface UseDrillDownDataOptions {
  data?: DrillDownData
  fetchData?: (level: string, id?: string) => Promise<any>
}

interface UseDrillDownDataReturn {
  currentData: ChartData[]
  isLoading: boolean
  error: string | null
  filteredTeams: TeamData[]
  filteredIndividuals: IndividualData[]
  refreshData: () => void
}

export const useDrillDownData = (options: UseDrillDownDataOptions = {}): UseDrillDownDataReturn => {
  const { state } = useDrillDown()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DrillDownData | null>(options.data || null)

  // Filter teams by current department
  const filteredTeams = useMemo(() => {
    if (!data?.teams || !state.department) return []
    return data.teams.filter(team => team.departmentId === state.department)
  }, [data?.teams, state.department])

  // Filter individuals by current team
  const filteredIndividuals = useMemo(() => {
    if (!data?.individuals || !state.team) return []
    return data.individuals.filter(individual => individual.teamId === state.team)
  }, [data?.individuals, state.team])

  // Get current level data based on navigation state
  const currentData = useMemo((): ChartData[] => {
    if (!data) return []

    switch (state.level) {
      case 'department':
        return data.department?.metrics || []
      
      case 'team':
        if (state.department) {
          // Return metrics for all teams in the department
          return filteredTeams.flatMap(team => team.metrics)
        }
        return []
      
      case 'individual':
        if (state.team) {
          // Return metrics for all individuals in the team
          return filteredIndividuals.flatMap(individual => individual.metrics)
        }
        return []
      
      default:
        return []
    }
  }, [data, state.level, state.department, state.team, filteredTeams, filteredIndividuals])

  // Fetch data when navigation changes
  useEffect(() => {
    const fetchData = async () => {
      if (!options.fetchData) return

      setIsLoading(true)
      setError(null)

      try {
        const result = await options.fetchData(state.level, getCurrentId())
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    if (options.fetchData) {
      fetchData()
    }
  }, [state.level, state.department, state.team, state.individual, options.fetchData])

  // Helper to get current level ID
  const getCurrentId = (): string | undefined => {
    switch (state.level) {
      case 'department':
        return state.department
      case 'team':
        return state.team
      case 'individual':
        return state.individual
      default:
        return undefined
    }
  }

  const refreshData = async () => {
    if (!options.fetchData) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await options.fetchData(state.level, getCurrentId())
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentData,
    isLoading,
    error,
    filteredTeams,
    filteredIndividuals,
    refreshData
  }
}

export type {
  ChartData,
  DepartmentData,
  TeamData,
  IndividualData,
  DrillDownData,
  UseDrillDownDataOptions,
  UseDrillDownDataReturn
}