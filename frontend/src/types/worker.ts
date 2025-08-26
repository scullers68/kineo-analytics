export interface WorkerMessage {
  id: string
  type: 'PROCESS_DATA' | 'AGGREGATE_DATA' | 'FILTER_DATA' | 'SORT_DATA' | 'TRANSFORM_DATA'
  payload: any
  timestamp?: number
}

export interface WorkerResponse {
  id: string
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS'
  result?: any
  error?: string
  progress?: number
  timestamp?: number
}

export interface WorkerConfig {
  maxConcurrent: number
  timeoutMs: number
  retryAttempts: number
  enableLogging: boolean
}

export interface DataProcessingTask {
  id: string
  type: WorkerMessage['type']
  data: any[]
  options?: {
    groupBy?: string
    filters?: Record<string, any>
    sortBy?: string
    direction?: 'asc' | 'desc'
    chunkSize?: number
  }
  priority?: 'low' | 'medium' | 'high'
  callback?: (result: any) => void
  onProgress?: (progress: number) => void
}

export interface WorkerPool {
  workers: Worker[]
  activeJobs: Map<string, { worker: Worker; task: DataProcessingTask }>
  queue: DataProcessingTask[]
  maxWorkers: number
}

export const DEFAULT_WORKER_CONFIG: WorkerConfig = {
  maxConcurrent: 2,
  timeoutMs: 30000,
  retryAttempts: 3,
  enableLogging: false
}

export const WORKER_MESSAGE_TYPES = {
  PROCESS_DATA: 'PROCESS_DATA',
  AGGREGATE_DATA: 'AGGREGATE_DATA',
  FILTER_DATA: 'FILTER_DATA',
  SORT_DATA: 'SORT_DATA',
  TRANSFORM_DATA: 'TRANSFORM_DATA'
} as const

export const WORKER_RESPONSE_TYPES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  PROGRESS: 'PROGRESS'
} as const

export type WorkerMessageType = keyof typeof WORKER_MESSAGE_TYPES
export type WorkerResponseType = keyof typeof WORKER_RESPONSE_TYPES