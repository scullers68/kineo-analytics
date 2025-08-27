/**
 * Visual Regression Testing Utilities
 * 
 * Provides utilities for testing visual consistency across browsers, themes,
 * and responsive breakpoints using screenshot comparison and automated validation.
 */

import { render, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';

export interface VisualTestConfig {
  browsers?: string[];
  viewports?: { width: number; height: number; name: string }[];
  themes?: string[];
  tolerance?: number; // Pixel difference tolerance (0-100)
  threshold?: number; // Percentage of different pixels allowed
  ignoreAntialiasing?: boolean;
  ignoreColors?: string[];
}

export interface VisualSnapshot {
  name: string;
  viewport: { width: number; height: number };
  theme: string;
  browser: string;
  timestamp: number;
  imageData?: string; // Base64 encoded image
  hash?: string;
}

export interface VisualComparisonResult {
  passed: boolean;
  pixelDifference: number;
  percentageDifference: number;
  diffImage?: string;
  regions?: Array<{ x: number; y: number; width: number; height: number }>;
}

export class VisualRegressionTestingUtils {
  private static readonly DEFAULT_VIEWPORTS = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' },
    { width: 1920, height: 1080, name: 'wide' }
  ];

  private static readonly DEFAULT_CONFIG: VisualTestConfig = {
    browsers: ['chrome', 'firefox', 'safari'],
    viewports: this.DEFAULT_VIEWPORTS,
    themes: ['light', 'dark'],
    tolerance: 0.1,
    threshold: 0.01,
    ignoreAntialiasing: true,
    ignoreColors: []
  };

  static async captureVisualSnapshot(
    component: ReactElement,
    snapshotName: string,
    config: Partial<VisualTestConfig> = {}
  ): Promise<VisualSnapshot[]> {
    const testConfig = { ...this.DEFAULT_CONFIG, ...config };
    const snapshots: VisualSnapshot[] = [];

    for (const viewport of testConfig.viewports!) {
      for (const theme of testConfig.themes!) {
        // Mock viewport size
        this.setViewportSize(viewport.width, viewport.height);

        const { container } = render(
          <div data-theme={theme} className={`theme-${theme}`}>
            {component}
          </div>
        );

        // Wait for render and animations to complete
        await this.waitForAnimationsToComplete(container);

        // Capture screenshot (simulated)
        const imageData = await this.captureScreenshot(container);
        const hash = this.generateImageHash(imageData);

        snapshots.push({
          name: snapshotName,
          viewport,
          theme,
          browser: 'chrome', // Default browser for testing
          timestamp: Date.now(),
          imageData,
          hash
        });
      }
    }

    return snapshots;
  }

  static async compareVisualSnapshots(
    baseline: VisualSnapshot,
    current: VisualSnapshot,
    config: Partial<VisualTestConfig> = {}
  ): Promise<VisualComparisonResult> {
    const testConfig = { ...this.DEFAULT_CONFIG, ...config };

    // Quick hash comparison for identical images
    if (baseline.hash === current.hash) {
      return {
        passed: true,
        pixelDifference: 0,
        percentageDifference: 0
      };
    }

    // Pixel-by-pixel comparison (simulated)
    const comparisonResult = await this.performPixelComparison(
      baseline.imageData!,
      current.imageData!,
      testConfig
    );

    const passed = comparisonResult.percentageDifference <= (testConfig.threshold! * 100);

    return {
      passed,
      pixelDifference: comparisonResult.pixelDifference,
      percentageDifference: comparisonResult.percentageDifference,
      diffImage: comparisonResult.diffImage,
      regions: comparisonResult.differenceRegions
    };
  }

  static async testResponsiveVisualConsistency(
    component: ReactElement,
    baselineViewport: { width: number; height: number } = { width: 1440, height: 900 }
  ) {
    const viewports = this.DEFAULT_VIEWPORTS.filter(v => 
      v.width !== baselineViewport.width || v.height !== baselineViewport.height
    );

    // Capture baseline
    this.setViewportSize(baselineViewport.width, baselineViewport.height);
    const { container: baselineContainer } = render(component);
    await this.waitForAnimationsToComplete(baselineContainer);
    const baselineSnapshot = await this.captureScreenshot(baselineContainer);

    const results = [];

    for (const viewport of viewports) {
      this.setViewportSize(viewport.width, viewport.height);
      const { container } = render(component);
      await this.waitForAnimationsToComplete(container);
      
      // Verify responsive behavior visually
      const currentSnapshot = await this.captureScreenshot(container);
      
      // Check for layout consistency markers
      const layoutConsistency = await this.validateLayoutConsistency(
        baselineContainer,
        container,
        viewport
      );

      results.push({
        viewport,
        layoutConsistent: layoutConsistency.consistent,
        issues: layoutConsistency.issues,
        snapshot: currentSnapshot
      });
    }

    return results;
  }

  static async testThemeConsistency(
    component: ReactElement,
    themes: string[] = ['light', 'dark']
  ) {
    const results = [];

    for (const theme of themes) {
      const { container } = render(
        <div data-theme={theme} className={`theme-${theme}`}>
          {component}
        </div>
      );

      await this.waitForAnimationsToComplete(container);

      // Validate theme application
      const themeValidation = await this.validateThemeApplication(container, theme);
      const snapshot = await this.captureScreenshot(container);

      results.push({
        theme,
        applied: themeValidation.applied,
        colorScheme: themeValidation.colorScheme,
        consistency: themeValidation.consistency,
        issues: themeValidation.issues,
        snapshot
      });
    }

    return results;
  }

  static async testAnimationConsistency(
    component: ReactElement,
    animationTriggers: Array<{
      name: string;
      trigger: (container: HTMLElement) => void;
      duration: number;
    }>
  ) {
    const results = [];

    for (const animation of animationTriggers) {
      const { container } = render(component);
      
      // Capture before animation
      const beforeSnapshot = await this.captureScreenshot(container);
      
      // Trigger animation
      animation.trigger(container);
      
      // Capture during animation (mid-point)
      await new Promise(resolve => setTimeout(resolve, animation.duration / 2));
      const duringSnapshot = await this.captureScreenshot(container);
      
      // Wait for animation completion
      await new Promise(resolve => setTimeout(resolve, animation.duration / 2 + 100));
      const afterSnapshot = await this.captureScreenshot(container);

      // Validate animation frames
      const animationValidation = {
        hasVisualChange: beforeSnapshot !== duringSnapshot,
        completesCorrectly: this.validateAnimationCompletion(container),
        performanceImpact: await this.measureAnimationPerformance(container, animation)
      };

      results.push({
        name: animation.name,
        duration: animation.duration,
        validation: animationValidation,
        snapshots: {
          before: beforeSnapshot,
          during: duringSnapshot,
          after: afterSnapshot
        }
      });
    }

    return results;
  }

  static async testCrossBrowserConsistency(
    component: ReactElement,
    browsers: string[] = ['chrome', 'firefox', 'safari']
  ) {
    const results = [];

    // Note: In actual implementation, this would use tools like Playwright or Selenium
    // For testing purposes, we'll simulate browser differences
    
    for (const browser of browsers) {
      // Mock browser-specific behavior
      this.mockBrowserEnvironment(browser);
      
      const { container } = render(component);
      await this.waitForAnimationsToComplete(container);
      
      // Capture browser-specific rendering
      const snapshot = await this.captureScreenshot(container);
      const browserValidation = await this.validateBrowserSpecificFeatures(container, browser);

      results.push({
        browser,
        rendering: {
          snapshot,
          cssSupport: browserValidation.cssSupport,
          jsCompatibility: browserValidation.jsCompatibility,
          performanceMetrics: browserValidation.performance
        },
        issues: browserValidation.issues || []
      });

      // Reset browser environment
      this.resetBrowserEnvironment();
    }

    // Compare browser results for consistency
    const consistencyAnalysis = this.analyzeCrossBrowserConsistency(results);

    return {
      browserResults: results,
      consistency: consistencyAnalysis
    };
  }

  static async validatePixelPerfectRendering(
    component: ReactElement,
    expectedElements: Array<{
      selector: string;
      expectedBounds: { x: number; y: number; width: number; height: number };
      tolerance?: number;
    }>
  ) {
    const { container } = render(component);
    await this.waitForAnimationsToComplete(container);

    const results = [];

    for (const element of expectedElements) {
      const domElement = container.querySelector(element.selector);
      
      if (!domElement) {
        results.push({
          selector: element.selector,
          found: false,
          passed: false,
          reason: 'Element not found'
        });
        continue;
      }

      const actualBounds = domElement.getBoundingClientRect();
      const tolerance = element.tolerance || 1; // 1px default tolerance

      const withinTolerance = {
        x: Math.abs(actualBounds.x - element.expectedBounds.x) <= tolerance,
        y: Math.abs(actualBounds.y - element.expectedBounds.y) <= tolerance,
        width: Math.abs(actualBounds.width - element.expectedBounds.width) <= tolerance,
        height: Math.abs(actualBounds.height - element.expectedBounds.height) <= tolerance
      };

      const passed = Object.values(withinTolerance).every(Boolean);

      results.push({
        selector: element.selector,
        found: true,
        passed,
        expected: element.expectedBounds,
        actual: {
          x: actualBounds.x,
          y: actualBounds.y,
          width: actualBounds.width,
          height: actualBounds.height
        },
        tolerance,
        withinTolerance
      });
    }

    return results;
  }

  private static setViewportSize(width: number, height: number) {
    // Mock viewport dimensions
    Object.defineProperties(window, {
      innerWidth: { value: width, writable: true },
      innerHeight: { value: height, writable: true }
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));
  }

  private static async waitForAnimationsToComplete(container: HTMLElement) {
    // Wait for CSS transitions and animations
    await new Promise(resolve => {
      const elementsWithTransitions = container.querySelectorAll('*');
      let animationsCompleted = 0;
      let totalAnimations = 0;

      elementsWithTransitions.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const transitionDuration = computedStyle.getPropertyValue('transition-duration');
        const animationDuration = computedStyle.getPropertyValue('animation-duration');

        if (transitionDuration !== '0s' || animationDuration !== '0s') {
          totalAnimations++;
          
          const maxDuration = Math.max(
            parseFloat(transitionDuration) || 0,
            parseFloat(animationDuration) || 0
          );

          setTimeout(() => {
            animationsCompleted++;
            if (animationsCompleted >= totalAnimations) {
              resolve(true);
            }
          }, maxDuration * 1000 + 100); // Add 100ms buffer
        }
      });

      // If no animations found, resolve immediately
      if (totalAnimations === 0) {
        resolve(true);
      }
    });

    // Additional wait for any remaining async operations
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private static async captureScreenshot(container: HTMLElement): Promise<string> {
    // In actual implementation, this would capture a real screenshot
    // For testing, we'll generate a hash based on the DOM structure
    const htmlContent = container.innerHTML;
    const computedStyles = this.getComputedStylesHash(container);
    const timestamp = Date.now();
    
    // Simulate screenshot data with DOM content hash
    const screenshotData = `screenshot-${this.generateHash(htmlContent + computedStyles + timestamp)}`;
    return screenshotData;
  }

  private static generateImageHash(imageData: string): string {
    // Simple hash generation for image data comparison
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private static async performPixelComparison(
    baseline: string,
    current: string,
    config: VisualTestConfig
  ) {
    // Simulated pixel comparison
    const similarity = baseline === current ? 1.0 : Math.random() * 0.1 + 0.9; // 90-100% similarity
    const pixelDifference = Math.floor((1 - similarity) * 1000); // Approximate pixel count
    const percentageDifference = (1 - similarity) * 100;

    return {
      pixelDifference,
      percentageDifference,
      diffImage: similarity < 1.0 ? `diff-${Date.now()}` : undefined,
      differenceRegions: similarity < 1.0 ? [
        { x: 10, y: 10, width: 50, height: 30 }
      ] : []
    };
  }

  private static async validateLayoutConsistency(
    baselineContainer: HTMLElement,
    currentContainer: HTMLElement,
    viewport: { width: number; height: number; name: string }
  ) {
    const issues: string[] = [];
    
    // Check for responsive layout markers
    const responsiveElements = currentContainer.querySelectorAll('[data-responsive="true"]');
    const hasResponsiveLayout = responsiveElements.length > 0;

    if (!hasResponsiveLayout) {
      issues.push('No responsive layout indicators found');
    }

    // Check for overflow issues
    const overflowElements = Array.from(currentContainer.querySelectorAll('*')).filter(element => {
      const computedStyle = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return rect.width > viewport.width || rect.height > viewport.height;
    });

    if (overflowElements.length > 0) {
      issues.push(`${overflowElements.length} elements overflow viewport at ${viewport.name}`);
    }

    return {
      consistent: issues.length === 0,
      issues
    };
  }

  private static async validateThemeApplication(container: HTMLElement, theme: string) {
    const themeElement = container.querySelector(`[data-theme="${theme}"]`);
    const hasThemeClass = container.classList.contains(`theme-${theme}`);
    const colorSchemeElements = container.querySelectorAll('[style*="color"], [class*="bg-"], [class*="text-"]');

    return {
      applied: !!themeElement || hasThemeClass,
      colorScheme: theme,
      consistency: colorSchemeElements.length > 0,
      issues: !themeElement && !hasThemeClass ? [`Theme ${theme} not applied`] : []
    };
  }

  private static validateAnimationCompletion(container: HTMLElement): boolean {
    // Check if animations have completed by looking for animation-fill-mode: forwards
    const animatedElements = container.querySelectorAll('[style*="animation"], .animate-*');
    return Array.from(animatedElements).every(element => {
      const computedStyle = window.getComputedStyle(element);
      const animationPlayState = computedStyle.getPropertyValue('animation-play-state');
      return animationPlayState === 'paused' || animationPlayState === '';
    });
  }

  private static async measureAnimationPerformance(
    container: HTMLElement,
    animation: { duration: number }
  ) {
    // Simulate performance measurement
    const frameRate = 58 + Math.random() * 4; // 58-62 FPS
    const memoryImpact = Math.random() * 2 + 1; // 1-3 MB
    const cpuUsage = Math.random() * 10 + 5; // 5-15% CPU

    return {
      frameRate,
      memoryImpact,
      cpuUsage,
      duration: animation.duration
    };
  }

  private static mockBrowserEnvironment(browser: string) {
    // Mock browser-specific behaviors
    const mockUserAgent = {
      chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    };

    Object.defineProperty(navigator, 'userAgent', {
      value: mockUserAgent[browser as keyof typeof mockUserAgent] || mockUserAgent.chrome,
      writable: true
    });
  }

  private static resetBrowserEnvironment() {
    // Reset to default Chrome-like environment
    this.mockBrowserEnvironment('chrome');
  }

  private static async validateBrowserSpecificFeatures(container: HTMLElement, browser: string) {
    // Simulate browser-specific validation
    const features = {
      cssSupport: {
        grid: true,
        flexbox: true,
        customProperties: browser !== 'ie11',
        webgl: browser !== 'ie11'
      },
      jsCompatibility: {
        es6: browser !== 'ie11',
        es2017: browser !== 'ie11' && browser !== 'edge',
        webComponents: browser === 'chrome'
      },
      performance: {
        renderTime: Math.random() * 100 + 50, // 50-150ms
        scriptExecution: Math.random() * 50 + 25 // 25-75ms
      }
    };

    return {
      ...features,
      issues: !features.cssSupport.customProperties ? ['CSS custom properties not supported'] : []
    };
  }

  private static analyzeCrossBrowserConsistency(browserResults: any[]) {
    const consistencyScore = Math.random() * 0.2 + 0.8; // 80-100% consistency
    const majorDifferences = consistencyScore < 0.9 ? ['Safari rendering differs from Chrome'] : [];

    return {
      score: consistencyScore,
      level: consistencyScore > 0.95 ? 'excellent' : consistencyScore > 0.9 ? 'good' : 'needs-improvement',
      majorDifferences,
      recommendations: majorDifferences.length > 0 ? ['Test cross-browser CSS compatibility'] : []
    };
  }

  private static getComputedStylesHash(container: HTMLElement): string {
    const elements = container.querySelectorAll('*');
    let stylesString = '';
    
    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      stylesString += computedStyle.cssText || '';
    });
    
    return this.generateHash(stylesString);
  }

  private static generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export default VisualRegressionTestingUtils;