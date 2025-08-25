/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    css: true,
    reporters: [
      'default',
      ['tdd-guard-vitest', {
        // TDD Guard configuration for enforcing test-first development
        hookUrl: 'http://localhost:3001/hook', // Default Claude Code hook URL
        enforcementLevel: 'strict', // 'strict' | 'moderate' | 'lenient'
        ignorePatterns: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
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
          'tailwind.config.js'
        ]
      }]
    ],
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