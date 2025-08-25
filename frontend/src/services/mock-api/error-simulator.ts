/**
 * Mock Error Simulator
 * 
 * Provides controlled error simulation for testing error handling,
 * including authentication errors, network timeouts, and data corruption.
 */

export interface ErrorSimulatorConfig {
  authErrorRate: number;
  networkErrorRate: number;
  dataErrorRate: number;
  globalErrorRate: number;
  simulateTimeout: boolean;
  simulateExpiredTokens: boolean;
  missingDataServices: Set<string>;
  corruptedData: boolean;
}

class ErrorSimulatorClass {
  private config: ErrorSimulatorConfig = {
    authErrorRate: 0,
    networkErrorRate: 0,
    dataErrorRate: 0,
    globalErrorRate: 0,
    simulateTimeout: false,
    simulateExpiredTokens: false,
    missingDataServices: new Set(),
    corruptedData: false,
  };

  /**
   * Set error rate for authentication operations
   */
  setErrorRate(service: 'auth' | 'network' | 'data', rate: number): void {
    rate = Math.max(0, Math.min(1, rate));
    
    switch (service) {
      case 'auth':
        this.config.authErrorRate = rate;
        break;
      case 'network':
        this.config.networkErrorRate = rate;
        break;
      case 'data':
        this.config.dataErrorRate = rate;
        break;
    }
  }

  /**
   * Set global error rate affecting all services
   */
  setGlobalErrorRate(rate: number): void {
    this.config.globalErrorRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Enable/disable timeout simulation
   */
  simulateTimeout(enabled: boolean): void {
    this.config.simulateTimeout = enabled;
  }

  /**
   * Enable/disable expired token simulation
   */
  simulateExpiredToken(): void {
    this.config.simulateExpiredTokens = true;
  }

  /**
   * Simulate missing data for specific services
   */
  simulateMissingData(service: string): void {
    this.config.missingDataServices.add(service);
  }

  /**
   * Enable/disable corrupted data simulation
   */
  simulateCorruptedData(enabled: boolean): void {
    this.config.corruptedData = enabled;
  }

  /**
   * Check if authentication error should be simulated
   */
  shouldSimulateError(service: 'auth' | 'network' | 'data'): boolean {
    if (this.shouldSimulateGlobalError()) {
      return true;
    }

    switch (service) {
      case 'auth':
        return Math.random() < this.config.authErrorRate;
      case 'network':
        return Math.random() < this.config.networkErrorRate;
      case 'data':
        return Math.random() < this.config.dataErrorRate;
      default:
        return false;
    }
  }

  /**
   * Check if global error should be simulated
   */
  shouldSimulateGlobalError(): boolean {
    return Math.random() < this.config.globalErrorRate;
  }

  /**
   * Check if timeout should be simulated
   */
  get shouldSimulateTimeout(): boolean {
    return this.config.simulateTimeout;
  }

  /**
   * Check if token expiration should be simulated
   */
  get isTokenExpired(): boolean {
    return this.config.simulateExpiredTokens;
  }

  /**
   * Check if missing data should be simulated for service
   */
  isMissingData(service: string): boolean {
    return this.config.missingDataServices.has(service);
  }

  /**
   * Check if corrupted data should be simulated
   */
  get isCorruptedData(): boolean {
    return this.config.corruptedData;
  }

  /**
   * Reset all error simulations
   */
  reset(): void {
    this.config = {
      authErrorRate: 0,
      networkErrorRate: 0,
      dataErrorRate: 0,
      globalErrorRate: 0,
      simulateTimeout: false,
      simulateExpiredTokens: false,
      missingDataServices: new Set(),
      corruptedData: false,
    };
  }

  /**
   * Simulate specific HTTP error codes
   */
  simulateHttpError(statusCode: number, message?: string): Error {
    const errorMessages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    const errorMessage = message || errorMessages[statusCode] || 'Unknown Error';
    const error = new Error(errorMessage) as Error & { status: number };
    error.status = statusCode;
    return error;
  }

  /**
   * Simulate network connectivity issues
   */
  simulateNetworkError(): Error {
    const networkErrors = [
      'Network request failed',
      'Connection timeout',
      'DNS resolution failed',
      'SSL handshake failed',
      'Connection refused',
    ];

    return new Error(networkErrors[Math.floor(Math.random() * networkErrors.length)]);
  }

  /**
   * Simulate intermittent service availability
   */
  simulateServiceUnavailable(): Error {
    return this.simulateHttpError(503, 'Service temporarily unavailable');
  }

  /**
   * Simulate rate limiting
   */
  simulateRateLimit(): Error {
    return this.simulateHttpError(429, 'Rate limit exceeded');
  }

  /**
   * Simulate validation errors
   */
  simulateValidationError(field: string): Error {
    return this.simulateHttpError(422, `Validation failed for field: ${field}`);
  }

  /**
   * Get current configuration for debugging
   */
  getConfig(): ErrorSimulatorConfig {
    return { ...this.config };
  }

  /**
   * Enable common error scenarios for testing
   */
  enableTestingMode(): void {
    this.config.authErrorRate = 0.1; // 10% auth errors
    this.config.networkErrorRate = 0.05; // 5% network errors
    this.config.dataErrorRate = 0.05; // 5% data errors
    this.config.simulateTimeout = false; // Don't timeout by default
    this.config.simulateExpiredTokens = false; // Don't expire tokens by default
  }

  /**
   * Enable chaos mode for stress testing
   */
  enableChaosMode(): void {
    this.config.authErrorRate = 0.3; // 30% auth errors
    this.config.networkErrorRate = 0.2; // 20% network errors
    this.config.dataErrorRate = 0.15; // 15% data errors
    this.config.globalErrorRate = 0.1; // 10% global errors
    this.config.simulateTimeout = Math.random() > 0.5; // Random timeout
    this.config.corruptedData = Math.random() > 0.7; // 30% chance of corrupted data
  }
}

// Export singleton instance
export const MockErrorSimulator = new ErrorSimulatorClass();

// Make it globally available for easy access in tests
if (typeof window !== 'undefined') {
  (window as any).MockErrorSimulator = MockErrorSimulator;
} else if (typeof global !== 'undefined') {
  (global as any).MockErrorSimulator = MockErrorSimulator;
}

// Export for both ES modules and CommonJS
export default MockErrorSimulator;