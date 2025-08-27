/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { VitestReporter } from 'tdd-guard-vitest'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    css: true,
    reporters: ['default', new VitestReporter(path.resolve(__dirname))],
    // Resource management and timeouts
    testTimeout: 15000, // 15 seconds per test
    hookTimeout: 10000, // 10 seconds for setup/teardown
    teardownTimeout: 5000, // 5 seconds for cleanup
    // Limit parallelism to prevent memory issues
    maxConcurrency: 3, // Run max 3 tests simultaneously
    minWorkers: 1,
    maxWorkers: 3,
    // Process pool configuration
    pool: 'forks', // Use forks instead of threads for better isolation
    poolOptions: {
      forks: {
        isolate: true, // Isolate each test file
        singleFork: false,
        minForks: 1,
        maxForks: 3
      }
    },
    // Modern dependency configuration
    server: {
      deps: {
        external: []
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/types/**',
        'src/constants/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,ts,tsx}',
      'src/**/*.{test,spec}.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      '.next/'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/assets': path.resolve(__dirname, 'src/assets')
    }
  },
  // Development server configuration for frontend development
  server: {
    port: 3000,
    host: true
  }
})