/**
 * Next.js 13+ Configuration Validation Tests
 * RED Phase: These tests will fail initially and guide our Next.js setup implementation
 * 
 * Tests ensure proper Next.js 13+ setup with:
 * - App Router architecture
 * - TypeScript configuration
 * - Environment configuration
 * - Performance optimizations
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import { existsSync } from 'fs'
import { join } from 'path'

describe('Next.js 13+ Configuration Architecture', () => {
  const projectRoot = process.cwd()
  
  describe('Core Configuration Files', () => {
    test('should have next.config.js with TypeScript and performance optimizations', () => {
      const nextConfigPath = join(projectRoot, 'next.config.js')
      expect(existsSync(nextConfigPath)).toBe(true)
      
      // This will fail - we need to create next.config.js
      const nextConfig = require(nextConfigPath)
      
      expect(nextConfig).toHaveProperty('typescript')
      expect(nextConfig.typescript.ignoreBuildErrors).toBe(false)
      expect(nextConfig).toHaveProperty('experimental')
      expect(nextConfig.experimental.appDir).toBe(true)
      expect(nextConfig).toHaveProperty('images')
      expect(nextConfig.images.domains).toContain('localhost')
    })

    test('should have tsconfig.json configured for Next.js 13+ App Router', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json')
      expect(existsSync(tsconfigPath)).toBe(true)
      
      // This will fail - we need proper tsconfig.json
      const tsconfig = require(tsconfigPath)
      
      expect(tsconfig.compilerOptions.target).toBe('ES2017')
      expect(tsconfig.compilerOptions.lib).toContain('dom')
      expect(tsconfig.compilerOptions.lib).toContain('dom.iterable')
      expect(tsconfig.compilerOptions.allowJs).toBe(true)
      expect(tsconfig.compilerOptions.skipLibCheck).toBe(true)
      expect(tsconfig.compilerOptions.strict).toBe(true)
      expect(tsconfig.compilerOptions.noEmit).toBe(true)
      expect(tsconfig.compilerOptions.esModuleInterop).toBe(true)
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler')
      expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true)
      expect(tsconfig.compilerOptions.isolatedModules).toBe(true)
      expect(tsconfig.compilerOptions.jsx).toBe('preserve')
      expect(tsconfig.compilerOptions.incremental).toBe(true)
      expect(tsconfig.compilerOptions.plugins).toEqual([
        { "name": "next" }
      ])
      expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*')
      expect(tsconfig.include).toContain('next-env.d.ts')
      expect(tsconfig.include).toContain('.next/types/**/*.ts')
      expect(tsconfig.exclude).toContain('node_modules')
    })

    test('should have proper package.json scripts for Next.js 13+', () => {
      const packageJsonPath = join(projectRoot, 'package.json')
      expect(existsSync(packageJsonPath)).toBe(true)
      
      const packageJson = require(packageJsonPath)
      
      expect(packageJson.scripts.dev).toBe('next dev')
      expect(packageJson.scripts.build).toBe('next build')
      expect(packageJson.scripts.start).toBe('next start')
      expect(packageJson.scripts.lint).toBe('next lint')
      
      // Verify Next.js version
      expect(packageJson.dependencies.next).toMatch(/^\^14\./)
    })
  })

  describe('App Router Architecture', () => {
    test('should have app directory structure for Next.js 13+ App Router', () => {
      const appDir = join(projectRoot, 'app')
      expect(existsSync(appDir)).toBe(true)
      
      // This will fail - we need to create app directory structure
      const layoutPath = join(appDir, 'layout.tsx')
      const pagePath = join(appDir, 'page.tsx')
      const loadingPath = join(appDir, 'loading.tsx')
      const errorPath = join(appDir, 'error.tsx')
      const notFoundPath = join(appDir, 'not-found.tsx')
      
      expect(existsSync(layoutPath)).toBe(true)
      expect(existsSync(pagePath)).toBe(true)
      expect(existsSync(loadingPath)).toBe(true)
      expect(existsSync(errorPath)).toBe(true)
      expect(existsSync(notFoundPath)).toBe(true)
    })

    test('should have globals.css configured with TailwindCSS directives', () => {
      const globalsPath = join(projectRoot, 'app', 'globals.css')
      expect(existsSync(globalsPath)).toBe(true)
      
      // This will fail - we need to create globals.css with Tailwind
      const fs = require('fs')
      const globalsContent = fs.readFileSync(globalsPath, 'utf8')
      
      expect(globalsContent).toContain('@tailwind base;')
      expect(globalsContent).toContain('@tailwind components;')
      expect(globalsContent).toContain('@tailwind utilities;')
    })

    test('should have metadata configuration in root layout', async () => {
      const layoutPath = join(projectRoot, 'app', 'layout.tsx')
      expect(existsSync(layoutPath)).toBe(true)
      
      // This will fail - we need proper layout.tsx
      const fs = require('fs')
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      
      expect(layoutContent).toContain('export const metadata')
      expect(layoutContent).toContain('title:')
      expect(layoutContent).toContain('description:')
      expect(layoutContent).toMatch(/Kineo Analytics/i)
    })
  })

  describe('Environment Configuration', () => {
    test('should have environment variables configuration', () => {
      const envLocalExample = join(projectRoot, '.env.local.example')
      const envExample = join(projectRoot, '.env.example')
      
      // At least one should exist
      const hasEnvConfig = existsSync(envLocalExample) || existsSync(envExample)
      expect(hasEnvConfig).toBe(true)
      
      // This will fail - we need environment configuration
      const fs = require('fs')
      const envPath = existsSync(envLocalExample) ? envLocalExample : envExample
      const envContent = fs.readFileSync(envPath, 'utf8')
      
      expect(envContent).toContain('NEXT_PUBLIC_API_URL')
      expect(envContent).toContain('NEXT_PUBLIC_ENVIRONMENT')
    })

    test('should have next-env.d.ts for Next.js type definitions', () => {
      const nextEnvPath = join(projectRoot, 'next-env.d.ts')
      expect(existsSync(nextEnvPath)).toBe(true)
      
      // This will fail - Next.js should generate this file
      const fs = require('fs')
      const nextEnvContent = fs.readFileSync(nextEnvPath, 'utf8')
      
      expect(nextEnvContent).toContain('/// <reference types="next" />')
      expect(nextEnvContent).toContain('/// <reference types="next/image-types/global" />')
    })
  })

  describe('Performance and Build Configuration', () => {
    test('should have proper ESLint configuration for Next.js', () => {
      const eslintConfigPath = join(projectRoot, '.eslintrc.json')
      expect(existsSync(eslintConfigPath)).toBe(true)
      
      // This will fail - we need proper ESLint config
      const eslintConfig = require(eslintConfigPath)
      
      expect(eslintConfig.extends).toContain('next/core-web-vitals')
      expect(eslintConfig).toHaveProperty('rules')
    })

    test('should configure bundle analyzer for performance monitoring', () => {
      const packageJsonPath = join(projectRoot, 'package.json')
      const packageJson = require(packageJsonPath)
      
      // This will fail - we need bundle analyzer
      expect(packageJson.devDependencies).toHaveProperty('@next/bundle-analyzer')
      expect(packageJson.scripts).toHaveProperty('analyze')
      expect(packageJson.scripts.analyze).toMatch(/bundle-analyzer/)
    })

    test('should have Tailwind and PostCSS configuration', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const postcssConfigPath = join(projectRoot, 'postcss.config.js')
      
      expect(existsSync(tailwindConfigPath)).toBe(true)
      expect(existsSync(postcssConfigPath)).toBe(true)
      
      // These will fail - we need proper configurations
      const tailwindConfig = require(tailwindConfigPath)
      const postcssConfig = require(postcssConfigPath)
      
      expect(tailwindConfig.content).toContain('./app/**/*.{js,ts,jsx,tsx,mdx}')
      expect(postcssConfig.plugins.tailwindcss).toBeDefined()
      expect(postcssConfig.plugins.autoprefixer).toBeDefined()
    })
  })

  describe('TypeScript Integration', () => {
    test('should have proper TypeScript strict mode configuration', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json')
      const tsconfig = require(tsconfigPath)
      
      // Strict TypeScript settings for enterprise application
      expect(tsconfig.compilerOptions.strict).toBe(true)
      expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true)
      expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true)
      expect(tsconfig.compilerOptions.noImplicitReturns).toBe(true)
      expect(tsconfig.compilerOptions.noFallthroughCasesInSwitch).toBe(true)
    })

    test('should have type definitions for global modules', () => {
      const globalTypesPath = join(projectRoot, 'types', 'global.d.ts')
      expect(existsSync(globalTypesPath)).toBe(true)
      
      // This will fail - we need global type definitions
      const fs = require('fs')
      const globalTypesContent = fs.readFileSync(globalTypesPath, 'utf8')
      
      expect(globalTypesContent).toContain('declare global')
      expect(globalTypesContent).toMatch(/Window/i)
    })
  })
})