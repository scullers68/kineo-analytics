// Chart Web Worker for processing large datasets
// This runs in a separate thread to avoid blocking the main UI thread

export interface WorkerMessage {
  id: string
  type: 'PROCESS_DATA' | 'AGGREGATE_DATA' | 'FILTER_DATA' | 'SORT_DATA'
  payload: any
}

export interface WorkerResponse {
  id: string
  type: 'SUCCESS' | 'ERROR'
  result?: any
  error?: string
}

// Web Worker factory function
export const createChartWorker = (): Worker | null => {
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers not supported in this environment')
    return null
  }

  const workerCode = `
    // Chart processing functions
    const processData = (data) => {
      try {
        // Simple data processing example
        return data.map(item => ({
          ...item,
          processed: true,
          timestamp: Date.now()
        }))
      } catch (error) {
        throw new Error('Data processing failed: ' + error.message)
      }
    }

    const aggregateData = (data, groupBy) => {
      try {
        const groups = {}
        data.forEach(item => {
          const key = item[groupBy] || 'unknown'
          if (!groups[key]) {
            groups[key] = { count: 0, sum: 0, items: [] }
          }
          groups[key].count++
          groups[key].sum += (item.value || 0)
          groups[key].items.push(item)
        })

        return Object.entries(groups).map(([key, value]) => ({
          group: key,
          count: value.count,
          average: value.sum / value.count,
          total: value.sum
        }))
      } catch (error) {
        throw new Error('Data aggregation failed: ' + error.message)
      }
    }

    const filterData = (data, filters) => {
      try {
        return data.filter(item => {
          return Object.entries(filters).every(([key, value]) => {
            if (value === null || value === undefined) return true
            if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
              return item[key] >= value.min && item[key] <= value.max
            }
            return item[key] === value
          })
        })
      } catch (error) {
        throw new Error('Data filtering failed: ' + error.message)
      }
    }

    const sortData = (data, sortBy, direction = 'asc') => {
      try {
        return [...data].sort((a, b) => {
          const aVal = a[sortBy]
          const bVal = b[sortBy]
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1
          if (aVal > bVal) return direction === 'asc' ? 1 : -1
          return 0
        })
      } catch (error) {
        throw new Error('Data sorting failed: ' + error.message)
      }
    }

    // Main message handler
    self.onmessage = function(e) {
      const { id, type, payload } = e.data

      try {
        let result

        switch (type) {
          case 'PROCESS_DATA':
            result = processData(payload.data)
            break
          
          case 'AGGREGATE_DATA':
            result = aggregateData(payload.data, payload.groupBy)
            break
          
          case 'FILTER_DATA':
            result = filterData(payload.data, payload.filters)
            break
          
          case 'SORT_DATA':
            result = sortData(payload.data, payload.sortBy, payload.direction)
            break
          
          default:
            throw new Error('Unknown message type: ' + type)
        }

        self.postMessage({
          id,
          type: 'SUCCESS',
          result
        })

      } catch (error) {
        self.postMessage({
          id,
          type: 'ERROR',
          error: error.message
        })
      }
    }
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  
  const worker = new Worker(workerUrl)
  
  // Clean up the object URL when worker is terminated
  const originalTerminate = worker.terminate.bind(worker)
  worker.terminate = () => {
    URL.revokeObjectURL(workerUrl)
    originalTerminate()
  }

  return worker
}

// Worker manager class
export class ChartWorkerManager {
  private worker: Worker | null = null
  private pendingMessages = new Map<string, { resolve: Function; reject: Function }>()

  constructor() {
    this.worker = createChartWorker()
    
    if (this.worker) {
      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = e.data
        const pending = this.pendingMessages.get(id)
        
        if (pending) {
          this.pendingMessages.delete(id)
          
          if (type === 'SUCCESS') {
            pending.resolve(result)
          } else {
            pending.reject(new Error(error))
          }
        }
      }

      this.worker.onerror = (error) => {
        console.error('Chart worker error:', error)
      }
    }
  }

  async processData(data: any[]): Promise<any[]> {
    if (!this.worker) {
      // Fallback to main thread processing
      return data.map(item => ({ ...item, processed: true }))
    }

    return this.sendMessage('PROCESS_DATA', { data })
  }

  async aggregateData(data: any[], groupBy: string): Promise<any[]> {
    if (!this.worker) {
      // Fallback aggregation logic
      const groups: { [key: string]: any } = {}
      data.forEach(item => {
        const key = item[groupBy] || 'unknown'
        if (!groups[key]) {
          groups[key] = { count: 0, sum: 0 }
        }
        groups[key].count++
        groups[key].sum += (item.value || 0)
      })
      
      return Object.entries(groups).map(([key, value]: [string, any]) => ({
        group: key,
        count: value.count,
        average: value.sum / value.count
      }))
    }

    return this.sendMessage('AGGREGATE_DATA', { data, groupBy })
  }

  private sendMessage(type: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'))
        return
      }

      const id = Math.random().toString(36).substr(2, 9)
      this.pendingMessages.set(id, { resolve, reject })
      
      this.worker.postMessage({ id, type, payload })
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id)
          reject(new Error('Worker timeout'))
        }
      }, 30000)
    })
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingMessages.clear()
  }
}

// Global worker instance
export const globalChartWorker = new ChartWorkerManager()

export default createChartWorker