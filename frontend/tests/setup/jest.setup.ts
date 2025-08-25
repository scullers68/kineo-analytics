/**
 * Jest Setup File for React/TypeScript Testing
 * Configures testing environment for Kineo Analytics frontend
 */

import '@testing-library/jest-dom'

// Global test setup
beforeAll(() => {
  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock ResizeObserver for D3.js visualizations
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock IntersectionObserver for lazy loading components
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock Canvas for D3.js chart testing
  HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    clip: jest.fn(),
    quadraticCurveTo: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  }))

  // Mock WebSocket for real-time features
  global.WebSocket = jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    readyState: WebSocket.CONNECTING,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  }))

  // Mock localStorage for customer context
  const localStorageMock = {
    getItem: jest.fn((key: string) => localStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => { localStorage[key] = value }),
    removeItem: jest.fn((key: string) => { delete localStorage[key] }),
    clear: jest.fn(() => {
      Object.keys(localStorage).forEach(key => delete localStorage[key])
    })
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // Mock environment variables for testing
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
})

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Custom matchers for learning analytics testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidCustomerContext(): R
      toBeWithinPerformanceBudget(budget: number): R
    }
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
          ? `Expected ${JSON.stringify(received)} not to have valid customer context`
          : `Expected ${JSON.stringify(received)} to have valid customer context with customerId matching pattern customer_XXX and customerName`,
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