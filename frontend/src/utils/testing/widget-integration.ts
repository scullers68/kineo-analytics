/**
 * Widget Container Integration Test Helper
 * 
 * Provides utilities for testing chart components within widget containers,
 * including widget lifecycle, resizing behavior, and container interactions.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { WidgetContainer } from '../../components/dashboard/WidgetContainer';

export interface WidgetTestConfig {
  title?: string;
  span?: number;
  collapsible?: boolean;
  resizable?: boolean;
  customerContext?: string;
  initiallyCollapsed?: boolean;
}

export class WidgetContainerTestHelper {
  static renderChartInWidget(
    chartComponent: ReactElement,
    config: WidgetTestConfig = {}
  ) {
    const {
      title = 'Test Chart Widget',
      span = 6,
      collapsible = true,
      resizable = true,
      customerContext = 'customer_001',
      initiallyCollapsed = false
    } = config;

    return render(
      <WidgetContainer
        title={title}
        span={span}
        collapsible={collapsible}
        resizable={resizable}
        customerContext={customerContext}
        initiallyCollapsed={initiallyCollapsed}
        data-testid="widget-container"
      >
        {chartComponent}
      </WidgetContainer>
    );
  }

  static async testWidgetCollapse(chartComponent: ReactElement) {
    const { container } = this.renderChartInWidget(chartComponent, {
      collapsible: true,
      initiallyCollapsed: false
    });

    // Find collapse button
    const collapseButton = container.querySelector('[data-testid="widget-collapse"]');
    expect(collapseButton).toBeInTheDocument();

    // Verify widget is initially expanded
    const widget = container.querySelector('[data-testid="widget-container"]');
    expect(widget).toHaveAttribute('data-collapsed', 'false');

    // Click collapse button
    fireEvent.click(collapseButton!);

    // Wait for collapse animation
    await waitFor(() => {
      expect(widget).toHaveAttribute('data-collapsed', 'true');
    });

    // Verify chart is hidden
    const chartElement = container.querySelector('[data-testid*="chart"]');
    if (chartElement) {
      const computedStyle = window.getComputedStyle(chartElement);
      expect(computedStyle.display).toBe('none');
    }

    return { widget, collapseButton };
  }

  static async testWidgetResize(
    chartComponent: ReactElement,
    newSize: { width: number; height: number }
  ) {
    const { container } = this.renderChartInWidget(chartComponent, {
      resizable: true
    });

    const widget = container.querySelector('[data-testid="widget-container"]');
    expect(widget).toBeInTheDocument();

    // Mock resize handle
    const resizeHandle = container.querySelector('[data-testid="resize-handle"]');
    if (resizeHandle) {
      fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { 
        clientX: 100 + newSize.width, 
        clientY: 100 + newSize.height 
      });
      fireEvent.mouseUp(document);

      // Wait for resize to complete
      await waitFor(() => {
        const style = window.getComputedStyle(widget!);
        expect(parseInt(style.width)).toBeCloseTo(newSize.width, -1);
      });
    }

    return { widget, newSize };
  }

  static testWidgetTitle(chartComponent: ReactElement, expectedTitle: string) {
    const { container } = this.renderChartInWidget(chartComponent, {
      title: expectedTitle
    });

    const titleElement = container.querySelector('[data-testid="widget-title"]');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(expectedTitle);

    return titleElement;
  }

  static testWidgetSpan(chartComponent: ReactElement, span: number) {
    const { container } = this.renderChartInWidget(chartComponent, { span });

    const widget = container.querySelector('[data-testid="widget-container"]');
    expect(widget).toHaveAttribute('data-span', span.toString());
    
    // Verify CSS grid span is applied
    const computedStyle = window.getComputedStyle(widget!);
    const gridColumn = computedStyle.getPropertyValue('grid-column');
    expect(gridColumn).toContain(`span ${span}`);

    return widget;
  }

  static async testChartResizeWithinWidget(
    chartComponent: ReactElement,
    containerSizes: { width: number; height: number }[]
  ) {
    const results = [];

    for (const size of containerSizes) {
      const { container } = this.renderChartInWidget(chartComponent);
      
      // Set widget container size
      const widget = container.querySelector('[data-testid="widget-container"]');
      if (widget) {
        Object.assign((widget as HTMLElement).style, {
          width: `${size.width}px`,
          height: `${size.height}px`
        });

        // Trigger resize event
        fireEvent(widget, new Event('resize'));

        // Wait for chart to respond to resize
        await waitFor(() => {
          const chartElement = container.querySelector('[data-testid*="chart"]');
          if (chartElement) {
            const chartStyle = window.getComputedStyle(chartElement);
            expect(parseInt(chartStyle.width)).toBeLessThanOrEqual(size.width);
          }
        });

        results.push({
          containerSize: size,
          widget,
          chartElement: container.querySelector('[data-testid*="chart"]')
        });
      }
    }

    return results;
  }

  static testWidgetActions(chartComponent: ReactElement) {
    const { container } = this.renderChartInWidget(chartComponent);

    // Test common widget actions
    const actions = {
      maximize: container.querySelector('[data-testid="widget-maximize"]'),
      settings: container.querySelector('[data-testid="widget-settings"]'),
      close: container.querySelector('[data-testid="widget-close"]'),
      refresh: container.querySelector('[data-testid="widget-refresh"]')
    };

    // Verify action buttons are present
    Object.entries(actions).forEach(([actionName, button]) => {
      if (button) {
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', expect.stringContaining(actionName));
      }
    });

    return actions;
  }

  static async testWidgetMaximize(chartComponent: ReactElement) {
    const { container } = this.renderChartInWidget(chartComponent);
    
    const maximizeButton = container.querySelector('[data-testid="widget-maximize"]');
    if (maximizeButton) {
      fireEvent.click(maximizeButton);

      await waitFor(() => {
        const widget = container.querySelector('[data-testid="widget-container"]');
        expect(widget).toHaveAttribute('data-maximized', 'true');
      });

      return { maximized: true, maximizeButton };
    }

    return { maximized: false, maximizeButton: null };
  }
}

export default WidgetContainerTestHelper;