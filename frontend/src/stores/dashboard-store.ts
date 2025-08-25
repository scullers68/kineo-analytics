import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DashboardStore, DashboardFilters, DateRange } from '@/types/store'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // State
      metrics: null,
      charts: null,
      filters: {},
      dateRange: null,
      isLoading: false,
      error: null,
      cache: {},
      cacheExpiry: {},

      // Actions
      loadMetrics: async () => {
        const { filters, dateRange, cache, cacheExpiry } = get()
        
        // Create cache key based on current filters and date range
        const cacheKey = JSON.stringify({ filters, dateRange })
        const now = Date.now()
        
        // Check if we have valid cached data
        if (cache[cacheKey] && cacheExpiry[cacheKey] && cacheExpiry[cacheKey] > now) {
          set({
            metrics: cache[cacheKey].metrics,
            charts: cache[cacheKey].charts,
          }, false, 'dashboard/load-from-cache')
          return
        }

        set({ isLoading: true, error: null }, false, 'dashboard/load-start')

        try {
          // TODO: Replace with actual API call
          const queryParams = new URLSearchParams()
          
          if (dateRange) {
            queryParams.set('startDate', dateRange.start.toISOString())
            queryParams.set('endDate', dateRange.end.toISOString())
          }
          
          if (Object.keys(filters).length > 0) {
            queryParams.set('filters', JSON.stringify(filters))
          }

          const response = await fetch(`/api/dashboard/metrics?${queryParams}`)
          
          if (!response.ok) {
            throw new Error('Failed to load dashboard metrics')
          }

          const data = await response.json()
          
          // Update cache
          const newCache = {
            ...cache,
            [cacheKey]: data
          }
          const newCacheExpiry = {
            ...cacheExpiry,
            [cacheKey]: now + CACHE_DURATION
          }

          set({
            metrics: data.metrics,
            charts: data.charts,
            cache: newCache,
            cacheExpiry: newCacheExpiry,
            isLoading: false,
            error: null,
          }, false, 'dashboard/load-success')
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          }, false, 'dashboard/load-error')
        }
      },

      updateFilters: (newFilters: DashboardFilters) => {
        set({
          filters: { ...get().filters, ...newFilters }
        }, false, 'dashboard/update-filters')
        
        // Auto-refresh data with new filters
        get().loadMetrics()
      },

      setDateRange: (dateRange: DateRange) => {
        set({ dateRange }, false, 'dashboard/set-date-range')
        
        // Auto-refresh data with new date range
        get().loadMetrics()
      },

      refreshData: async () => {
        // Clear cache and reload
        set({
          cache: {},
          cacheExpiry: {}
        }, false, 'dashboard/clear-cache')
        
        await get().loadMetrics()
      },

      clearDashboard: () => {
        set({
          metrics: null,
          charts: null,
          filters: {},
          dateRange: null,
          isLoading: false,
          error: null,
        }, false, 'dashboard/clear')
      },

      invalidateCache: () => {
        set({
          cache: {},
          cacheExpiry: {}
        }, false, 'dashboard/invalidate-cache')
      },
    }),
    { name: 'dashboard-store' }
  )
)

export { useDashboardStore }