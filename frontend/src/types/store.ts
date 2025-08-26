// Authentication Types
export interface User {
  id: string
  email: string
  name: string
  customerId: string
  role: 'admin' | 'user' | 'viewer'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  token: string | null
  refreshToken: string | null
}

export interface AuthActions {
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  refreshAuth: () => Promise<void>
  clearError: () => void
  updateUser: (user: Partial<User>) => void
}

export type AuthStore = AuthState & AuthActions

// Customer Types
export interface Customer {
  id: string
  name: string
  subdomain: string
  settings: {
    theme: string
    timezone: string
    currency: string
  }
}

export interface CustomerState {
  currentCustomer: Customer | null
  customers: Customer[]
  isLoading: boolean
  error: string | null
}

export interface CustomerActions {
  setCurrentCustomer: (customer: Customer | null) => void
  loadCustomers: () => Promise<void>
  switchCustomer: (customerId: string) => Promise<void>
  clearCustomerData: () => void
}

export type CustomerStore = CustomerState & CustomerActions

// Dashboard Types
export interface DashboardFilters {
  departments?: string[]
  courseStatus?: string[]
  userGroups?: string[]
}

export interface DateRange {
  start: Date
  end: Date
}

export interface DashboardState {
  metrics: any
  charts: any
  filters: DashboardFilters
  dateRange: DateRange | null
  isLoading: boolean
  error: string | null
  cache: Record<string, any>
  cacheExpiry: Record<string, number>
}

export interface DashboardActions {
  loadMetrics: () => Promise<void>
  updateFilters: (filters: DashboardFilters) => void
  setDateRange: (dateRange: DateRange) => void
  refreshData: () => Promise<void>
  clearDashboard: () => void
  invalidateCache: () => void
}

export type DashboardStore = DashboardState & DashboardActions

// UI Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  notifications: Notification[]
  modals: Record<string, boolean>
  loading: Record<string, boolean>
}

export interface UIActions {
  toggleTheme: () => void
  toggleSidebar: () => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  setLoading: (key: string, loading: boolean) => void
}

export type UIStore = UIState & UIActions

// Chart Component Types
export interface ChartDataPoint {
  x: number | string | Date
  y: number
  label?: string
  id?: string
  metadata?: Record<string, any>
}

export interface ChartDataset {
  id: string
  label: string
  data: ChartDataPoint[]
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ChartTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    grid: string
  }
  fonts: {
    family: string
    size: {
      small: number
      medium: number
      large: number
    }
  }
  spacing: {
    small: number
    medium: number
    large: number
  }
}

export interface AnimationConfig {
  duration: number
  easing: string
  stagger?: number
  delay?: number
  enabled: boolean
}

export interface AccessibilityConfig {
  enabled: boolean
  ariaLabel?: string
  description?: string
  keyboardNavigation: boolean
  screenReaderSupport: boolean
  highContrast: boolean
}

export interface PerformanceConfig {
  enableVirtualization: boolean
  maxDataPoints: number
  enableWebWorkers: boolean
  cacheSize: number
  renderThrottle: number
}

export interface ChartInstance {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'donut'
  data: ChartDataset[]
  dimensions: ChartDimensions
  theme: ChartTheme
  animation: AnimationConfig
  accessibility: AccessibilityConfig
  performance: PerformanceConfig
  isLoading: boolean
  error: string | null
}