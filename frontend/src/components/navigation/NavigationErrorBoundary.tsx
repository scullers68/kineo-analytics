'use client'

import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react'

interface NavigationError {
  type: 'missing_data' | 'invalid_level' | 'navigation_failed' | 'unknown'
  message: string
  level?: string
  targetId?: string
  timestamp: Date
}

interface NavigationErrorBoundaryState {
  hasError: boolean
  error: NavigationError | null
  errorId: string
}

interface NavigationErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: NavigationError, retry: () => void) => ReactNode
  onError?: (error: NavigationError) => void
  enableRetry?: boolean
}

class NavigationErrorBoundary extends Component<NavigationErrorBoundaryProps, NavigationErrorBoundaryState> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    // Classify the error type
    const getErrorType = (error: Error): NavigationError['type'] => {
      const message = error.message.toLowerCase()
      
      if (message.includes('missing') || message.includes('not found')) {
        return 'missing_data'
      }
      if (message.includes('invalid') || message.includes('level')) {
        return 'invalid_level'
      }
      if (message.includes('navigation') || message.includes('drill')) {
        return 'navigation_failed'
      }
      return 'unknown'
    }

    const navigationError: NavigationError = {
      type: getErrorType(error),
      message: error.message,
      timestamp: new Date()
    }

    return {
      hasError: true,
      error: navigationError,
      errorId: `nav-error-${Date.now()}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('Navigation Error Boundary caught an error:', {
      error: error.message,
      errorInfo: errorInfo.componentStack,
      timestamp: new Date(),
      errorId: this.state.errorId
    })

    // Call error callback if provided
    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error)
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: ''
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      // Default error UI
      return <DefaultNavigationErrorFallback 
        error={this.state.error} 
        onRetry={this.props.enableRetry !== false ? this.retry : undefined}
      />
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultNavigationErrorFallbackProps {
  error: NavigationError
  onRetry?: () => void
}

const DefaultNavigationErrorFallback: React.FC<DefaultNavigationErrorFallbackProps> = ({
  error,
  onRetry
}) => {
  const getErrorMessage = (error: NavigationError): string => {
    switch (error.type) {
      case 'missing_data':
        return 'Navigation data is not available at this level. Please try navigating to a different section.'
      case 'invalid_level':
        return 'Invalid navigation level. Please use the breadcrumb to return to a valid level.'
      case 'navigation_failed':
        return 'Navigation failed. Please try again or contact support if the problem persists.'
      default:
        return 'An unexpected navigation error occurred. Please try again.'
    }
  }

  const getErrorIcon = (error: NavigationError): string => {
    switch (error.type) {
      case 'missing_data':
        return '📂'
      case 'invalid_level':
        return '🗺️'
      case 'navigation_failed':
        return '🧭'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 min-h-48">
      <div className="text-4xl mb-4">{getErrorIcon(error)}</div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Navigation Error
      </h3>
      
      <p className="text-gray-600 text-center mb-4 max-w-md">
        {getErrorMessage(error)}
      </p>

      <div className="text-sm text-gray-400 mb-4">
        Error ID: {error.timestamp.getTime()}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// Hook to manually trigger navigation errors for error testing
export const useNavigationError = () => {
  const [error, setError] = useState<NavigationError | null>(null)

  const triggerError = useCallback((errorType: NavigationError['type'], message: string) => {
    const navigationError: NavigationError = {
      type: errorType,
      message,
      timestamp: new Date()
    }
    setError(navigationError)
    throw new Error(message)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    triggerError,
    clearError
  }
}

export { NavigationErrorBoundary }
export type { NavigationError, NavigationErrorBoundaryProps }