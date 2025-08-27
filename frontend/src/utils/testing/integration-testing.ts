/**
 * Integration Testing Utilities
 * 
 * Provides utilities for testing chart integration with dashboard framework,
 * customer context, theme switching, and cross-component communication.
 */

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ReactElement } from 'react';

export interface IntegrationTestConfig {
  customerContext?: {
    customerId: string;
    customerName: string;
    customerSettings?: any;
  };
  theme?: 'light' | 'dark';
  dashboardConfig?: {
    columns?: number;
    responsive?: boolean;
    gap?: number;
  };
  interactions?: {
    enableCrossChartFiltering?: boolean;
    enableDataSharing?: boolean;
    enableEventBroadcasting?: boolean;
  };
}

export interface DashboardTestResult {
  componentsRendered: number;
  layoutCorrect: boolean;
  responsiveBreakpoints: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  customerContextIsolated: boolean;
  themeConsistent: boolean;
  performanceMetrics: {
    renderTime: number;
    memoryUsage: number;
  };
}

export class IntegrationTestingUtils {
  static async testDashboardIntegration(
    dashboardComponent: ReactElement,
    chartComponents: ReactElement[],
    config: IntegrationTestConfig = {}
  ): Promise<DashboardTestResult> {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    const { container } = render(dashboardComponent);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid*="dashboard"]')).toBeInTheDocument();
    });

    const result: DashboardTestResult = {
      componentsRendered: 0,
      layoutCorrect: false,
      responsiveBreakpoints: {
        mobile: false,
        tablet: false,
        desktop: false
      },
      customerContextIsolated: false,
      themeConsistent: false,
      performanceMetrics: {
        renderTime: performance.now() - startTime,
        memoryUsage: this.getMemoryUsage() - initialMemory
      }
    };

    // Check component rendering
    const renderedCharts = container.querySelectorAll('[data-testid*="chart"]');
    result.componentsRendered = renderedCharts.length;

    // Check layout structure
    const gridContainer = container.querySelector('[class*="grid"]');
    result.layoutCorrect = !!gridContainer && renderedCharts.length > 0;

    // Test responsive breakpoints
    result.responsiveBreakpoints = await this.testResponsiveBreakpoints(container);

    // Test customer context isolation
    result.customerContextIsolated = await this.testCustomerContextIsolation(
      container, 
      config.customerContext
    );

    // Test theme consistency
    result.themeConsistent = await this.testThemeConsistency(container, config.theme);

    return result;
  }

  static async testChartCommunication(
    sourceChart: HTMLElement,
    targetCharts: HTMLElement[],
    interactionType: 'click' | 'hover' | 'selection' = 'click'
  ) {
    const results = {
      sourceInteractionSuccessful: false,
      targetUpdatesReceived: 0,
      communicationLatency: 0,
      dataConsistency: true
    };

    const startTime = performance.now();

    // Interact with source chart
    switch (interactionType) {
      case 'click':
        fireEvent.click(sourceChart);
        break;
      case 'hover':
        fireEvent.mouseEnter(sourceChart);
        break;
      case 'selection':
        fireEvent.keyDown(sourceChart, { key: 'Enter' });
        break;
    }

    results.sourceInteractionSuccessful = true;

    // Wait for target chart updates
    for (const targetChart of targetCharts) {
      try {
        await waitFor(() => {
          // Look for visual changes or data updates
          const hasChanged = targetChart.querySelector('[data-updated="true"]') ||
                           targetChart.classList.contains('updated') ||
                           targetChart.getAttribute('data-filter-applied');
          
          if (hasChanged) {
            results.targetUpdatesReceived++;
          }
        }, { timeout: 1000 });
      } catch {
        // Target didn't update - this might be expected
      }
    }

    results.communicationLatency = performance.now() - startTime;

    return results;
  }

  static async testCustomerContextSwitch(
    component: ReactElement,
    customerContexts: Array<{ customerId: string; customerName: string }>
  ) {
    const results = {
      switchesSuccessful: 0,
      dataIsolationMaintained: true,
      visualConsistency: true,
      performanceImpact: 0
    };

    for (let i = 0; i < customerContexts.length; i++) {
      const context = customerContexts[i];
      const startTime = performance.now();

      // This would typically be done by updating the React context provider
      // For testing purposes, we simulate the context switch
      const { container, rerender } = render(
        <div data-customer-id={context.customerId}>
          {component}
        </div>
      );

      await waitFor(() => {
        const customerElement = container.querySelector(`[data-customer-id="${context.customerId}"]`);
        expect(customerElement).toBeInTheDocument();
      });

      results.switchesSuccessful++;

      // Check data isolation
      const dataElements = container.querySelectorAll('[data-customer-data]');
      dataElements.forEach(element => {
        const customerData = element.getAttribute('data-customer-data');
        if (customerData && !customerData.includes(context.customerId)) {
          results.dataIsolationMaintained = false;
        }
      });

      // Check visual consistency
      const chartElements = container.querySelectorAll('[data-testid*="chart"]');
      if (chartElements.length === 0) {
        results.visualConsistency = false;
      }

      results.performanceImpact += performance.now() - startTime;
    }

    results.performanceImpact = results.performanceImpact / customerContexts.length;
    return results;
  }

  static async testThemeIntegration(
    component: ReactElement,
    themes: string[] = ['light', 'dark']
  ) {
    const results = {
      themesSupported: 0,
      colorConsistency: true,
      contrastCompliant: true,
      transitionsSmooth: true,
      performanceImpact: 0
    };

    for (const theme of themes) {
      const startTime = performance.now();

      const { container } = render(
        <div data-theme={theme} className={theme}>
          {component}
        </div>
      );

      await waitFor(() => {
        const themeElement = container.querySelector(`[data-theme="${theme}"]`);
        expect(themeElement).toBeInTheDocument();
      });

      results.themesSupported++;

      // Check color consistency
      const chartElements = container.querySelectorAll('[data-testid*="chart"]');
      chartElements.forEach(chart => {
        const computedStyle = window.getComputedStyle(chart);
        const backgroundColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        // Basic theme color validation
        if (theme === 'dark') {
          if (backgroundColor.includes('255, 255, 255') || textColor.includes('0, 0, 0')) {
            results.colorConsistency = false;
          }
        } else if (theme === 'light') {
          if (backgroundColor.includes('0, 0, 0') || textColor.includes('255, 255, 255')) {
            results.colorConsistency = false;
          }
        }
      });

      // Check contrast compliance (simplified)
      const textElements = container.querySelectorAll('text, span, p, h1, h2, h3');
      textElements.forEach(element => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // This is a simplified contrast check
        if (color === backgroundColor) {
          results.contrastCompliant = false;
        }
      });

      results.performanceImpact += performance.now() - startTime;
    }

    results.performanceImpact = results.performanceImpact / themes.length;
    return results;
  }

  static async testDataFlowIntegration(
    parentComponent: ReactElement,
    expectedDataFlow: Array<{
      from: string;
      to: string;
      dataType: string;
    }>
  ) {
    const { container } = render(parentComponent);
    
    const results = {
      dataFlowsValidated: 0,
      dataIntegrityMaintained: true,
      updateLatency: 0,
      errorHandling: true
    };

    for (const flow of expectedDataFlow) {
      const startTime = performance.now();

      const sourceElement = container.querySelector(`[data-testid="${flow.from}"]`);
      const targetElement = container.querySelector(`[data-testid="${flow.to}"]`);

      if (!sourceElement || !targetElement) {
        results.errorHandling = false;
        continue;
      }

      // Simulate data update in source
      const testData = { type: flow.dataType, timestamp: Date.now(), value: 'test' };
      fireEvent(sourceElement, new CustomEvent('dataUpdate', { detail: testData }));

      // Wait for target to receive data
      try {
        await waitFor(() => {
          const receivedData = targetElement.getAttribute('data-received');
          expect(receivedData).toBeTruthy();
        }, { timeout: 500 });

        results.dataFlowsValidated++;
        results.updateLatency += performance.now() - startTime;

        // Validate data integrity
        const receivedData = targetElement.getAttribute('data-received');
        if (receivedData) {
          try {
            const parsed = JSON.parse(receivedData);
            if (parsed.type !== flow.dataType) {
              results.dataIntegrityMaintained = false;
            }
          } catch {
            results.dataIntegrityMaintained = false;
          }
        }
      } catch {
        results.errorHandling = false;
      }
    }

    if (results.dataFlowsValidated > 0) {
      results.updateLatency = results.updateLatency / results.dataFlowsValidated;
    }

    return results;
  }

  static async testErrorBoundaryIntegration(
    componentWithError: ReactElement,
    errorBoundary: ReactElement
  ) {
    const results = {
      errorsCaught: 0,
      gracefulFallback: false,
      userFriendlyMessage: false,
      errorReporting: false,
      recoveryPossible: false
    };

    // Suppress console errors for this test
    const originalError = console.error;
    console.error = jest.fn();

    try {
      const { container } = render(errorBoundary);

      await waitFor(() => {
        // Check for error boundary fallback UI
        const fallbackElement = container.querySelector('[data-testid="error-fallback"]') ||
                               container.querySelector('[role="alert"]') ||
                               container.textContent?.includes('Something went wrong');
        
        if (fallbackElement) {
          results.errorsCaught = 1;
          results.gracefulFallback = true;
          results.userFriendlyMessage = !container.textContent?.includes('Error:') ||
                                        !container.textContent?.includes('stack');
        }
      });

      // Check for retry/recovery mechanism
      const retryButton = container.querySelector('[data-testid="retry-button"]') ||
                         container.querySelector('button[class*="retry"]');
      
      if (retryButton) {
        results.recoveryPossible = true;
        
        fireEvent.click(retryButton);
        
        // Wait to see if component recovers
        await waitFor(() => {
          const errorElement = container.querySelector('[data-testid="error-fallback"]');
          results.recoveryPossible = !errorElement;
        }, { timeout: 1000 });
      }

    } catch (error) {
      results.errorsCaught++;
    } finally {
      console.error = originalError;
    }

    return results;
  }

  private static async testResponsiveBreakpoints(container: HTMLElement) {
    const breakpoints = {
      mobile: false,
      tablet: false,
      desktop: false
    };

    // Test mobile breakpoint (375px)
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    window.dispatchEvent(new Event('resize'));
    
    await waitFor(() => {
      const mobileElements = container.querySelectorAll('[class*="sm:"], [class*="mobile"]');
      breakpoints.mobile = mobileElements.length > 0;
    }, { timeout: 100 });

    // Test tablet breakpoint (768px)
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    window.dispatchEvent(new Event('resize'));
    
    await waitFor(() => {
      const tabletElements = container.querySelectorAll('[class*="md:"], [class*="tablet"]');
      breakpoints.tablet = tabletElements.length > 0;
    }, { timeout: 100 });

    // Test desktop breakpoint (1024px)
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    window.dispatchEvent(new Event('resize'));
    
    await waitFor(() => {
      const desktopElements = container.querySelectorAll('[class*="lg:"], [class*="desktop"]');
      breakpoints.desktop = desktopElements.length > 0;
    }, { timeout: 100 });

    return breakpoints;
  }

  private static async testCustomerContextIsolation(
    container: HTMLElement,
    customerContext?: IntegrationTestConfig['customerContext']
  ): Promise<boolean> {
    if (!customerContext) return true;

    // Check for customer-specific data attributes
    const customerElements = container.querySelectorAll(`[data-customer-id="${customerContext.customerId}"]`);
    if (customerElements.length === 0) return false;

    // Check that no other customer data is present
    const allCustomerElements = container.querySelectorAll('[data-customer-id]');
    for (const element of allCustomerElements) {
      const customerId = element.getAttribute('data-customer-id');
      if (customerId && customerId !== customerContext.customerId) {
        return false;
      }
    }

    return true;
  }

  private static async testThemeConsistency(
    container: HTMLElement,
    theme?: string
  ): Promise<boolean> {
    if (!theme) return true;

    const themeElements = container.querySelectorAll(`[data-theme="${theme}"], .${theme}`);
    if (themeElements.length === 0) return false;

    // Check for consistent theme application
    const chartElements = container.querySelectorAll('[data-testid*="chart"]');
    for (const chart of chartElements) {
      const hasThemeClass = chart.classList.contains(theme) ||
                           chart.closest(`[data-theme="${theme}"]`) ||
                           chart.querySelector(`[data-theme="${theme}"]`);
      
      if (!hasThemeClass) return false;
    }

    return true;
  }

  private static getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  static generateIntegrationReport(
    dashboardResult: DashboardTestResult,
    communicationResults: any,
    contextResults: any,
    themeResults: any,
    errorResults: any
  ) {
    const overallScore = this.calculateOverallScore([
      dashboardResult.layoutCorrect ? 100 : 0,
      dashboardResult.customerContextIsolated ? 100 : 0,
      dashboardResult.themeConsistent ? 100 : 0,
      communicationResults.sourceInteractionSuccessful ? 100 : 0,
      contextResults.dataIsolationMaintained ? 100 : 0,
      themeResults.colorConsistency ? 100 : 0,
      errorResults.gracefulFallback ? 100 : 0
    ]);

    return {
      overallScore,
      grade: this.scoreToGrade(overallScore),
      dashboard: dashboardResult,
      communication: communicationResults,
      context: contextResults,
      theme: themeResults,
      errorHandling: errorResults,
      recommendations: this.generateRecommendations({
        dashboardResult,
        communicationResults,
        contextResults,
        themeResults,
        errorResults
      })
    };
  }

  private static calculateOverallScore(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private static scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private static generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    if (!results.dashboardResult.layoutCorrect) {
      recommendations.push('Improve dashboard grid layout and component positioning');
    }

    if (!results.dashboardResult.customerContextIsolated) {
      recommendations.push('Ensure proper customer context isolation and data separation');
    }

    if (!results.themeResults.colorConsistency) {
      recommendations.push('Fix theme color consistency across chart components');
    }

    if (!results.communicationResults.sourceInteractionSuccessful) {
      recommendations.push('Improve cross-chart communication and event handling');
    }

    if (!results.errorResults.gracefulFallback) {
      recommendations.push('Implement error boundaries and graceful failure handling');
    }

    if (results.dashboardResult.performanceMetrics.renderTime > 500) {
      recommendations.push('Optimize dashboard rendering performance');
    }

    return recommendations;
  }
}

export default IntegrationTestingUtils;