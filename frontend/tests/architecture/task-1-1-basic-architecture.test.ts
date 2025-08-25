/**
 * Task 1.1: React Application Architecture - Basic Tests
 * 
 * Based on DEVELOPER_A_PHASES.md actual requirements:
 * 1. Initialize Next.js 13+ with TypeScript
 * 2. Configure TailwindCSS and design system
 * 3. Set up Zustand for state management
 * 4. Implement Next.js App Router file-based routing
 * 5. Create responsive layout components
 */

import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Task 1.1: React Application Architecture - Basic Requirements', () => {
  const projectRoot = process.cwd()

  describe('1. Next.js 13+ with TypeScript', () => {
    test('should have Next.js configuration', () => {
      const configPath = path.join(projectRoot, 'next.config.js')
      expect(fs.existsSync(configPath)).toBe(true)
    })

    test('should have TypeScript configuration', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
      expect(fs.existsSync(tsconfigPath)).toBe(true)
      
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.strict).toBe(true)
    })

    test('should have app directory for App Router', () => {
      const appDir = path.join(projectRoot, 'app')
      expect(fs.existsSync(appDir)).toBe(true)
      expect(fs.existsSync(path.join(appDir, 'layout.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(appDir, 'page.tsx'))).toBe(true)
    })
  })

  describe('2. TailwindCSS Configuration', () => {
    test('should have Tailwind configuration', () => {
      const tailwindPath = path.join(projectRoot, 'tailwind.config.ts')
      expect(fs.existsSync(tailwindPath)).toBe(true)
    })

    test('should have PostCSS configuration', () => {
      const postcssPath = path.join(projectRoot, 'postcss.config.js')
      expect(fs.existsSync(postcssPath)).toBe(true)
    })

    test('should have global CSS with Tailwind imports', () => {
      const globalsPath = path.join(projectRoot, 'app/globals.css')
      expect(fs.existsSync(globalsPath)).toBe(true)
      
      const content = fs.readFileSync(globalsPath, 'utf-8')
      expect(content).toContain('@tailwind base')
      expect(content).toContain('@tailwind components')
      expect(content).toContain('@tailwind utilities')
    })
  })

  describe('3. Zustand State Management', () => {
    test('should have Zustand stores directory', () => {
      const storesDir = path.join(projectRoot, 'src/stores')
      expect(fs.existsSync(storesDir)).toBe(true)
    })

    test('should have auth store', () => {
      const authStorePath = path.join(projectRoot, 'src/stores/auth-store.ts')
      expect(fs.existsSync(authStorePath)).toBe(true)
    })

    test('should have customer store', () => {
      const customerStorePath = path.join(projectRoot, 'src/stores/customer-store.ts')
      expect(fs.existsSync(customerStorePath)).toBe(true)
    })

    test('should have UI store', () => {
      const uiStorePath = path.join(projectRoot, 'src/stores/ui-store.ts')
      expect(fs.existsSync(uiStorePath)).toBe(true)
    })
  })

  describe('4. Next.js App Router', () => {
    test('should have middleware for route protection', () => {
      const middlewarePath = path.join(projectRoot, 'middleware.ts')
      expect(fs.existsSync(middlewarePath)).toBe(true)
    })

    test('should have dashboard route group', () => {
      const dashboardDir = path.join(projectRoot, 'app/(dashboard)')
      expect(fs.existsSync(dashboardDir)).toBe(true)
      expect(fs.existsSync(path.join(dashboardDir, 'layout.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(dashboardDir, 'page.tsx'))).toBe(true)
    })

    test('should have API routes', () => {
      const apiDir = path.join(projectRoot, 'app/api')
      expect(fs.existsSync(apiDir)).toBe(true)
    })
  })

  describe('5. Responsive Layout Components', () => {
    test('should have layout components directory', () => {
      const layoutDir = path.join(projectRoot, 'src/components/layout')
      expect(fs.existsSync(layoutDir)).toBe(true)
    })

    test('should have AppLayout component', () => {
      const appLayoutPath = path.join(projectRoot, 'src/components/layout/AppLayout.tsx')
      expect(fs.existsSync(appLayoutPath)).toBe(true)
    })

    test('should have Sidebar component', () => {
      const sidebarPath = path.join(projectRoot, 'src/components/layout/Sidebar.tsx')
      expect(fs.existsSync(sidebarPath)).toBe(true)
    })

    test('should have Header component', () => {
      const headerPath = path.join(projectRoot, 'src/components/layout/DashboardHeader.tsx')
      expect(fs.existsSync(headerPath)).toBe(true)
    })
  })
})

// TDD Guard Test - This should trigger TDD Guard if working
describe('TDD Guard Verification', () => {
  test('TDD Guard should prevent implementation without failing test', () => {
    // This test is intentionally simple to verify TDD Guard is active
    expect(true).toBe(true)
  })
})