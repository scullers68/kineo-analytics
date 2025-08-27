interface NavigationState {
  level: 'department' | 'team' | 'individual'
  department?: string
  team?: string
  individual?: string
  timestamp: number
  id: string
}

interface RouterLike {
  push: (url: string) => void
  back: () => void
  forward: () => void
  replace: (url: string) => void
}

interface NavigationHistoryOptions {
  maxHistoryEntries?: number
  debounceMs?: number
  trackDuplicates?: boolean
}

export class NavigationHistoryManager {
  private router: RouterLike
  private history: NavigationState[] = []
  private currentIndex: number = -1
  private options: Required<NavigationHistoryOptions>
  private debounceTimer: NodeJS.Timeout | null = null
  
  constructor(router: RouterLike, options: NavigationHistoryOptions = {}) {
    this.router = router
    this.options = {
      maxHistoryEntries: 50,
      debounceMs: 300,
      trackDuplicates: false,
      ...options
    }

    // Listen for browser back/forward events
    this.setupPopstateListener()
  }

  /**
   * Add a navigation state to the history
   */
  addNavigationState(state: Omit<NavigationState, 'timestamp' | 'id'>): void {
    // Debounce rapid navigation changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.performAddNavigationState(state)
    }, this.options.debounceMs)
  }

  private performAddNavigationState(state: Omit<NavigationState, 'timestamp' | 'id'>): void {
    const newState: NavigationState = {
      ...state,
      timestamp: Date.now(),
      id: this.generateStateId(state)
    }

    // Check for duplicates if enabled
    if (!this.options.trackDuplicates && this.isDuplicateState(newState)) {
      return
    }

    // Remove any history entries after the current index (when navigating after going back)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add the new state
    this.history.push(newState)
    this.currentIndex = this.history.length - 1

    // Enforce max history limit
    if (this.history.length > this.options.maxHistoryEntries) {
      this.history = this.history.slice(-this.options.maxHistoryEntries)
      this.currentIndex = this.history.length - 1
    }

    // Update browser history
    const url = this.generateURLFromState(newState)
    this.router.push(url)
  }

  /**
   * Navigate back to the previous state
   */
  navigateBack(): NavigationState | null {
    if (this.currentIndex <= 0) {
      return null // No previous state
    }

    this.currentIndex--
    const previousState = this.history[this.currentIndex]
    
    // Update browser history
    this.router.back()
    
    return previousState
  }

  /**
   * Navigate forward to the next state
   */
  navigateForward(): NavigationState | null {
    if (this.currentIndex >= this.history.length - 1) {
      return null // No next state
    }

    this.currentIndex++
    const nextState = this.history[this.currentIndex]
    
    // Update browser history
    this.router.forward()
    
    return nextState
  }

  /**
   * Get the current navigation state
   */
  getCurrentState(): NavigationState | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null
    }
    return this.history[this.currentIndex]
  }

  /**
   * Get navigation history for debugging or display
   */
  getHistory(): NavigationState[] {
    return [...this.history]
  }

  /**
   * Check if back navigation is possible
   */
  canNavigateBack(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if forward navigation is possible
   */
  canNavigateForward(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * Get navigation breadcrumb path
   */
  getBreadcrumbPath(): string[] {
    const currentState = this.getCurrentState()
    if (!currentState) return []

    const path: string[] = []
    
    if (currentState.department) {
      path.push(currentState.department)
    }
    
    if (currentState.team && (currentState.level === 'team' || currentState.level === 'individual')) {
      path.push(currentState.team)
    }
    
    if (currentState.individual && currentState.level === 'individual') {
      path.push(currentState.individual)
    }

    return path
  }

  private generateStateId(state: Omit<NavigationState, 'timestamp' | 'id'>): string {
    const parts = [
      state.level,
      state.department || '',
      state.team || '',
      state.individual || ''
    ]
    return parts.join('-').replace(/--+/g, '-').replace(/^-|-$/g, '')
  }

  private isDuplicateState(newState: NavigationState): boolean {
    const currentState = this.getCurrentState()
    if (!currentState) return false

    return (
      currentState.level === newState.level &&
      currentState.department === newState.department &&
      currentState.team === newState.team &&
      currentState.individual === newState.individual
    )
  }

  private generateURLFromState(state: NavigationState): string {
    const params = new URLSearchParams()
    
    params.set('level', state.level)
    
    if (state.department) {
      params.set('dept', state.department)
    }
    
    if (state.team && (state.level === 'team' || state.level === 'individual')) {
      params.set('team', state.team)
    }
    
    if (state.individual && state.level === 'individual') {
      params.set('user', state.individual)
    }

    return `/dashboard?${params.toString()}`
  }

  private popstateHandler = (event: PopStateEvent): void => {
    // Handle browser back/forward button
    if (event.state && event.state.navigationState) {
      const state = event.state.navigationState as NavigationState
      
      // Find the state in our history
      const historyIndex = this.history.findIndex(h => h.id === state.id)
      if (historyIndex !== -1) {
        this.currentIndex = historyIndex
      }
    }
  }

  private setupPopstateListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.popstateHandler)
    }
  }

  /**
   * Cleanup method to remove event listeners
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.popstateHandler)
    }
  }
}

export type { NavigationState, RouterLike, NavigationHistoryOptions }