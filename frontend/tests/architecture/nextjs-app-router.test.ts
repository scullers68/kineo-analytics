/**
 * Next.js 13+ App Router Architecture Tests
 * Tests the file-based routing system with customer isolation
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Next.js 13+ App Router Architecture', () => {
  const frontendRoot = path.resolve(__dirname, '../../');
  const appDir = path.join(frontendRoot, 'app');
  
  describe('App Directory Structure', () => {
    test('should have app directory for App Router', () => {
      expect(fs.existsSync(appDir)).toBe(true);
      expect(fs.statSync(appDir).isDirectory()).toBe(true);
    });

    test('should have root layout.tsx', () => {
      const layoutPath = path.join(appDir, 'layout.tsx');
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    test('should have root page.tsx', () => {
      const pagePath = path.join(appDir, 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    });

    test('should have global styles', () => {
      const globalCssPath = path.join(appDir, 'globals.css');
      expect(fs.existsSync(globalCssPath)).toBe(true);
    });

    test('should have loading.tsx for loading UI', () => {
      const loadingPath = path.join(appDir, 'loading.tsx');
      expect(fs.existsSync(loadingPath)).toBe(true);
    });

    test('should have error.tsx for error boundaries', () => {
      const errorPath = path.join(appDir, 'error.tsx');
      expect(fs.existsSync(errorPath)).toBe(true);
    });

    test('should have not-found.tsx for 404 pages', () => {
      const notFoundPath = path.join(appDir, 'not-found.tsx');
      expect(fs.existsSync(notFoundPath)).toBe(true);
    });
  });

  describe('Customer-Specific Routing', () => {
    test('should have customer route group directory', () => {
      const customerRouteDir = path.join(appDir, '(customer)');
      expect(fs.existsSync(customerRouteDir)).toBe(true);
      expect(fs.statSync(customerRouteDir).isDirectory()).toBe(true);
    });

    test('should have dashboard route group', () => {
      const dashboardRouteDir = path.join(appDir, '(dashboard)');
      expect(fs.existsSync(dashboardRouteDir)).toBe(true);
      expect(fs.statSync(dashboardRouteDir).isDirectory()).toBe(true);
    });

    test('should have customer dashboard layout', () => {
      const customerLayoutPath = path.join(appDir, '(dashboard)', 'layout.tsx');
      expect(fs.existsSync(customerLayoutPath)).toBe(true);
    });

    test('should have customer dashboard pages', () => {
      const dashboardPages = [
        'page.tsx', // Main dashboard
        'analytics/page.tsx', // Analytics dashboard
        'reports/page.tsx', // Reports dashboard
        'settings/page.tsx' // Settings page
      ];
      
      dashboardPages.forEach(pagePath => {
        const fullPath = path.join(appDir, '(dashboard)', pagePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });

  describe('API Routes', () => {
    test('should have API route directory', () => {
      const apiDir = path.join(appDir, 'api');
      expect(fs.existsSync(apiDir)).toBe(true);
      expect(fs.statSync(apiDir).isDirectory()).toBe(true);
    });

    test('should have authentication API routes', () => {
      const authApiPath = path.join(appDir, 'api', 'auth', 'route.ts');
      expect(fs.existsSync(authApiPath)).toBe(true);
    });

    test('should have dashboard API routes', () => {
      const dashboardApiPath = path.join(appDir, 'api', 'dashboard', 'route.ts');
      expect(fs.existsSync(dashboardApiPath)).toBe(true);
    });
  });

  describe('Middleware Configuration', () => {
    test('should have middleware.ts for route protection', () => {
      const middlewarePath = path.join(frontendRoot, 'middleware.ts');
      expect(fs.existsSync(middlewarePath)).toBe(true);
    });
  });

  describe('Layout Components', () => {
    test('should have reusable layout components', () => {
      const layoutComponents = [
        'src/components/layout/AppLayout.tsx',
        'src/components/layout/DashboardHeader.tsx',
        'src/components/layout/Sidebar.tsx',
        'src/components/layout/CustomerContainer.tsx'
      ];

      layoutComponents.forEach(componentPath => {
        const fullPath = path.join(frontendRoot, componentPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });

  describe('Customer Context Integration', () => {
    test('should have customer context provider', () => {
      const contextPath = path.join(frontendRoot, 'src/contexts/CustomerContext.tsx');
      expect(fs.existsSync(contextPath)).toBe(true);
    });

    test('should have customer-specific hooks', () => {
      const hooks = [
        'src/hooks/useCustomer.ts',
        'src/hooks/useCustomerAuth.ts',
        'src/hooks/useCustomerData.ts'
      ];

      hooks.forEach(hookPath => {
        const fullPath = path.join(frontendRoot, hookPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });
});

describe('Next.js App Router Configuration', () => {
  const frontendRoot = path.resolve(__dirname, '../../');

  test('should have proper Next.js configuration', () => {
    const configPath = path.join(frontendRoot, 'next.config.js');
    expect(fs.existsSync(configPath)).toBe(true);

    const config = require(configPath);
    expect(config.experimental?.appDir).toBe(true);
  });

  test('should have TypeScript configuration for App Router', () => {
    const tsconfigPath = path.join(frontendRoot, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.compilerOptions?.plugins).toContainEqual({
      name: "next"
    });
  });

  test('should have path aliases configured', () => {
    const tsconfigPath = path.join(frontendRoot, 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    expect(tsconfig.compilerOptions?.paths).toHaveProperty('@/*');
    expect(tsconfig.compilerOptions?.paths['@/*']).toContain('./src/*');
  });
});

describe('File-Based Routing Patterns', () => {
  const frontendRoot = path.resolve(__dirname, '../../');
  const appDir = path.join(frontendRoot, 'app');

  test('should follow proper page.tsx naming convention', () => {
    const pageFiles = [
      'page.tsx', // Root page
      '(dashboard)/page.tsx', // Dashboard home
      '(dashboard)/analytics/page.tsx', // Analytics page
      '(dashboard)/reports/page.tsx' // Reports page
    ];

    pageFiles.forEach(pageFile => {
      const fullPath = path.join(appDir, pageFile);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test('should follow proper layout.tsx naming convention', () => {
    const layoutFiles = [
      'layout.tsx', // Root layout
      '(dashboard)/layout.tsx' // Dashboard layout
    ];

    layoutFiles.forEach(layoutFile => {
      const fullPath = path.join(appDir, layoutFile);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test('should have route groups for organization', () => {
    const routeGroups = [
      '(dashboard)', // Dashboard routes
      '(auth)', // Authentication routes
      '(admin)' // Admin routes
    ];

    routeGroups.forEach(group => {
      const groupPath = path.join(appDir, group);
      expect(fs.existsSync(groupPath)).toBe(true);
      expect(fs.statSync(groupPath).isDirectory()).toBe(true);
    });
  });
});

describe('Customer Isolation in Routing', () => {
  const frontendRoot = path.resolve(__dirname, '../../');

  test('should have customer-specific route handlers', () => {
    const middleware = require(path.join(frontendRoot, 'middleware.ts'));
    expect(typeof middleware.middleware).toBe('function');
  });

  test('should have customer context extraction utilities', () => {
    const utilsPath = path.join(frontendRoot, 'src/utils/customer.ts');
    expect(fs.existsSync(utilsPath)).toBe(true);
  });

  test('should have route protection for customer data', () => {
    const protectionPath = path.join(frontendRoot, 'src/utils/routeProtection.ts');
    expect(fs.existsSync(protectionPath)).toBe(true);
  });
});