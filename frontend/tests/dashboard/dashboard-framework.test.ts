/**
 * Tests for Task 1.3 Dashboard Framework Foundation
 * RED phase - creating failing tests first
 */

import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../..')

describe('Task 1.3: Dashboard Framework Foundation', () => {
  describe('1. Responsive Dashboard Layout System', () => {
    test('should have dashboard layout component', () => {
      const dashboardLayoutPath = path.join(projectRoot, 'src/components/dashboard/DashboardLayout.tsx')
      expect(fs.existsSync(dashboardLayoutPath)).toBe(true)
    })

    test('should have grid system for dashboard widgets', () => {
      const gridSystemPath = path.join(projectRoot, 'src/components/dashboard/DashboardGrid.tsx')
      expect(fs.existsSync(gridSystemPath)).toBe(true)
    })

    test('should have widget container component', () => {
      const widgetContainerPath = path.join(projectRoot, 'src/components/dashboard/WidgetContainer.tsx')
      expect(fs.existsSync(widgetContainerPath)).toBe(true)
    })
  })

  describe('2. Reusable Component Library Structure', () => {
    test('should have components organized by categories', () => {
      const uiComponentsPath = path.join(projectRoot, 'src/components/ui')
      expect(fs.existsSync(uiComponentsPath)).toBe(true)
    })

    test('should have common UI components', () => {
      const buttonPath = path.join(projectRoot, 'src/components/ui/Button.tsx')
      const cardPath = path.join(projectRoot, 'src/components/ui/Card.tsx')
      const modalPath = path.join(projectRoot, 'src/components/ui/Modal.tsx')
      
      expect(fs.existsSync(buttonPath)).toBe(true)
      expect(fs.existsSync(cardPath)).toBe(true)
      expect(fs.existsSync(modalPath)).toBe(true)
    })

    test('should have component library index file', () => {
      const indexPath = path.join(projectRoot, 'src/components/ui/index.ts')
      expect(fs.existsSync(indexPath)).toBe(true)
    })
  })

  describe('3. Theme Switching (Light/Dark Mode)', () => {
    test('should have theme provider component', () => {
      const themeProviderPath = path.join(projectRoot, 'src/components/theme/ThemeProvider.tsx')
      expect(fs.existsSync(themeProviderPath)).toBe(true)
    })

    test('should have theme toggle component', () => {
      const themeTogglePath = path.join(projectRoot, 'src/components/theme/ThemeToggle.tsx')
      expect(fs.existsSync(themeTogglePath)).toBe(true)
    })

    test('should have theme store for state management', () => {
      const themeStorePath = path.join(projectRoot, 'src/stores/theme-store.ts')
      expect(fs.existsSync(themeStorePath)).toBe(true)
    })
  })

  describe('4. Navigation and Sidebar Components', () => {
    test('should have main navigation component', () => {
      const mainNavPath = path.join(projectRoot, 'src/components/navigation/MainNavigation.tsx')
      expect(fs.existsSync(mainNavPath)).toBe(true)
    })

    test('should have breadcrumb navigation', () => {
      const breadcrumbPath = path.join(projectRoot, 'src/components/navigation/Breadcrumb.tsx')
      expect(fs.existsSync(breadcrumbPath)).toBe(true)
    })

    test('should have collapsible sidebar', () => {
      const collapsibleSidebarPath = path.join(projectRoot, 'src/components/navigation/CollapsibleSidebar.tsx')
      expect(fs.existsSync(collapsibleSidebarPath)).toBe(true)
    })
  })

  describe('5. Responsive Breakpoint Management', () => {
    test('should have breakpoint utilities', () => {
      const breakpointUtilsPath = path.join(projectRoot, 'src/utils/breakpoints.ts')
      expect(fs.existsSync(breakpointUtilsPath)).toBe(true)
    })

    test('should have responsive hook for breakpoints', () => {
      const useBreakpointPath = path.join(projectRoot, 'src/hooks/useBreakpoint.ts')
      expect(fs.existsSync(useBreakpointPath)).toBe(true)
    })

    test('should have mobile-first responsive configuration', () => {
      const tailwindConfig = path.join(projectRoot, 'tailwind.config.ts')
      expect(fs.existsSync(tailwindConfig)).toBe(true)
      
      // Check if config includes proper breakpoints
      if (fs.existsSync(tailwindConfig)) {
        const configContent = fs.readFileSync(tailwindConfig, 'utf-8')
        expect(configContent).toContain('screens')
      }
    })
  })
})