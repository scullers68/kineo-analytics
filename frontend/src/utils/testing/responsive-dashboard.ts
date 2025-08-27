/**
 * Responsive Dashboard Testing Utilities
 * 
 * Provides utilities for testing responsive behavior of charts within dashboard layouts,
 * including breakpoint testing, container queries, and adaptive layouts.
 */

import { render, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';

export interface ResponsiveTestConfig {
  breakpoints?: number[];
  containerQueries?: boolean;
  adaptiveLayout?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export class ResponsiveDashboardTester {
  static readonly DEFAULT_BREAKPOINTS = {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  };

  static async testBreakpointBehavior(
    chartComponent: ReactElement,
    config: ResponsiveTestConfig = {}
  ) {
    const {
      breakpoints = Object.values(this.DEFAULT_BREAKPOINTS),
      containerQueries = true,
      adaptiveLayout = true
    } = config;

    const results = [];

    for (const width of breakpoints) {
      // Set viewport width
      this.setViewportSize(width, 800);
      
      const { container, unmount } = render(chartComponent);
      
      // Trigger resize events
      fireEvent(window, new Event('resize'));
      
      if (containerQueries) {
        // Test container query support
        await this.testContainerQuery(container, width);
      }
      
      if (adaptiveLayout) {
        // Test adaptive layout changes
        await this.testAdaptiveLayout(container, width);
      }

      results.push({
        breakpoint: width,
        breakpointName: this.getBreakpointName(width),
        element: container.firstChild,
        isResponsive: await this.validateResponsiveBehavior(container, width)
      });

      unmount();
    }

    return results;
  }

  static setViewportSize(width: number, height: number = 800) {
    // Mock viewport dimensions
    Object.defineProperties(window, {
      innerWidth: {
        writable: true,
        configurable: true,
        value: width,
      },
      innerHeight: {
        writable: true,
        configurable: true,
        value: height,
      },
    });

    // Mock screen dimensions
    Object.defineProperties(window.screen, {
      width: {
        writable: true,
        configurable: true,
        value: width,
      },
      height: {
        writable: true,
        configurable: true,
        value: height,
      },
    });

    // Update document body size
    document.body.style.width = `${width}px`;
    document.body.style.height = `${height}px`;
  }

  static async testContainerQuery(container: HTMLElement, containerWidth: number) {
    // Test container query responsive behavior
    const chartContainer = container.querySelector('[data-testid*="chart"]');
    if (chartContainer) {
      // Set container width
      (chartContainer as HTMLElement).style.width = `${containerWidth}px`;
      
      // Wait for container query to apply
      await waitFor(() => {
        const computedStyle = window.getComputedStyle(chartContainer);
        expect(computedStyle.width).toBe(`${containerWidth}px`);
      });

      return true;
    }
    return false;
  }

  static async testAdaptiveLayout(container: HTMLElement, viewportWidth: number) {
    const chartElement = container.querySelector('[data-testid*="chart"]');
    if (chartElement) {
      const breakpointName = this.getBreakpointName(viewportWidth);
      
      // Check if adaptive layout classes are applied
      await waitFor(() => {
        expect(chartElement).toHaveClass(`chart-${breakpointName}`);
      });

      return true;
    }
    return false;
  }

  static async validateResponsiveBehavior(
    container: HTMLElement, 
    viewportWidth: number
  ): Promise<boolean> {
    const chartElement = container.querySelector('[data-testid*="chart"]');
    if (!chartElement) return false;

    const computedStyle = window.getComputedStyle(chartElement);
    const elementWidth = parseInt(computedStyle.width);

    // Verify element width adapts to viewport
    const isWithinViewport = elementWidth <= viewportWidth;
    const hasResponsiveClass = chartElement.classList.contains('responsive');
    const hasBreakpointClass = Array.from(chartElement.classList)
      .some(className => className.includes('mobile') || 
                        className.includes('tablet') || 
                        className.includes('desktop'));

    return isWithinViewport && (hasResponsiveClass || hasBreakpointClass);
  }

  static getBreakpointName(width: number): string {
    if (width < this.DEFAULT_BREAKPOINTS.tablet) return 'mobile';
    if (width < this.DEFAULT_BREAKPOINTS.desktop) return 'tablet';
    if (width < this.DEFAULT_BREAKPOINTS.wide) return 'desktop';
    return 'wide';
  }

  static async testOrientationChange(
    chartComponent: ReactElement,
    orientations: ('portrait' | 'landscape')[] = ['portrait', 'landscape']
  ) {
    const results = [];

    for (const orientation of orientations) {
      const isPortrait = orientation === 'portrait';
      const width = isPortrait ? 768 : 1024;
      const height = isPortrait ? 1024 : 768;

      this.setViewportSize(width, height);

      // Mock orientation change
      Object.defineProperty(screen, 'orientation', {
        value: { type: orientation },
        writable: true
      });

      const { container, unmount } = render(chartComponent);
      
      // Trigger orientation change event
      fireEvent(window, new Event('orientationchange'));
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const chartElement = container.querySelector('[data-testid*="chart"]');
        expect(chartElement).toBeInTheDocument();
      });

      results.push({
        orientation,
        dimensions: { width, height },
        element: container.firstChild
      });

      unmount();
    }

    return results;
  }

  static async testFlexibleGridLayout(
    chartComponents: ReactElement[],
    gridConfig: { minColumns: number; maxColumns: number; gap: number } = {
      minColumns: 1,
      maxColumns: 4,
      gap: 16
    }
  ) {
    const breakpoints = Object.values(this.DEFAULT_BREAKPOINTS);
    const results = [];

    for (const width of breakpoints) {
      this.setViewportSize(width);
      
      // Calculate expected columns based on viewport
      const expectedColumns = this.calculateGridColumns(width, gridConfig);
      
      const { container, unmount } = render(
        <div 
          data-testid="responsive-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${expectedColumns}, 1fr)`,
            gap: `${gridConfig.gap}px`
          }}
        >
          {chartComponents.map((chart, index) => (
            <div key={index} data-testid={`grid-item-${index}`}>
              {chart}
            </div>
          ))}
        </div>
      );

      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const grid = container.querySelector('[data-testid="responsive-grid"]');
        const computedStyle = window.getComputedStyle(grid!);
        const gridColumns = computedStyle.gridTemplateColumns.split(' ').length;
        expect(gridColumns).toBe(expectedColumns);
      });

      results.push({
        viewport: width,
        expectedColumns,
        grid: container.querySelector('[data-testid="responsive-grid"]')
      });

      unmount();
    }

    return results;
  }

  static calculateGridColumns(
    viewportWidth: number,
    config: { minColumns: number; maxColumns: number; gap: number }
  ): number {
    const { minColumns, maxColumns } = config;
    
    if (viewportWidth < this.DEFAULT_BREAKPOINTS.tablet) return minColumns;
    if (viewportWidth < this.DEFAULT_BREAKPOINTS.desktop) return Math.min(2, maxColumns);
    if (viewportWidth < this.DEFAULT_BREAKPOINTS.wide) return Math.min(3, maxColumns);
    return maxColumns;
  }

  static async testChartScaling(
    chartComponent: ReactElement,
    scalingFactors: number[] = [0.5, 0.75, 1, 1.25, 1.5]
  ) {
    const results = [];
    const baseWidth = 800;
    const baseHeight = 600;

    for (const scale of scalingFactors) {
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      this.setViewportSize(scaledWidth, scaledHeight);

      const { container, unmount } = render(chartComponent);
      
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        const chartElement = container.querySelector('[data-testid*="chart"]');
        if (chartElement) {
          const computedStyle = window.getComputedStyle(chartElement);
          const actualWidth = parseInt(computedStyle.width);
          const actualHeight = parseInt(computedStyle.height);
          
          // Verify scaling is proportional
          expect(actualWidth).toBeLessThanOrEqual(scaledWidth);
          expect(actualHeight).toBeLessThanOrEqual(scaledHeight);
        }
      });

      results.push({
        scale,
        dimensions: { width: scaledWidth, height: scaledHeight },
        element: container.firstChild
      });

      unmount();
    }

    return results;
  }
}

export default ResponsiveDashboardTester;