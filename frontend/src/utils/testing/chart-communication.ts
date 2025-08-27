/**
 * Chart Communication Testing Utilities
 * 
 * Provides utilities for testing communication between charts, including
 * cross-chart filtering, data synchronization, and dashboard-level interactions.
 */

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ReactElement } from 'react';

export interface ChartCommunicationConfig {
  enableCrossFiltering?: boolean;
  enableDataSync?: boolean;
  enableSelection?: boolean;
  broadcastEvents?: string[];
}

export interface ChartInteractionEvent {
  type: 'filter' | 'select' | 'hover' | 'click' | 'brush';
  source: string;
  target?: string;
  data: any;
  timestamp: number;
}

export class ChartCommunicationTester {
  private eventLog: ChartInteractionEvent[] = [];

  static createInstance(): ChartCommunicationTester {
    return new ChartCommunicationTester();
  }

  async testCrossChartFiltering(
    sourceChart: ReactElement,
    targetChart: ReactElement,
    filterConfig: { field: string; value: any }
  ) {
    const { container } = render(
      <div data-testid="dashboard-container">
        <div data-testid="source-chart">{sourceChart}</div>
        <div data-testid="target-chart">{targetChart}</div>
      </div>
    );

    // Get chart elements
    const sourceElement = container.querySelector('[data-testid="source-chart"] [data-testid*="chart"]');
    const targetElement = container.querySelector('[data-testid="target-chart"] [data-testid*="chart"]');

    expect(sourceElement).toBeInTheDocument();
    expect(targetElement).toBeInTheDocument();

    // Simulate filtering action on source chart
    fireEvent.click(sourceElement!, {
      detail: {
        type: 'filter',
        field: filterConfig.field,
        value: filterConfig.value
      }
    });

    // Wait for cross-chart communication
    await waitFor(() => {
      expect(targetElement).toHaveAttribute('data-filtered', 'true');
    });

    // Verify filter was applied to target chart
    const filteredData = targetElement!.getAttribute('data-filter-value');
    expect(filteredData).toBe(filterConfig.value.toString());

    this.logInteraction({
      type: 'filter',
      source: 'source-chart',
      target: 'target-chart',
      data: filterConfig,
      timestamp: Date.now()
    });

    return { sourceElement, targetElement, applied: true };
  }

  async testDataSynchronization(
    charts: ReactElement[],
    syncConfig: { field: string; syncType: 'time' | 'category' | 'user' }
  ) {
    const { container } = render(
      <div data-testid="dashboard-container">
        {charts.map((chart, index) => (
          <div key={index} data-testid={`chart-${index}`}>
            {chart}
          </div>
        ))}
      </div>
    );

    const chartElements = container.querySelectorAll('[data-testid*="chart-"] [data-testid*="chart"]');
    expect(chartElements.length).toBe(charts.length);

    // Trigger data update on first chart
    const firstChart = chartElements[0];
    fireEvent(firstChart, new CustomEvent('dataUpdate', {
      detail: {
        field: syncConfig.field,
        syncType: syncConfig.syncType,
        newData: { timestamp: Date.now(), value: 'test-sync' }
      }
    }));

    // Wait for synchronization across all charts
    await waitFor(() => {
      chartElements.forEach((chart, index) => {
        if (index > 0) { // Skip first chart (trigger source)
          expect(chart).toHaveAttribute('data-synced', 'true');
        }
      });
    });

    this.logInteraction({
      type: 'select',
      source: 'chart-0',
      data: syncConfig,
      timestamp: Date.now()
    });

    return { synchronized: true, chartCount: chartElements.length };
  }

  async testChartSelection(
    charts: ReactElement[],
    selectionConfig: { multiSelect?: boolean; propagateSelection?: boolean }
  ) {
    const { multiSelect = false, propagateSelection = true } = selectionConfig;

    const { container } = render(
      <div data-testid="dashboard-container">
        {charts.map((chart, index) => (
          <div key={index} data-testid={`chart-${index}`}>
            {chart}
          </div>
        ))}
      </div>
    );

    const chartElements = container.querySelectorAll('[data-testid*="chart-"] [data-testid*="chart"]');
    
    // Select item in first chart
    const firstChart = chartElements[0];
    const selectableElement = firstChart.querySelector('[data-selectable="true"]');
    
    if (selectableElement) {
      fireEvent.click(selectableElement, {
        ctrlKey: multiSelect, // Enable multi-select with Ctrl key
        detail: { propagate: propagateSelection }
      });

      if (propagateSelection && charts.length > 1) {
        // Wait for selection to propagate to other charts
        await waitFor(() => {
          const otherCharts = Array.from(chartElements).slice(1);
          otherCharts.forEach(chart => {
            expect(chart).toHaveAttribute('data-selection-active', 'true');
          });
        });
      }

      this.logInteraction({
        type: 'select',
        source: 'chart-0',
        data: { multiSelect, propagateSelection },
        timestamp: Date.now()
      });

      return { selected: true, propagated: propagateSelection };
    }

    return { selected: false, propagated: false };
  }

  async testChartBrushing(
    sourceChart: ReactElement,
    targetCharts: ReactElement[],
    brushConfig: { axis: 'x' | 'y' | 'both'; range: [number, number] }
  ) {
    const { container } = render(
      <div data-testid="dashboard-container">
        <div data-testid="source-chart">{sourceChart}</div>
        {targetCharts.map((chart, index) => (
          <div key={index} data-testid={`target-chart-${index}`}>
            {chart}
          </div>
        ))}
      </div>
    );

    const sourceElement = container.querySelector('[data-testid="source-chart"] [data-testid*="chart"]');
    const targetElements = container.querySelectorAll('[data-testid*="target-chart"] [data-testid*="chart"]');

    // Simulate brush selection on source chart
    if (sourceElement) {
      fireEvent.mouseDown(sourceElement, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(sourceElement, { clientX: 200, clientY: 150 });
      fireEvent.mouseUp(sourceElement, {
        detail: {
          type: 'brush',
          axis: brushConfig.axis,
          range: brushConfig.range
        }
      });

      // Wait for brush to affect target charts
      await waitFor(() => {
        targetElements.forEach(target => {
          expect(target).toHaveAttribute('data-brushed', 'true');
        });
      });

      this.logInteraction({
        type: 'brush',
        source: 'source-chart',
        data: brushConfig,
        timestamp: Date.now()
      });

      return { brushed: true, targetCount: targetElements.length };
    }

    return { brushed: false, targetCount: 0 };
  }

  async testEventBroadcasting(
    charts: ReactElement[],
    eventConfig: { eventType: string; payload: any }
  ) {
    const { container } = render(
      <div data-testid="dashboard-container">
        {charts.map((chart, index) => (
          <div key={index} data-testid={`chart-${index}`}>
            {chart}
          </div>
        ))}
      </div>
    );

    const chartElements = container.querySelectorAll('[data-testid*="chart-"] [data-testid*="chart"]');
    
    // Broadcast event from first chart
    const broadcaster = chartElements[0];
    fireEvent(broadcaster, new CustomEvent(eventConfig.eventType, {
      detail: eventConfig.payload,
      bubbles: true
    }));

    // Wait for event to be received by other charts
    await waitFor(() => {
      const listeners = Array.from(chartElements).slice(1);
      listeners.forEach(listener => {
        expect(listener).toHaveAttribute('data-event-received', eventConfig.eventType);
      });
    });

    this.logInteraction({
      type: eventConfig.eventType as any,
      source: 'chart-0',
      data: eventConfig.payload,
      timestamp: Date.now()
    });

    return { broadcasted: true, listenerCount: chartElements.length - 1 };
  }

  testChartCommunicationPerformance(
    charts: ReactElement[],
    interactionCount: number = 100
  ) {
    const startTime = performance.now();
    
    return new Promise<{ duration: number; interactionsPerSecond: number }>((resolve) => {
      const { container } = render(
        <div data-testid="dashboard-container">
          {charts.map((chart, index) => (
            <div key={index} data-testid={`chart-${index}`}>
              {chart}
            </div>
          ))}
        </div>
      );

      const chartElements = container.querySelectorAll('[data-testid*="chart-"] [data-testid*="chart"]');
      
      let completedInteractions = 0;
      
      const performInteraction = () => {
        if (completedInteractions >= interactionCount) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          const interactionsPerSecond = (interactionCount / duration) * 1000;
          
          resolve({ duration, interactionsPerSecond });
          return;
        }

        // Simulate rapid interactions
        const randomChart = chartElements[Math.floor(Math.random() * chartElements.length)];
        fireEvent.click(randomChart, {
          detail: { type: 'performance-test', interaction: completedInteractions }
        });

        completedInteractions++;
        
        // Continue with next interaction
        requestAnimationFrame(performInteraction);
      };

      // Start performance test
      requestAnimationFrame(performInteraction);
    });
  }

  getInteractionLog(): ChartInteractionEvent[] {
    return [...this.eventLog];
  }

  clearInteractionLog(): void {
    this.eventLog = [];
  }

  private logInteraction(event: ChartInteractionEvent): void {
    this.eventLog.push(event);
  }

  static async validateCommunicationProtocol(
    charts: ReactElement[],
    protocolRules: {
      maxLatency: number; // milliseconds
      requiresAcknowledgment: boolean;
      allowsCircularCommunication: boolean;
    }
  ) {
    const tester = ChartCommunicationTester.createInstance();
    
    const { container } = render(
      <div data-testid="dashboard-container">
        {charts.map((chart, index) => (
          <div key={index} data-testid={`chart-${index}`}>
            {chart}
          </div>
        ))}
      </div>
    );

    const results = {
      latencyCompliance: false,
      acknowledgmentCompliance: false,
      circularCommunicationHandled: false
    };

    // Test communication latency
    const startTime = performance.now();
    const firstChart = container.querySelector('[data-testid="chart-0"] [data-testid*="chart"]');
    if (firstChart) {
      fireEvent.click(firstChart, { detail: { type: 'latency-test' } });
      
      await waitFor(() => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        results.latencyCompliance = latency <= protocolRules.maxLatency;
        expect(latency).toBeLessThanOrEqual(protocolRules.maxLatency);
      });
    }

    return results;
  }
}

export default ChartCommunicationTester;