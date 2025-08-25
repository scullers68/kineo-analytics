/**
 * TailwindCSS Configuration and Setup Verification Tests
 * RED Phase: These tests will fail initially and guide our TailwindCSS implementation
 * 
 * Tests ensure proper TailwindCSS setup with:
 * - Configuration file with custom theme
 * - PostCSS integration
 * - Custom utility classes
 * - Responsive design system
 * - Dark mode support
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import { existsSync } from 'fs'
import { join } from 'path'

describe('TailwindCSS Configuration Architecture', () => {
  const projectRoot = process.cwd()
  
  describe('Configuration Files', () => {
    test('should have tailwind.config.ts with comprehensive configuration', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      expect(existsSync(tailwindConfigPath)).toBe(true)
      
      // This will fail - we need to create tailwind.config.ts
      const tailwindConfig = require(tailwindConfigPath)
      
      expect(tailwindConfig.content).toContain('./app/**/*.{js,ts,jsx,tsx,mdx}')
      expect(tailwindConfig.content).toContain('./src/**/*.{js,ts,jsx,tsx,mdx}')
      expect(tailwindConfig.content).toContain('./components/**/*.{js,ts,jsx,tsx,mdx}')
      
      expect(tailwindConfig).toHaveProperty('theme')
      expect(tailwindConfig.theme).toHaveProperty('extend')
      expect(tailwindConfig).toHaveProperty('plugins')
      
      // Dark mode configuration
      expect(tailwindConfig.darkMode).toBe('class')
    })

    test('should have postcss.config.js with Tailwind and Autoprefixer', () => {
      const postcssConfigPath = join(projectRoot, 'postcss.config.js')
      expect(existsSync(postcssConfigPath)).toBe(true)
      
      // This will fail - we need postcss.config.js
      const postcssConfig = require(postcssConfigPath)
      
      expect(postcssConfig.plugins).toHaveProperty('tailwindcss')
      expect(postcssConfig.plugins).toHaveProperty('autoprefixer')
    })

    test('should have globals.css with Tailwind directives and custom styles', () => {
      const globalsPath = join(projectRoot, 'app', 'globals.css')
      expect(existsSync(globalsPath)).toBe(true)
      
      // This will fail - we need proper globals.css
      const fs = require('fs')
      const globalsContent = fs.readFileSync(globalsPath, 'utf8')
      
      expect(globalsContent).toContain('@tailwind base;')
      expect(globalsContent).toContain('@tailwind components;')
      expect(globalsContent).toContain('@tailwind utilities;')
      
      // Custom CSS variables for theming
      expect(globalsContent).toMatch(/:root\s*\{/)
      expect(globalsContent).toMatch(/--primary/)
      expect(globalsContent).toMatch(/--secondary/)
    })
  })

  describe('Custom Theme Configuration', () => {
    test('should have custom color palette for Kineo Analytics branding', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom colors
      expect(tailwindConfig.theme.extend.colors).toHaveProperty('primary')
      expect(tailwindConfig.theme.extend.colors).toHaveProperty('secondary')
      expect(tailwindConfig.theme.extend.colors).toHaveProperty('accent')
      expect(tailwindConfig.theme.extend.colors).toHaveProperty('neutral')
      
      // Analytics dashboard specific colors
      expect(tailwindConfig.theme.extend.colors).toHaveProperty('chart')
      expect(tailwindConfig.theme.extend.colors.chart).toHaveProperty('blue')
      expect(tailwindConfig.theme.extend.colors.chart).toHaveProperty('green')
      expect(tailwindConfig.theme.extend.colors.chart).toHaveProperty('orange')
      expect(tailwindConfig.theme.extend.colors.chart).toHaveProperty('purple')
    })

    test('should have custom typography scale for data-heavy interfaces', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom typography
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('xs')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('sm')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('base')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('lg')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('xl')
      
      // Dashboard specific font sizes
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('metric')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('chart-label')
      expect(tailwindConfig.theme.extend.fontSize).toHaveProperty('dashboard-title')
    })

    test('should have custom spacing scale for consistent layouts', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom spacing
      expect(tailwindConfig.theme.extend.spacing).toHaveProperty('sidebar')
      expect(tailwindConfig.theme.extend.spacing).toHaveProperty('header')
      expect(tailwindConfig.theme.extend.spacing).toHaveProperty('card')
      expect(tailwindConfig.theme.extend.spacing).toHaveProperty('section')
      
      // Dashboard grid spacing
      expect(tailwindConfig.theme.extend.spacing.sidebar).toBe('16rem')
      expect(tailwindConfig.theme.extend.spacing.header).toBe('4rem')
    })

    test('should have custom border radius for modern UI elements', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom border radius
      expect(tailwindConfig.theme.extend.borderRadius).toHaveProperty('card')
      expect(tailwindConfig.theme.extend.borderRadius).toHaveProperty('button')
      expect(tailwindConfig.theme.extend.borderRadius).toHaveProperty('input')
      expect(tailwindConfig.theme.extend.borderRadius).toHaveProperty('chart')
    })
  })

  describe('Responsive Design System', () => {
    test('should have custom breakpoints for dashboard layouts', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom breakpoints
      expect(tailwindConfig.theme.extend.screens).toHaveProperty('mobile')
      expect(tailwindConfig.theme.extend.screens).toHaveProperty('tablet')
      expect(tailwindConfig.theme.extend.screens).toHaveProperty('desktop')
      expect(tailwindConfig.theme.extend.screens).toHaveProperty('wide')
      
      expect(tailwindConfig.theme.extend.screens.mobile).toBe('320px')
      expect(tailwindConfig.theme.extend.screens.tablet).toBe('768px')
      expect(tailwindConfig.theme.extend.screens.desktop).toBe('1024px')
      expect(tailwindConfig.theme.extend.screens.wide).toBe('1440px')
    })

    test('should have container configuration for consistent max-widths', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need container configuration
      expect(tailwindConfig.theme.extend.container).toHaveProperty('center')
      expect(tailwindConfig.theme.extend.container).toHaveProperty('padding')
      expect(tailwindConfig.theme.extend.container).toHaveProperty('screens')
      
      expect(tailwindConfig.theme.extend.container.center).toBe(true)
    })
  })

  describe('Plugin Configuration', () => {
    test('should have necessary Tailwind plugins for analytics UI', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need plugins
      expect(tailwindConfig.plugins).toBeInstanceOf(Array)
      expect(tailwindConfig.plugins.length).toBeGreaterThan(0)
      
      // Should include forms plugin for form styling
      const pluginNames = tailwindConfig.plugins.map((plugin: any) => {
        if (typeof plugin === 'function') return plugin.name
        if (plugin && plugin.handler) return plugin.handler.name
        return 'unknown'
      })
      
      expect(pluginNames).toContain('forms')
    })

    test('should have typography plugin for content areas', () => {
      const packageJsonPath = join(projectRoot, 'package.json')
      const packageJson = require(packageJsonPath)
      
      // This will fail - we need typography plugin
      expect(packageJson.devDependencies || packageJson.dependencies)
        .toHaveProperty('@tailwindcss/typography')
      
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      const hasTypographyPlugin = tailwindConfig.plugins.some((plugin: any) => 
        plugin.toString().includes('typography') || 
        (plugin.handler && plugin.handler.toString().includes('typography'))
      )
      expect(hasTypographyPlugin).toBe(true)
    })
  })

  describe('Dark Mode Support', () => {
    test('should have dark mode CSS variables in globals.css', () => {
      const globalsPath = join(projectRoot, 'app', 'globals.css')
      const fs = require('fs')
      const globalsContent = fs.readFileSync(globalsPath, 'utf8')
      
      // This will fail - we need dark mode variables
      expect(globalsContent).toMatch(/\.dark\s*\{/)
      expect(globalsContent).toMatch(/--primary.*dark/)
      expect(globalsContent).toMatch(/--background.*dark/)
      expect(globalsContent).toMatch(/--foreground.*dark/)
    })

    test('should have dark mode utility classes', () => {
      const globalsPath = join(projectRoot, 'app', 'globals.css')
      const fs = require('fs')
      const globalsContent = fs.readFileSync(globalsPath, 'utf8')
      
      // This will fail - we need dark mode utilities
      expect(globalsContent).toMatch(/@layer components/)
      expect(globalsContent).toMatch(/\.bg-background/)
      expect(globalsContent).toMatch(/\.text-foreground/)
      expect(globalsContent).toMatch(/dark:/)
    })
  })

  describe('Custom Utility Classes', () => {
    test('should have dashboard-specific utility classes', () => {
      const globalsPath = join(projectRoot, 'app', 'globals.css')
      const fs = require('fs')
      const globalsContent = fs.readFileSync(globalsPath, 'utf8')
      
      // This will fail - we need custom utilities
      expect(globalsContent).toMatch(/\.dashboard-grid/)
      expect(globalsContent).toMatch(/\.metric-card/)
      expect(globalsContent).toMatch(/\.chart-container/)
      expect(globalsContent).toMatch(/\.sidebar-nav/)
    })

    test('should have animation classes for interactive elements', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need custom animations
      expect(tailwindConfig.theme.extend.animation).toHaveProperty('fade-in')
      expect(tailwindConfig.theme.extend.animation).toHaveProperty('slide-up')
      expect(tailwindConfig.theme.extend.animation).toHaveProperty('pulse-slow')
      
      expect(tailwindConfig.theme.extend.keyframes).toHaveProperty('fade-in')
      expect(tailwindConfig.theme.extend.keyframes).toHaveProperty('slide-up')
      expect(tailwindConfig.theme.extend.keyframes).toHaveProperty('pulse-slow')
    })

    test('should have gradient utilities for modern UI elements', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need gradient utilities
      expect(tailwindConfig.theme.extend.backgroundImage).toHaveProperty('gradient-primary')
      expect(tailwindConfig.theme.extend.backgroundImage).toHaveProperty('gradient-secondary')
      expect(tailwindConfig.theme.extend.backgroundImage).toHaveProperty('gradient-chart')
    })
  })

  describe('Integration with Next.js', () => {
    test('should work with Next.js CSS imports in layout', () => {
      const layoutPath = join(projectRoot, 'app', 'layout.tsx')
      expect(existsSync(layoutPath)).toBe(true)
      
      // This will fail - we need layout importing globals.css
      const fs = require('fs')
      const layoutContent = fs.readFileSync(layoutPath, 'utf8')
      
      expect(layoutContent).toMatch(/import.*globals\.css/)
      expect(layoutContent).toMatch(/from.*\.\/globals\.css/)
    })

    test('should have proper TypeScript types for Tailwind config', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const fs = require('fs')
      const configContent = fs.readFileSync(tailwindConfigPath, 'utf8')
      
      // This will fail - we need TypeScript imports
      expect(configContent).toMatch(/import.*type.*Config/)
      expect(configContent).toMatch(/from.*tailwindcss\/types\/config/)
      expect(configContent).toMatch(/export default.*Config/)
    })
  })

  describe('Performance and Optimization', () => {
    test('should have content paths optimized for tree-shaking', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need optimized content paths
      expect(tailwindConfig.content).toContain('./app/**/*.{js,ts,jsx,tsx,mdx}')
      expect(tailwindConfig.content).toContain('./src/components/**/*.{js,ts,jsx,tsx}')
      expect(tailwindConfig.content).not.toContain('./node_modules/**/*')
    })

    test('should have safelist for dynamically generated classes', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.ts')
      const tailwindConfig = require(tailwindConfigPath)
      
      // This will fail - we need safelist for chart colors
      expect(tailwindConfig).toHaveProperty('safelist')
      expect(tailwindConfig.safelist).toContain({ pattern: /^bg-chart-/ })
      expect(tailwindConfig.safelist).toContain({ pattern: /^text-chart-/ })
      expect(tailwindConfig.safelist).toContain({ pattern: /^border-chart-/ })
    })
  })
})