export interface VirtualizationConfig {
  itemHeight: number
  containerHeight: number
  overscan: number
  scrollTop: number
}

export interface VirtualizedItem {
  index: number
  data: any
  top: number
  height: number
  isVisible: boolean
}

export const createVirtualizedRenderer = (
  items: any[],
  config: VirtualizationConfig
): {
  visibleItems: VirtualizedItem[]
  totalHeight: number
  startIndex: number
  endIndex: number
} => {
  const { itemHeight, containerHeight, overscan, scrollTop } = config
  
  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  const visibleItems: VirtualizedItem[] = []
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visibleItems.push({
        index: i,
        data: items[i],
        top: i * itemHeight,
        height: itemHeight,
        isVisible: true
      })
    }
  }
  
  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex
  }
}

export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number = 5
): { start: number; end: number } => {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(itemCount - 1, start + visibleCount + overscan)
  
  return { start, end }
}

export const createVirtualScrollHandler = (
  onScroll: (scrollTop: number) => void,
  throttleMs: number = 16
) => {
  let rafId: number | null = null
  
  return (event: React.UIEvent<HTMLElement>) => {
    if (rafId) {
      cancelAnimationFrame(rafId)
    }
    
    rafId = requestAnimationFrame(() => {
      const scrollTop = event.currentTarget.scrollTop
      onScroll(scrollTop)
    })
  }
}

export const optimizeDataForVirtualization = <T>(
  data: T[],
  maxItems: number = 1000
): T[] => {
  if (data.length <= maxItems) return data
  
  // Simple sampling strategy - take every nth item
  const step = Math.ceil(data.length / maxItems)
  return data.filter((_, index) => index % step === 0)
}

export default createVirtualizedRenderer