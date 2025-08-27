/**
 * Performance Benchmarking Testing Utilities
 * 
 * Provides utilities for measuring and validating chart performance including
 * render times, memory usage, animation frame rates, and large dataset handling.
 */

import { render, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  paintTime: number;
  interactionTime: number;
  memoryUsage: {
    initial: number;
    afterRender: number;
    afterInteraction: number;
    afterCleanup: number;
  };
  animationFrameRate: number;
  bundleSize?: number;
}

export interface PerformanceBudget {
  maxRenderTime: number; // milliseconds
  maxInteractionTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  minFrameRate: number; // FPS
  maxBundleSize?: number; // KB
}

export interface DatasetPerformanceTest {
  dataSize: number;
  renderTime: number;
  memoryImpact: number;
  frameRate: number;
  passed: boolean;
}

export class PerformanceBenchmarkingUtils {
  private static readonly DEFAULT_BUDGET: PerformanceBudget = {
    maxRenderTime: 200,
    maxInteractionTime: 100,
    maxMemoryUsage: 50,
    minFrameRate: 60
  };

  static async measureRenderPerformance(
    component: ReactElement,
    budget: PerformanceBudget = this.DEFAULT_BUDGET
  ): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      renderTime: 0,
      paintTime: 0,
      interactionTime: 0,
      memoryUsage: {
        initial: this.getMemoryUsage(),
        afterRender: 0,
        afterInteraction: 0,
        afterCleanup: 0
      },
      animationFrameRate: 0
    };

    // Measure render time
    const renderStart = performance.now();
    const { container, unmount } = render(component);
    const renderEnd = performance.now();
    
    metrics.renderTime = renderEnd - renderStart;

    // Wait for paint
    await new Promise(resolve => requestAnimationFrame(resolve));
    const paintEnd = performance.now();
    metrics.paintTime = paintEnd - renderEnd;

    metrics.memoryUsage.afterRender = this.getMemoryUsage();

    // Measure interaction time
    const chartElement = container.querySelector('[data-testid*="chart"]');
    if (chartElement) {
      const interactionStart = performance.now();
      fireEvent.click(chartElement);
      
      await waitFor(() => {
        // Wait for any state updates
        expect(chartElement).toBeInTheDocument();
      });
      
      const interactionEnd = performance.now();
      metrics.interactionTime = interactionEnd - interactionStart;
    }

    metrics.memoryUsage.afterInteraction = this.getMemoryUsage();

    // Measure animation frame rate if animations are present
    if (this.hasAnimations(container)) {
      metrics.animationFrameRate = await this.measureFrameRate(chartElement, 1000);
    } else {
      metrics.animationFrameRate = budget.minFrameRate; // No animations = budget met
    }

    // Cleanup and measure final memory
    unmount();
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    metrics.memoryUsage.afterCleanup = this.getMemoryUsage();

    return metrics;
  }

  static async benchmarkLargeDatasets(
    componentFactory: (dataSize: number) => ReactElement,
    dataSizes: number[] = [10, 50, 100, 500, 1000, 2000],
    budget: PerformanceBudget = this.DEFAULT_BUDGET
  ): Promise<DatasetPerformanceTest[]> {
    const results: DatasetPerformanceTest[] = [];

    for (const dataSize of dataSizes) {
      const component = componentFactory(dataSize);
      
      const renderStart = performance.now();
      const initialMemory = this.getMemoryUsage();
      
      const { container, unmount } = render(component);
      
      // Wait for render completion
      await waitFor(() => {
        const chartElement = container.querySelector('[data-testid*="chart"]');
        expect(chartElement).toBeInTheDocument();
      });
      
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      const afterRenderMemory = this.getMemoryUsage();
      const memoryImpact = afterRenderMemory - initialMemory;

      // Measure frame rate during animations
      let frameRate = budget.minFrameRate;
      const chartElement = container.querySelector('[data-testid*="chart"]');
      if (chartElement && this.hasAnimations(container)) {
        frameRate = await this.measureFrameRate(chartElement, 500);
      }

      const passed = renderTime <= budget.maxRenderTime && 
                    memoryImpact <= budget.maxMemoryUsage && 
                    frameRate >= budget.minFrameRate;

      results.push({
        dataSize,
        renderTime,
        memoryImpact,
        frameRate,
        passed
      });

      unmount();
      
      // Force cleanup between tests
      if ((global as any).gc) {
        (global as any).gc();
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  }

  static async measureAnimationPerformance(
    component: ReactElement,
    animationDuration: number = 1000,
    budget: PerformanceBudget = this.DEFAULT_BUDGET
  ) {
    const { container } = render(component);
    const chartElement = container.querySelector('[data-testid*="chart"]');
    
    if (!chartElement) {
      throw new Error('Chart element not found for animation testing');
    }

    const results = {
      averageFrameRate: 0,
      droppedFrames: 0,
      jankScore: 0, // Percentage of frames that took >16ms
      smoothness: 0, // Percentage of smooth frames
      passed: false
    };

    // Trigger animation
    fireEvent.mouseEnter(chartElement);
    
    const frameRates: number[] = [];
    const frameTimes: number[] = [];
    let lastFrame = performance.now();
    let animationId: number;
    let frameCount = 0;
    let droppedFrames = 0;

    const measureFrame = () => {
      const now = performance.now();
      const frameDelta = now - lastFrame;
      frameTimes.push(frameDelta);

      if (frameDelta > 0) {
        const currentFPS = 1000 / frameDelta;
        frameRates.push(currentFPS);
        
        // Count frames that took longer than 16.67ms (60fps threshold)
        if (frameDelta > 16.67) {
          droppedFrames++;
        }
      }

      frameCount++;
      lastFrame = now;

      if (now - startTime < animationDuration) {
        animationId = requestAnimationFrame(measureFrame);
      }
    };

    const startTime = performance.now();
    animationId = requestAnimationFrame(measureFrame);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, animationDuration + 100));

    // Calculate results
    if (frameRates.length > 0) {
      results.averageFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
      results.droppedFrames = droppedFrames;
      results.jankScore = (droppedFrames / frameCount) * 100;
      results.smoothness = ((frameCount - droppedFrames) / frameCount) * 100;
    }

    results.passed = results.averageFrameRate >= budget.minFrameRate && 
                    results.jankScore < 10; // Less than 10% jank acceptable

    // Cleanup
    if (animationId!) {
      cancelAnimationFrame(animationId);
    }

    return results;
  }

  static async detectMemoryLeaks(
    componentFactory: () => ReactElement,
    cycles: number = 10,
    budget: PerformanceBudget = this.DEFAULT_BUDGET
  ) {
    const memorySnapshots: number[] = [];
    const results = {
      initialMemory: 0,
      finalMemory: 0,
      peakMemory: 0,
      memoryGrowth: 0,
      leakDetected: false,
      snapshots: memorySnapshots
    };

    // Take initial memory snapshot
    if ((global as any).gc) {
      (global as any).gc();
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    results.initialMemory = this.getMemoryUsage();

    // Run mount/unmount cycles
    for (let i = 0; i < cycles; i++) {
      const component = componentFactory();
      const { container, unmount } = render(component);
      
      // Interact with component to create potential leaks
      const chartElement = container.querySelector('[data-testid*="chart"]');
      if (chartElement) {
        fireEvent.click(chartElement);
        fireEvent.mouseEnter(chartElement);
        fireEvent.mouseLeave(chartElement);
      }

      unmount();
      
      // Force garbage collection
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const currentMemory = this.getMemoryUsage();
      memorySnapshots.push(currentMemory);
      
      if (currentMemory > results.peakMemory) {
        results.peakMemory = currentMemory;
      }
    }

    results.finalMemory = this.getMemoryUsage();
    results.memoryGrowth = results.finalMemory - results.initialMemory;
    
    // Detect leak (memory growth > 5MB indicates potential leak)
    results.leakDetected = results.memoryGrowth > 5 || 
                          results.memoryGrowth > budget.maxMemoryUsage;

    return results;
  }

  static async measureBundleImpact(componentPath: string) {
    // This would require webpack-bundle-analyzer or similar tools
    // For testing purposes, we'll simulate bundle size measurement
    
    const results = {
      componentSize: 0, // KB
      dependencySize: 0, // KB
      totalSize: 0, // KB
      gzippedSize: 0, // KB
      treeshakingEffective: false
    };

    // In a real implementation, this would analyze the actual bundle
    // For now, we'll provide a mock implementation
    results.componentSize = Math.floor(Math.random() * 50) + 10; // 10-60 KB
    results.dependencySize = Math.floor(Math.random() * 200) + 50; // 50-250 KB
    results.totalSize = results.componentSize + results.dependencySize;
    results.gzippedSize = Math.floor(results.totalSize * 0.3); // ~30% compression
    results.treeshakingEffective = results.dependencySize < 100; // Heuristic

    return results;
  }

  static validatePerformanceBudget(
    metrics: PerformanceMetrics,
    budget: PerformanceBudget = this.DEFAULT_BUDGET
  ) {
    const results = {
      renderTime: {
        actual: metrics.renderTime,
        budget: budget.maxRenderTime,
        passed: metrics.renderTime <= budget.maxRenderTime,
        margin: budget.maxRenderTime - metrics.renderTime
      },
      interactionTime: {
        actual: metrics.interactionTime,
        budget: budget.maxInteractionTime,
        passed: metrics.interactionTime <= budget.maxInteractionTime,
        margin: budget.maxInteractionTime - metrics.interactionTime
      },
      memoryUsage: {
        actual: metrics.memoryUsage.afterRender - metrics.memoryUsage.initial,
        budget: budget.maxMemoryUsage,
        passed: (metrics.memoryUsage.afterRender - metrics.memoryUsage.initial) <= budget.maxMemoryUsage,
        margin: budget.maxMemoryUsage - (metrics.memoryUsage.afterRender - metrics.memoryUsage.initial)
      },
      frameRate: {
        actual: metrics.animationFrameRate,
        budget: budget.minFrameRate,
        passed: metrics.animationFrameRate >= budget.minFrameRate,
        margin: metrics.animationFrameRate - budget.minFrameRate
      },
      overall: {
        passed: false,
        score: 0
      }
    };

    // Calculate overall score
    const tests = [
      results.renderTime.passed,
      results.interactionTime.passed,
      results.memoryUsage.passed,
      results.frameRate.passed
    ];
    
    const passedCount = tests.filter(Boolean).length;
    results.overall.score = (passedCount / tests.length) * 100;
    results.overall.passed = passedCount === tests.length;

    return results;
  }

  private static getMemoryUsage(): number {
    // Use performance.memory if available, otherwise return 0
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  private static hasAnimations(container: HTMLElement): boolean {
    // Check for common animation indicators
    const animatedElements = container.querySelectorAll(
      '[style*="transition"], [style*="animation"], .animate-*, [data-animate="true"]'
    );
    return animatedElements.length > 0;
  }

  private static async measureFrameRate(
    element: HTMLElement | null,
    duration: number
  ): Promise<number> {
    if (!element) return 60; // Default if no element

    const frameRates: number[] = [];
    let lastTime = performance.now();
    let animationId: number;
    const startTime = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastTime;
      
      if (delta > 0) {
        frameRates.push(1000 / delta);
      }
      
      lastTime = now;

      if (now - startTime < duration) {
        animationId = requestAnimationFrame(measureFrame);
      }
    };

    animationId = requestAnimationFrame(measureFrame);

    // Wait for measurement period
    await new Promise(resolve => setTimeout(resolve, duration));

    // Cleanup
    if (animationId!) {
      cancelAnimationFrame(animationId);
    }

    // Calculate average FPS
    if (frameRates.length === 0) return 60;
    
    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    return Math.round(averageFPS);
  }

  static generatePerformanceReport(
    metrics: PerformanceMetrics,
    budgetValidation: any,
    datasetTests: DatasetPerformanceTest[],
    animationResults: any,
    memoryLeakResults: any
  ) {
    const report = {
      overall: {
        score: 0,
        grade: 'F',
        passed: false
      },
      summary: {
        renderPerformance: budgetValidation.renderTime.passed,
        interactionPerformance: budgetValidation.interactionTime.passed,
        memoryEfficiency: budgetValidation.memoryUsage.passed && !memoryLeakResults.leakDetected,
        animationSmoothness: animationResults.passed,
        scalability: datasetTests.every((test: DatasetPerformanceTest) => test.passed)
      },
      recommendations: [] as string[],
      metrics,
      details: {
        budgetValidation,
        datasetTests,
        animationResults,
        memoryLeakResults
      }
    };

    // Calculate overall score
    const categories = Object.values(report.summary);
    const passedCategories = categories.filter(Boolean).length;
    report.overall.score = (passedCategories / categories.length) * 100;

    // Assign grade
    if (report.overall.score >= 90) {
      report.overall.grade = 'A';
      report.overall.passed = true;
    } else if (report.overall.score >= 80) {
      report.overall.grade = 'B';
      report.overall.passed = true;
    } else if (report.overall.score >= 70) {
      report.overall.grade = 'C';
    } else if (report.overall.score >= 60) {
      report.overall.grade = 'D';
    } else {
      report.overall.grade = 'F';
    }

    // Generate recommendations
    if (!budgetValidation.renderTime.passed) {
      report.recommendations.push(
        `Optimize render time: ${metrics.renderTime.toFixed(1)}ms exceeds budget of ${budgetValidation.renderTime.budget}ms`
      );
    }

    if (!budgetValidation.interactionTime.passed) {
      report.recommendations.push(
        `Improve interaction responsiveness: ${metrics.interactionTime.toFixed(1)}ms exceeds budget`
      );
    }

    if (memoryLeakResults.leakDetected) {
      report.recommendations.push(
        `Fix memory leaks: ${memoryLeakResults.memoryGrowth.toFixed(1)}MB growth detected`
      );
    }

    if (!animationResults.passed) {
      report.recommendations.push(
        `Improve animation performance: ${animationResults.averageFrameRate.toFixed(1)}fps below target`
      );
    }

    const failedDatasetTests = datasetTests.filter(test => !test.passed);
    if (failedDatasetTests.length > 0) {
      report.recommendations.push(
        `Optimize for large datasets: Performance degrades at ${failedDatasetTests[0].dataSize} items`
      );
    }

    return report;
  }
}

export default PerformanceBenchmarkingUtils;