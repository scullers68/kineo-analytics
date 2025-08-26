import { PieSlice, PieDrillDownData } from '../types/pie-chart'

/**
 * Navigate to drill-down view
 */
export const navigateToDrillDown = (
  slice: PieSlice,
  config: {
    maxDepth?: number
    currentDepth?: number
    onNavigate?: (slice: PieSlice, depth: number, breadcrumbs: any[]) => void
    getDrillDownData?: (slice: PieSlice) => any[]
    animationDuration?: number
  } = {}
): PieDrillDownData | null => {
  const {
    maxDepth = 3,
    currentDepth = 0,
    onNavigate,
    getDrillDownData,
    animationDuration = 500
  } = config

  // Check if we can drill down
  if (currentDepth >= maxDepth) {
    return null
  }

  // Get child data for this slice
  const childData = getDrillDownData?.(slice) || slice.data.metadata?.children || []
  
  if (!childData.length) {
    return null
  }

  const newDepth = currentDepth + 1
  
  // Create drill-down data
  const drillDownData: PieDrillDownData = {
    level: newDepth,
    parentSlice: slice,
    breadcrumbs: [
      {
        label: slice.data.label,
        value: slice.data.value,
        level: currentDepth
      }
    ],
    childData,
    canDrillUp: true,
    canDrillDown: newDepth < maxDepth
  }

  // Trigger navigation callback
  onNavigate?.(slice, newDepth, drillDownData.breadcrumbs)

  return drillDownData
}

/**
 * Create breadcrumb navigation
 */
export const createBreadcrumbNavigation = (
  breadcrumbs: Array<{ label: string; value: string | number; level: number }>,
  config: {
    maxBreadcrumbs?: number
    showHome?: boolean
    homeLabel?: string
    separator?: string
    onBreadcrumbClick?: (level: number) => void
  } = {}
) => {
  const {
    maxBreadcrumbs = 5,
    showHome = true,
    homeLabel = 'Home',
    separator = ' › ',
    onBreadcrumbClick
  } = config

  let displayBreadcrumbs = [...breadcrumbs]
  
  // Add home breadcrumb if enabled
  if (showHome) {
    displayBreadcrumbs.unshift({
      label: homeLabel,
      value: '',
      level: -1
    })
  }

  // Truncate if too many breadcrumbs
  if (displayBreadcrumbs.length > maxBreadcrumbs) {
    const keepFirst = 1 // Keep home
    const keepLast = 2  // Keep last two levels
    const middle = displayBreadcrumbs.length - keepFirst - keepLast

    if (middle > 0) {
      displayBreadcrumbs = [
        ...displayBreadcrumbs.slice(0, keepFirst),
        { label: '...', value: '', level: -2 },
        ...displayBreadcrumbs.slice(-keepLast)
      ]
    }
  }

  const breadcrumbElements = displayBreadcrumbs.map((crumb, index) => {
    const isLast = index === displayBreadcrumbs.length - 1
    const isClickable = crumb.level >= -1 && !isLast && crumb.label !== '...'

    return {
      label: crumb.label,
      value: crumb.value,
      level: crumb.level,
      isLast,
      isClickable,
      separator: isLast ? '' : separator,
      onClick: isClickable ? () => onBreadcrumbClick?.(crumb.level) : undefined
    }
  })

  return {
    breadcrumbs: breadcrumbElements,
    render: (container: HTMLElement) => {
      container.innerHTML = ''
      container.className = 'breadcrumb-navigation'
      container.style.cssText = `
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        flex-wrap: wrap;
      `

      breadcrumbElements.forEach((crumb, index) => {
        const crumbElement = document.createElement('span')
        crumbElement.className = 'breadcrumb-item'
        crumbElement.textContent = crumb.label
        
        if (crumb.isClickable) {
          crumbElement.style.cssText = `
            cursor: pointer;
            color: #007bff;
            text-decoration: none;
            padding: 2px 4px;
            border-radius: 2px;
            transition: background-color 0.2s;
          `
          
          crumbElement.addEventListener('mouseenter', () => {
            crumbElement.style.backgroundColor = 'rgba(0, 123, 255, 0.1)'
          })
          
          crumbElement.addEventListener('mouseleave', () => {
            crumbElement.style.backgroundColor = 'transparent'
          })
          
          crumbElement.addEventListener('click', () => {
            crumb.onClick?.()
          })
        } else if (crumb.isLast) {
          crumbElement.style.cssText = `
            font-weight: 600;
            color: #333;
          `
        }

        container.appendChild(crumbElement)

        // Add separator
        if (crumb.separator) {
          const separatorElement = document.createElement('span')
          separatorElement.className = 'breadcrumb-separator'
          separatorElement.textContent = crumb.separator
          separatorElement.style.cssText = `
            margin: 0 4px;
            color: #999;
          `
          container.appendChild(separatorElement)
        }
      })

      return container
    }
  }
}

/**
 * Handle back navigation in drill-down
 */
export const handleBackNavigation = (
  currentLevel: number,
  targetLevel: number = -1,
  config: {
    onNavigateBack?: (fromLevel: number, toLevel: number) => void
    animationDuration?: number
    restoreState?: boolean
  } = {}
) => {
  const {
    onNavigateBack,
    animationDuration = 300,
    restoreState = true
  } = config

  const actualTargetLevel = targetLevel === -1 ? currentLevel - 1 : targetLevel
  
  if (actualTargetLevel >= currentLevel) {
    return { success: false, reason: 'Invalid target level' }
  }

  if (actualTargetLevel < 0) {
    return { success: false, reason: 'Cannot navigate above root level' }
  }

  // Trigger navigation callback
  onNavigateBack?.(currentLevel, actualTargetLevel)

  return {
    success: true,
    fromLevel: currentLevel,
    toLevel: actualTargetLevel,
    levelsUp: currentLevel - actualTargetLevel
  }
}

/**
 * Create drill-down manager
 */
export const createDrillDownManager = (
  config: {
    maxDepth?: number
    enableBreadcrumbs?: boolean
    enableAnimation?: boolean
    animationDuration?: number
    onLevelChange?: (newLevel: number, data: any) => void
    onDataChange?: (newData: any[]) => void
  } = {}
) => {
  const {
    maxDepth = 3,
    enableBreadcrumbs = true,
    enableAnimation = true,
    animationDuration = 400,
    onLevelChange,
    onDataChange
  } = config

  let currentLevel = 0
  let drillStack: Array<{
    level: number
    slice: PieSlice
    data: any[]
    breadcrumb: { label: string; value: string | number; level: number }
  }> = []

  return {
    drillDown: (slice: PieSlice, childData: any[]) => {
      if (currentLevel >= maxDepth) {
        return { success: false, reason: 'Maximum depth reached' }
      }

      if (!childData.length) {
        return { success: false, reason: 'No child data available' }
      }

      // Add current state to stack
      drillStack.push({
        level: currentLevel,
        slice,
        data: childData,
        breadcrumb: {
          label: slice.data.label,
          value: slice.data.value,
          level: currentLevel
        }
      })

      currentLevel++

      // Notify callbacks
      onLevelChange?.(currentLevel, slice)
      onDataChange?.(childData)

      return {
        success: true,
        newLevel: currentLevel,
        childData,
        canDrillDown: currentLevel < maxDepth,
        canDrillUp: true
      }
    },

    drillUp: (levels = 1) => {
      if (currentLevel === 0 || drillStack.length === 0) {
        return { success: false, reason: 'Already at root level' }
      }

      const targetLevel = Math.max(0, currentLevel - levels)
      const itemsToRemove = Math.min(levels, drillStack.length)

      // Remove items from stack
      const removedItems = drillStack.splice(-itemsToRemove, itemsToRemove)
      currentLevel = targetLevel

      // Get data for new level
      const newData = drillStack.length > 0 
        ? drillStack[drillStack.length - 1].data 
        : [] // Root level data would come from elsewhere

      // Notify callbacks
      onLevelChange?.(currentLevel, null)
      onDataChange?.(newData)

      return {
        success: true,
        newLevel: currentLevel,
        removedItems,
        canDrillDown: currentLevel < maxDepth,
        canDrillUp: currentLevel > 0
      }
    },

    drillToLevel: (targetLevel: number) => {
      if (targetLevel < 0 || targetLevel > maxDepth) {
        return { success: false, reason: 'Invalid target level' }
      }

      if (targetLevel === currentLevel) {
        return { success: false, reason: 'Already at target level' }
      }

      if (targetLevel < currentLevel) {
        // Drill up
        return this.drillUp(currentLevel - targetLevel)
      } else {
        // Cannot drill down to arbitrary level without data
        return { success: false, reason: 'Cannot drill down to arbitrary level' }
      }
    },

    getCurrentLevel: () => currentLevel,

    getBreadcrumbs: () => drillStack.map(item => item.breadcrumb),

    getCanDrillDown: () => currentLevel < maxDepth,

    getCanDrillUp: () => currentLevel > 0,

    reset: () => {
      drillStack = []
      currentLevel = 0
      onLevelChange?.(0, null)
      onDataChange?.([])
      
      return { success: true, level: 0 }
    },

    getState: () => ({
      currentLevel,
      maxDepth,
      drillStack: [...drillStack],
      canDrillDown: this.getCanDrillDown(),
      canDrillUp: this.getCanDrillUp()
    }),

    setState: (state: {
      currentLevel: number
      drillStack: typeof drillStack
    }) => {
      currentLevel = state.currentLevel
      drillStack = [...state.drillStack]
      
      const currentData = drillStack.length > 0 
        ? drillStack[drillStack.length - 1].data 
        : []
      
      onLevelChange?.(currentLevel, null)
      onDataChange?.(currentData)
      
      return this.getState()
    }
  }
}

/**
 * Create hierarchical data transformer for drill-down
 */
export const createHierarchicalDataTransformer = (
  flatData: any[],
  config: {
    idField?: string
    parentIdField?: string
    childrenField?: string
    labelField?: string
    valueField?: string
  } = {}
) => {
  const {
    idField = 'id',
    parentIdField = 'parentId',
    childrenField = 'children',
    labelField = 'label',
    valueField = 'value'
  } = config

  // Build hierarchy
  const itemMap = new Map()
  const rootItems: any[] = []

  // First pass: create map of all items
  flatData.forEach(item => {
    itemMap.set(item[idField], { ...item, [childrenField]: [] })
  })

  // Second pass: build parent-child relationships
  flatData.forEach(item => {
    const parentId = item[parentIdField]
    const mappedItem = itemMap.get(item[idField])
    
    if (parentId && itemMap.has(parentId)) {
      const parent = itemMap.get(parentId)
      parent[childrenField].push(mappedItem)
    } else {
      rootItems.push(mappedItem)
    }
  })

  return {
    getRootItems: () => rootItems,
    
    getChildren: (item: any) => item[childrenField] || [],
    
    getParent: (item: any) => {
      const parentId = item[parentIdField]
      return parentId ? itemMap.get(parentId) : null
    },
    
    getPath: (item: any): any[] => {
      const path = [item]
      let current = this.getParent(item)
      
      while (current) {
        path.unshift(current)
        current = this.getParent(current)
      }
      
      return path
    },
    
    getDepth: (item: any) => {
      let depth = 0
      let current = this.getParent(item)
      
      while (current) {
        depth++
        current = this.getParent(current)
      }
      
      return depth
    },
    
    hasChildren: (item: any) => {
      return (item[childrenField] || []).length > 0
    },
    
    getDescendants: (item: any): any[] => {
      const descendants: any[] = []
      const stack = [...(item[childrenField] || [])]
      
      while (stack.length > 0) {
        const current = stack.pop()!
        descendants.push(current)
        stack.push(...(current[childrenField] || []))
      }
      
      return descendants
    }
  }
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    navigateToDrillDown,
    createBreadcrumbNavigation,
    handleBackNavigation,
    createDrillDownManager,
    createHierarchicalDataTransformer
  }
}