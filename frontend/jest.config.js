const path = require('path')

// Don't use Next.js Jest for JSX transformation as it causes issues
// const createJestConfig = nextJest({
//   dir: './',
// })

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testEnvironment: 'jsdom',
  
  // TDD Guard Jest Reporter Configuration
  reporters: [
    'default',
    [
      'tdd-guard-jest',
      {
        projectRoot: __dirname,
      },
    ],
  ],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,ts,tsx}'
  ],

  // Module name mapping for path aliases and extensions
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@/stores/(.*)$': '<rootDir>/src/stores/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/types/**',
    '!src/constants/**',
    '!src/**/*.d.ts',
    '!src/**/*.config.*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Transform configuration for TypeScript and JSX
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.jest.js' }]
  },
  
  // Configure babel to handle JSX properly
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$))'
  ],

  // Test environment setup
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
}

// Export the custom Jest config directly
module.exports = customJestConfig