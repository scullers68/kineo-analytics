/**
 * Mock API Configuration
 * 
 * Centralized configuration for mock API services used during development.
 * Provides control over network simulation, error rates, and service behavior.
 */

export interface MockAPIConfig {
  enabled: boolean;
  delay: number;
  baseURL: string;
  errorRate: number;
}

// Default configuration
const defaultConfig: MockAPIConfig = {
  enabled: process.env.NODE_ENV === 'development',
  delay: 200, // Default network delay in ms
  baseURL: '/api',
  errorRate: 0, // 0% error rate by default
};

// Current configuration state
let currentConfig: MockAPIConfig = { ...defaultConfig };

/**
 * Get current mock API configuration
 */
export const config: MockAPIConfig = currentConfig;

/**
 * Enable mock API services
 */
export const enable = (): void => {
  currentConfig.enabled = true;
};

/**
 * Disable mock API services
 */
export const disable = (): void => {
  currentConfig.enabled = false;
};

/**
 * Set network delay for mock responses
 */
export const setDelay = (delayMs: number): void => {
  currentConfig.delay = Math.max(0, delayMs);
};

/**
 * Set error rate for mock responses (0.0 to 1.0)
 */
export const setErrorRate = (rate: number): void => {
  currentConfig.errorRate = Math.max(0, Math.min(1, rate));
};

/**
 * Update mock API configuration
 */
export const configure = (newConfig: Partial<MockAPIConfig>): void => {
  currentConfig = { ...currentConfig, ...newConfig };
};

/**
 * Reset configuration to defaults
 */
export const reset = (): void => {
  currentConfig = { ...defaultConfig };
};

/**
 * Check if mock API is enabled
 */
export const isEnabled = (): boolean => {
  return currentConfig.enabled && process.env.NODE_ENV !== 'production';
};

/**
 * Default export for CommonJS compatibility
 */
export default {
  config,
  enable,
  disable,
  setDelay,
  setErrorRate,
  configure,
  reset,
  isEnabled,
};