const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testEnvironment: 'jsdom',
  
  // TDD Guard Jest Reporter Configuration
  reporters: [
    'default',
    ['tdd-guard-jest', {
      // TDD Guard configuration for enforcing test-first development
      hookUrl: 'http://localhost:3001/hook', // Default Claude Code hook URL
      enforcementLevel: 'strict', // 'strict' | 'moderate' | 'lenient'
      ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts'
      ],
      // Project-specific configuration
      projectRoot: path.resolve(__dirname),
      testDirectory: path.resolve(__dirname, 'tests'),
      sourceDirectory: path.resolve(__dirname, 'src'),
      // React/TypeScript specific settings
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      testExtensions: ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
      // TDD enforcement rules
      requireTestsForNewCode: true,
      requireFailingTestFirst: true,
      preventOverImplementation: true,
      // Learning analytics platform specific ignores
      skipTddFor: [
        'src/types/api.ts', // Type definitions
        'src/constants/**', // Constants
        'src/assets/**', // Static assets
        'next.config.js',
        'tailwind.config.js',
        'jest.config.js'
      ]
    }]
  ],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,ts,tsx}'
  ],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
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
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

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

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)