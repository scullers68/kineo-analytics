import React, { Suspense, lazy } from 'react'

// Lazy loading chart components to reduce initial bundle size
const BaseChartLazy = lazy(() => import('./BaseChart'))
const ResponsiveChartLazy = lazy(() => import('./ResponsiveChart'))
const AccessibleChartLazy = lazy(() => import('./AccessibleChart'))
const PerformantChartLazy = lazy(() => import('./PerformantChart'))
const AnimatedChartLazy = lazy(() => import('./AnimatedChart'))

interface LazyChartLoaderProps {
  type: 'base' | 'responsive' | 'accessible' | 'performant' | 'animated'
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error }>
  children?: React.ReactNode
  [key: string]: any
}

const DefaultLoadingComponent = () => (
  <div className="chart-loading flex items-center justify-center h-64 bg-gray-100">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">Loading chart...</span>
  </div>
)

const DefaultErrorComponent: React.FC<{ error: Error }> = ({ error }) => (
  <div className="chart-error flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded">
    <div className="text-center">
      <div className="text-red-500 text-xl mb-2">⚠️</div>
      <div className="text-red-700">Failed to load chart</div>
      <div className="text-red-500 text-sm mt-1">{error.message}</div>
    </div>
  </div>
)

export const LazyChartLoader: React.FC<LazyChartLoaderProps> = ({
  type,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  children,
  ...props
}) => {
  const getChartComponent = () => {
    switch (type) {
      case 'base':
        return BaseChartLazy
      case 'responsive':
        return ResponsiveChartLazy
      case 'accessible':
        return AccessibleChartLazy
      case 'performant':
        return PerformantChartLazy
      case 'animated':
        return AnimatedChartLazy
      default:
        return BaseChartLazy
    }
  }

  const ChartComponent = getChartComponent()

  return (
    <Suspense fallback={<LoadingComponent />}>
      <ErrorBoundary ErrorComponent={ErrorComponent}>
        <ChartComponent {...props}>
          {children}
        </ChartComponent>
      </ErrorBoundary>
    </Suspense>
  )
}

// Error boundary for chart loading errors
class ErrorBoundary extends React.Component<
  { 
    children: React.ReactNode
    ErrorComponent: React.ComponentType<{ error: Error }>
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.ErrorComponent error={this.state.error} />
    }

    return this.props.children
  }
}

// Preload utility for better performance
export const preloadChartComponent = (type: LazyChartLoaderProps['type']) => {
  switch (type) {
    case 'base':
      return import('./BaseChart')
    case 'responsive':
      return import('./ResponsiveChart')
    case 'accessible':
      return import('./AccessibleChart')
    case 'performant':
      return import('./PerformantChart')
    case 'animated':
      return import('./AnimatedChart')
    default:
      return import('./BaseChart')
  }
}

// Hook for preloading charts on hover or user intent
export const useChartPreloader = () => {
  const preloadedComponents = React.useRef(new Set<string>())

  const preload = React.useCallback((type: LazyChartLoaderProps['type']) => {
    if (!preloadedComponents.current.has(type)) {
      preloadedComponents.current.add(type)
      preloadChartComponent(type).catch(error => {
        console.warn(`Failed to preload ${type} chart:`, error)
        preloadedComponents.current.delete(type)
      })
    }
  }, [])

  return { preload }
}

export default LazyChartLoader