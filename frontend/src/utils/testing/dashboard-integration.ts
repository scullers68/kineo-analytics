/**
 * Dashboard Grid Integration Test Utilities
 * 
 * Provides utilities for testing chart components within the dashboard framework,
 * including grid layout, widget container integration, and responsive behavior.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { DashboardGrid } from '../../components/dashboard/DashboardGrid';
import { WidgetContainer } from '../../components/dashboard/WidgetContainer';

export interface DashboardIntegrationTestConfig {
  gridColumns?: number;
  widgetSpan?: number;
  responsive?: boolean;
  customerContext?: string;
}

export class DashboardGridTestUtil {
  static renderChartInGrid(
    chartComponent: ReactElement,
    config: DashboardIntegrationTestConfig = {}
  ) {
    const {
      gridColumns = 12,
      widgetSpan = 6,
      responsive = true,
      customerContext = 'customer_001'
    } = config;

    return render(
      <DashboardGrid columns={gridColumns} responsive={responsive}>
        <WidgetContainer span={widgetSpan} customerContext={customerContext}>
          {chartComponent}
        </WidgetContainer>
      </DashboardGrid>
    );
  }

  static async testResponsiveLayout(
    chartComponent: ReactElement,
    breakpoints: number[] = [320, 768, 1024, 1440]
  ) {
    const results = [];
    
    for (const width of breakpoints) {
      // Mock viewport width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      
      const { container, unmount } = this.renderChartInGrid(chartComponent, {
        responsive: true
      });
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      // Wait for responsive updates
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      results.push({
        width,
        element: container.firstChild,
        isResponsive: container.querySelector('[data-responsive="true"]') !== null
      });
      
      unmount();
    }
    
    return results;
  }

  static validateGridLayout(container: HTMLElement, expectedColumns: number) {
    const gridElement = container.querySelector('[data-testid="dashboard-grid"]');
    expect(gridElement).toBeInTheDocument();
    
    const computedStyle = window.getComputedStyle(gridElement!);
    const gridTemplateColumns = computedStyle.getPropertyValue('grid-template-columns');
    
    // Count the number of columns in the grid
    const columnCount = gridTemplateColumns.split(' ').length;
    expect(columnCount).toBe(expectedColumns);
  }

  static async testChartInteractionInGrid(
    chartComponent: ReactElement,
    interactionType: 'click' | 'hover' | 'keyboard' = 'click'
  ) {
    const { container } = this.renderChartInGrid(chartComponent);
    
    const chartElements = container.querySelectorAll('[data-testid*="chart"]');
    expect(chartElements.length).toBeGreaterThan(0);

    const firstChart = chartElements[0];
    
    switch (interactionType) {
      case 'click':
        fireEvent.click(firstChart);
        break;
      case 'hover':
        fireEvent.mouseEnter(firstChart);
        break;
      case 'keyboard':
        fireEvent.keyDown(firstChart, { key: 'Enter' });
        break;
    }
    
    // Verify interaction doesn't break grid layout
    await waitFor(() => {
      this.validateGridLayout(container, 12);
    });
    
    return firstChart;
  }

  static testCustomerContextIntegration(
    chartComponent: ReactElement,
    customerId: string = 'customer_001'
  ) {
    const { container } = this.renderChartInGrid(chartComponent, {
      customerContext: customerId
    });
    
    // Verify customer context is passed down
    const customerElements = container.querySelectorAll(`[data-customer="${customerId}"]`);
    expect(customerElements.length).toBeGreaterThan(0);
    
    return { container, customerId };
  }
}

export default DashboardGridTestUtil;