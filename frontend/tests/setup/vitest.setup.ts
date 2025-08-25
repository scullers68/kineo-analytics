/**
 * Vitest Setup File for React/TypeScript Testing
 * Configures testing environment for Kineo Analytics frontend
 */

import { expect, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with React Testing Library matchers
expect.extend(matchers)

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Global test setup
beforeAll(() => {
  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock ResizeObserver for D3.js visualizations
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver for lazy loading components
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock Canvas for D3.js chart testing
  HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => ({ data: new Array(4) }),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    clip: () => {},
    quadraticCurveTo: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
  } as any)

  // Mock WebSocket for real-time features
  global.WebSocket = class WebSocket {
    constructor() {}
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  } as any

  // Mock localStorage for customer context
  const localStorageMock = {
    getItem: (key: string) => localStorage[key] || null,
    setItem: (key: string, value: string) => { localStorage[key] = value },
    removeItem: (key: string) => { delete localStorage[key] },
    clear: () => {
      Object.keys(localStorage).forEach(key => delete localStorage[key])
    }
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // Mock environment variables for testing
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
})

// Custom matchers for learning analytics testing
declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveValidCustomerContext(): T
    toBeWithinPerformanceBudget(budget: number): T
  }
}

expect.extend({
  toHaveValidCustomerContext(received) {
    const pass = received && 
                 typeof received.customerId === 'string' &&
                 received.customerId.match(/^customer_\d{3}$/) &&
                 typeof received.customerName === 'string'
    
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to have valid customer context`
          : `Expected ${received} to have valid customer context with customerId and customerName`,
      pass,
    }
  },
  
  toBeWithinPerformanceBudget(received, budget) {
    const pass = typeof received === 'number' && received <= budget
    
    return {
      message: () =>
        pass
          ? `Expected ${received}ms to exceed performance budget of ${budget}ms`
          : `Expected ${received}ms to be within performance budget of ${budget}ms`,
      pass,
    }
  }
})