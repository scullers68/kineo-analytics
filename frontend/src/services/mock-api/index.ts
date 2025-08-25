/**
 * Mock API Manager
 * 
 * Unified entry point for all mock API services, providing centralized
 * configuration, initialization, and service management.
 */

import { MockAuthService } from './auth-service';
import { MockCustomerService } from './customer-service';
import { MockAnalyticsService } from './analytics-service';
import { MockDataGenerator } from './data-generator';
import { MockAPIInterceptor } from './interceptor';
import { MockErrorSimulator } from './error-simulator';
import { MockLoadingSimulator } from './loading-simulator';
import { config, configure, enable, disable, setDelay, setErrorRate, reset, isEnabled } from './config';

export interface MockAPIManagerConfig {
  enabled?: boolean;
  delay?: number;
  errorRate?: number;
  baseURL?: string;
}

class MockAPIManagerClass {
  private _auth: MockAuthService | null = null;
  private _customer: MockCustomerService | null = null;
  private _analytics: MockAnalyticsService | null = null;
  private _dataGenerator: MockDataGenerator | null = null;
  private _isInitialized = false;

  /**
   * Get authentication service instance
   */
  get auth(): MockAuthService {
    if (!this._auth) {
      this._auth = new MockAuthService();
    }
    return this._auth;
  }

  /**
   * Get customer service instance
   */
  get customer(): MockCustomerService {
    if (!this._customer) {
      this._customer = new MockCustomerService();
    }
    return this._customer;
  }

  /**
   * Get analytics service instance
   */
  get analytics(): MockAnalyticsService {
    if (!this._analytics) {
      this._analytics = new MockAnalyticsService();
    }
    return this._analytics;
  }

  /**
   * Get data generator instance
   */
  get dataGenerator(): MockDataGenerator {
    if (!this._dataGenerator) {
      this._dataGenerator = new MockDataGenerator();
    }
    return this._dataGenerator;
  }

  /**
   * Get current configuration
   */
  get config() {
    return config;
  }

  /**
   * Check if manager is initialized
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Configure mock API settings
   */
  configure(newConfig: MockAPIManagerConfig): void {
    configure(newConfig);
    
    // Update global simulators if configured
    if (typeof window !== 'undefined') {
      const errorSimulator = (window as any).MockErrorSimulator;
      const loadingSimulator = (window as any).MockLoadingSimulator;
      
      if (errorSimulator && newConfig.errorRate !== undefined) {
        errorSimulator.setGlobalErrorRate(newConfig.errorRate);
      }
      
      if (loadingSimulator && newConfig.delay !== undefined) {
        loadingSimulator.setGlobalDelay(newConfig.delay);
      }
    }
  }

  /**
   * Initialize all mock services
   */
  initialize(): void {
    if (this._isInitialized) {
      return;
    }

    // Only initialize in development mode
    if (!isEnabled()) {
      console.warn('Mock API services are disabled in production');
      return;
    }

    // Initialize services
    this._auth = new MockAuthService();
    this._customer = new MockCustomerService();
    this._analytics = new MockAnalyticsService();
    this._dataGenerator = new MockDataGenerator();

    // Install interceptors
    if (typeof window !== 'undefined') {
      MockAPIInterceptor.install();
    }

    this._isInitialized = true;

    console.log('Mock API services initialized:', {
      enabled: config.enabled,
      delay: config.delay,
      errorRate: config.errorRate,
      baseURL: config.baseURL,
    });
  }

  /**
   * Cleanup and reset all services
   */
  cleanup(): void {
    // Uninstall interceptors
    if (typeof window !== 'undefined') {
      MockAPIInterceptor.uninstall();
    }

    // Reset simulators
    MockErrorSimulator.reset();
    MockLoadingSimulator.reset();

    // Reset configuration
    reset();

    // Clear service instances
    this._auth = null;
    this._customer = null;
    this._analytics = null;
    this._dataGenerator = null;
    this._isInitialized = false;

    console.log('Mock API services cleaned up');
  }

  /**
   * Enable mock API services
   */
  enable(): void {
    enable();
    if (!this._isInitialized) {
      this.initialize();
    }
  }

  /**
   * Disable mock API services
   */
  disable(): void {
    disable();
    this.cleanup();
  }

  /**
   * Set network delay for all services
   */
  setDelay(delayMs: number): void {
    setDelay(delayMs);
    MockLoadingSimulator.setGlobalDelay(delayMs);
  }

  /**
   * Set error rate for all services
   */
  setErrorRate(rate: number): void {
    setErrorRate(rate);
    MockErrorSimulator.setGlobalErrorRate(rate);
  }

  /**
   * Enable testing mode with common error scenarios
   */
  enableTestingMode(): void {
    MockErrorSimulator.enableTestingMode();
    MockLoadingSimulator.enableRealisticMode();
    this.configure({
      enabled: true,
      delay: 300,
      errorRate: 0.05, // 5% error rate
    });
  }

  /**
   * Enable development mode with fast responses
   */
  enableDevelopmentMode(): void {
    MockErrorSimulator.reset();
    MockLoadingSimulator.enableFastMode();
    this.configure({
      enabled: true,
      delay: 100,
      errorRate: 0, // No errors in dev mode
    });
  }

  /**
   * Enable chaos mode for stress testing
   */
  enableChaosMode(): void {
    MockErrorSimulator.enableChaosMode();
    MockLoadingSimulator.enableRealisticMode();
    this.configure({
      enabled: true,
      delay: 500,
      errorRate: 0.2, // 20% error rate
    });
  }

  /**
   * Get service status information
   */
  getStatus(): {
    isInitialized: boolean;
    isEnabled: boolean;
    config: typeof config;
    interceptorActive: boolean;
    services: {
      auth: boolean;
      customer: boolean;
      analytics: boolean;
      dataGenerator: boolean;
    };
  } {
    return {
      isInitialized: this._isInitialized,
      isEnabled: isEnabled(),
      config: { ...config },
      interceptorActive: MockAPIInterceptor.isActive,
      services: {
        auth: this._auth !== null,
        customer: this._customer !== null,
        analytics: this._analytics !== null,
        dataGenerator: this._dataGenerator !== null,
      },
    };
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(customerId: string = 'customer001') {
    return this.dataGenerator.generateAnalyticsData(customerId);
  }

  /**
   * Reset all data and state
   */
  resetData(): void {
    if (this._dataGenerator) {
      this._dataGenerator.simulateCorruptedData(false);
    }
    MockErrorSimulator.reset();
    MockLoadingSimulator.reset();
  }
}

// Export singleton instance
export const MockAPIManager = new MockAPIManagerClass();

// Export individual services for direct access
export {
  MockAuthService,
  MockCustomerService,
  MockAnalyticsService,
  MockDataGenerator,
  MockAPIInterceptor,
  MockErrorSimulator,
  MockLoadingSimulator,
};

// Export configuration utilities
export {
  config,
  configure,
  enable,
  disable,
  setDelay,
  setErrorRate,
  reset,
  isEnabled,
};

// Auto-initialize in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  MockAPIManager.initialize();
}

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).MockAPIManager = MockAPIManager;
} else if (typeof global !== 'undefined') {
  (global as any).MockAPIManager = MockAPIManager;
}

// Default export
export default MockAPIManager;