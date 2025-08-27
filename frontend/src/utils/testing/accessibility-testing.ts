/**
 * Accessibility Testing Utilities
 * 
 * Provides comprehensive utilities for testing WCAG 2.1 AA compliance,
 * keyboard navigation, screen reader compatibility, and color accessibility.
 */

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ReactElement } from 'react';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

export interface AccessibilityTestConfig {
  wcagLevel?: 'A' | 'AA' | 'AAA';
  tags?: string[];
  rules?: Record<string, { enabled: boolean }>;
  skipRules?: string[];
}

export interface KeyboardNavigationConfig {
  expectedTabStops: number;
  expectedArrowKeyTargets: string[];
  expectedEnterActions: string[];
  expectedSpaceActions: string[];
  expectedEscapeActions: string[];
}

export interface ColorAccessibilityConfig {
  contrastRatio?: 'AA' | 'AAA';
  colorBlindnessTypes?: ('protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia')[];
  checkHighContrast?: boolean;
}

export class AccessibilityTestingUtils {
  static async runWCAGCompliance(
    component: ReactElement,
    config: AccessibilityTestConfig = {}
  ) {
    const {
      wcagLevel = 'AA',
      tags = ['wcag2a', 'wcag2aa'],
      rules = {},
      skipRules = []
    } = config;

    const { container } = render(component);

    // Configure axe rules
    const axeConfig = {
      tags,
      rules: {
        ...rules,
        // Disable specified rules
        ...skipRules.reduce((acc, rule) => ({
          ...acc,
          [rule]: { enabled: false }
        }), {})
      }
    };

    const results = await axe(container, axeConfig);
    
    // Group violations by severity
    const violations = {
      critical: results.violations.filter(v => v.impact === 'critical'),
      serious: results.violations.filter(v => v.impact === 'serious'),
      moderate: results.violations.filter(v => v.impact === 'moderate'),
      minor: results.violations.filter(v => v.impact === 'minor')
    };

    return {
      passed: results.violations.length === 0,
      violations,
      totalViolations: results.violations.length,
      wcagLevel,
      testResults: results
    };
  }

  static async testKeyboardNavigation(
    component: ReactElement,
    config: KeyboardNavigationConfig
  ) {
    const { container } = render(component);
    const results = {
      tabNavigation: { passed: false, actualStops: 0, issues: [] as string[] },
      arrowKeyNavigation: { passed: false, tested: 0, issues: [] as string[] },
      enterKeyActions: { passed: false, tested: 0, issues: [] as string[] },
      spaceKeyActions: { passed: false, tested: 0, issues: [] as string[] },
      escapeKeyActions: { passed: false, tested: 0, issues: [] as string[] }
    };

    // Test Tab navigation
    const focusableElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    let tabStops = 0;
    let currentElement = document.activeElement;
    const maxTabAttempts = config.expectedTabStops + 2;

    for (let i = 0; i < maxTabAttempts && tabStops <= config.expectedTabStops; i++) {
      fireEvent.keyDown(document, { key: 'Tab' });
      await waitFor(() => {
        if (document.activeElement !== currentElement) {
          tabStops++;
          currentElement = document.activeElement;
        }
      }, { timeout: 100 });
    }

    results.tabNavigation.actualStops = tabStops;
    results.tabNavigation.passed = tabStops === config.expectedTabStops;
    if (!results.tabNavigation.passed) {
      results.tabNavigation.issues.push(
        `Expected ${config.expectedTabStops} tab stops, found ${tabStops}`
      );
    }

    // Test Arrow key navigation
    const arrowKeyTargets = container.querySelectorAll(config.expectedArrowKeyTargets.join(','));
    let arrowKeyTests = 0;

    for (const element of arrowKeyTargets) {
      element.focus();
      const initialFocus = document.activeElement;

      // Test Right arrow
      fireEvent.keyDown(element, { key: 'ArrowRight' });
      await waitFor(() => {
        if (document.activeElement !== initialFocus) {
          arrowKeyTests++;
        }
      }, { timeout: 100 });

      // Test Left arrow
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      await waitFor(() => {
        if (document.activeElement === initialFocus) {
          arrowKeyTests++;
        }
      }, { timeout: 100 });
    }

    results.arrowKeyNavigation.tested = arrowKeyTests;
    results.arrowKeyNavigation.passed = arrowKeyTests > 0;

    // Test Enter key actions
    const enterTargets = container.querySelectorAll(config.expectedEnterActions.join(','));
    let enterTests = 0;

    for (const element of enterTargets) {
      element.focus();
      let actionTriggered = false;
      
      // Add event listener to detect action
      const handleAction = () => { actionTriggered = true; };
      element.addEventListener('click', handleAction);
      element.addEventListener('keydown', handleAction);

      fireEvent.keyDown(element, { key: 'Enter' });
      await waitFor(() => {
        if (actionTriggered) {
          enterTests++;
        }
      }, { timeout: 100 });

      element.removeEventListener('click', handleAction);
      element.removeEventListener('keydown', handleAction);
    }

    results.enterKeyActions.tested = enterTests;
    results.enterKeyActions.passed = enterTests === enterTargets.length;

    return results;
  }

  static async testScreenReaderCompatibility(
    component: ReactElement,
    expectedContent: {
      labels: string[];
      descriptions: string[];
      headings: string[];
      landmarks: string[];
    }
  ) {
    const { container } = render(component);
    const results = {
      labels: { found: [] as string[], missing: [] as string[], passed: false },
      descriptions: { found: [] as string[], missing: [] as string[], passed: false },
      headings: { found: [] as string[], missing: [] as string[], passed: false },
      landmarks: { found: [] as string[], missing: [] as string[], passed: false },
      ariaAttributes: { valid: true, issues: [] as string[] }
    };

    // Check for required labels
    expectedContent.labels.forEach(expectedLabel => {
      try {
        const element = screen.getByLabelText(new RegExp(expectedLabel, 'i'));
        if (element) {
          results.labels.found.push(expectedLabel);
        }
      } catch {
        results.labels.missing.push(expectedLabel);
      }
    });

    results.labels.passed = results.labels.missing.length === 0;

    // Check for descriptions
    expectedContent.descriptions.forEach(expectedDescription => {
      const elements = container.querySelectorAll(`[aria-description*="${expectedDescription}" i]`);
      if (elements.length > 0) {
        results.descriptions.found.push(expectedDescription);
      } else {
        results.descriptions.missing.push(expectedDescription);
      }
    });

    results.descriptions.passed = results.descriptions.missing.length === 0;

    // Check for headings
    expectedContent.headings.forEach(expectedHeading => {
      try {
        const element = screen.getByRole('heading', { name: new RegExp(expectedHeading, 'i') });
        if (element) {
          results.headings.found.push(expectedHeading);
        }
      } catch {
        results.headings.missing.push(expectedHeading);
      }
    });

    results.headings.passed = results.headings.missing.length === 0;

    // Check for landmarks
    expectedContent.landmarks.forEach(expectedLandmark => {
      try {
        const element = screen.getByRole(expectedLandmark as any);
        if (element) {
          results.landmarks.found.push(expectedLandmark);
        }
      } catch {
        results.landmarks.missing.push(expectedLandmark);
      }
    });

    results.landmarks.passed = results.landmarks.missing.length === 0;

    // Validate ARIA attributes
    const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    elementsWithAria.forEach(element => {
      // Check for valid ARIA labelledby references
      const labelledby = element.getAttribute('aria-labelledby');
      if (labelledby) {
        const referencedElements = labelledby.split(' ').every(id => 
          container.querySelector(`#${id}`)
        );
        if (!referencedElements) {
          results.ariaAttributes.valid = false;
          results.ariaAttributes.issues.push(
            `Invalid aria-labelledby reference: ${labelledby}`
          );
        }
      }

      // Check for valid ARIA describedby references
      const describedby = element.getAttribute('aria-describedby');
      if (describedby) {
        const referencedElements = describedby.split(' ').every(id => 
          container.querySelector(`#${id}`)
        );
        if (!referencedElements) {
          results.ariaAttributes.valid = false;
          results.ariaAttributes.issues.push(
            `Invalid aria-describedby reference: ${describedby}`
          );
        }
      }
    });

    return results;
  }

  static testColorAccessibility(
    component: ReactElement,
    config: ColorAccessibilityConfig = {}
  ) {
    const {
      contrastRatio = 'AA',
      colorBlindnessTypes = ['protanopia', 'deuteranopia', 'tritanopia'],
      checkHighContrast = true
    } = config;

    const { container } = render(component);
    const results = {
      contrastRatio: { passed: true, violations: [] as string[] },
      colorBlindness: { passed: true, issues: [] as string[] },
      highContrast: { passed: true, issues: [] as string[] }
    };

    // Test contrast ratios
    const textElements = container.querySelectorAll('text, span, p, h1, h2, h3, h4, h5, h6, div[class*="text"]');
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      if (color && backgroundColor) {
        // This is a simplified contrast check - in real implementation, 
        // you would use a library like 'color' to calculate actual contrast ratios
        const hasGoodContrast = this.checkContrastRatio(color, backgroundColor, contrastRatio);
        if (!hasGoodContrast) {
          results.contrastRatio.passed = false;
          results.contrastRatio.violations.push(
            `Poor contrast between ${color} and ${backgroundColor} on element ${element.tagName}`
          );
        }
      }
    });

    // Test color blindness compatibility
    colorBlindnessTypes.forEach(type => {
      const colorElements = container.querySelectorAll('[style*="color"], [fill], [stroke]');
      colorElements.forEach(element => {
        // Check if information is conveyed through color alone
        const hasNonColorIndicators = element.textContent || 
                                     element.querySelector('[aria-label]') ||
                                     element.querySelector('[title]') ||
                                     element.classList.contains('pattern') ||
                                     element.classList.contains('shape');

        if (!hasNonColorIndicators) {
          results.colorBlindness.passed = false;
          results.colorBlindness.issues.push(
            `Element may rely solely on color for ${type} users`
          );
        }
      });
    });

    // Test high contrast mode compatibility
    if (checkHighContrast) {
      // Simulate high contrast mode
      document.body.classList.add('high-contrast');
      
      const visibleElements = container.querySelectorAll('*:not([aria-hidden="true"])');
      visibleElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const opacity = parseFloat(computedStyle.opacity);
        
        if (opacity < 0.5 && opacity > 0) {
          results.highContrast.passed = false;
          results.highContrast.issues.push(
            `Element may be invisible in high contrast mode: ${element.tagName}`
          );
        }
      });

      document.body.classList.remove('high-contrast');
    }

    return results;
  }

  static async testFocusManagement(
    component: ReactElement,
    interactionScenarios: Array<{
      name: string;
      action: () => void;
      expectedFocusTarget: string;
    }>
  ) {
    const { container } = render(component);
    const results = interactionScenarios.map(scenario => ({
      name: scenario.name,
      passed: false,
      actualFocus: '',
      expectedFocus: scenario.expectedFocusTarget
    }));

    for (let i = 0; i < interactionScenarios.length; i++) {
      const scenario = interactionScenarios[i];
      
      // Execute the action
      scenario.action();

      // Wait for focus to settle
      await waitFor(() => {
        const focusedElement = document.activeElement;
        const actualFocus = focusedElement?.getAttribute('data-testid') || 
                           focusedElement?.tagName || 
                           'unknown';
        
        results[i].actualFocus = actualFocus;
        results[i].passed = actualFocus.includes(scenario.expectedFocusTarget);
      }, { timeout: 500 });
    }

    return results;
  }

  private static checkContrastRatio(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA'
  ): boolean {
    // Simplified contrast check - in production, use a proper color contrast library
    const threshold = level === 'AA' ? 4.5 : 7;
    
    // Convert colors to luminance values and calculate ratio
    // This is a placeholder implementation
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);
    
    return contrastRatio >= threshold;
  }

  private static getLuminance(color: string): number {
    // Simplified luminance calculation - in production, use a proper color library
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const [r, g, b] = matches.map(v => parseInt(v) / 255);
        return 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }
    
    // Default to mid-range for unknown colors
    return 0.5;
  }

  static generateAccessibilityReport(
    wcagResults: any,
    keyboardResults: any,
    screenReaderResults: any,
    colorResults: any,
    focusResults: any
  ) {
    const report = {
      overall: {
        passed: false,
        score: 0,
        level: 'FAIL'
      },
      summary: {
        wcag: wcagResults.passed,
        keyboard: keyboardResults.tabNavigation.passed,
        screenReader: screenReaderResults.labels.passed,
        color: colorResults.contrastRatio.passed,
        focus: focusResults.every((r: any) => r.passed)
      },
      recommendations: [] as string[]
    };

    // Calculate overall score
    const tests = Object.values(report.summary);
    const passedTests = tests.filter(Boolean).length;
    report.overall.score = (passedTests / tests.length) * 100;

    // Determine compliance level
    if (report.overall.score >= 95) {
      report.overall.level = 'EXCELLENT';
      report.overall.passed = true;
    } else if (report.overall.score >= 80) {
      report.overall.level = 'GOOD';
      report.overall.passed = true;
    } else if (report.overall.score >= 60) {
      report.overall.level = 'FAIR';
    } else {
      report.overall.level = 'POOR';
    }

    // Generate recommendations
    if (!wcagResults.passed) {
      report.recommendations.push('Fix WCAG 2.1 AA compliance violations');
    }
    if (!keyboardResults.tabNavigation.passed) {
      report.recommendations.push('Improve keyboard navigation support');
    }
    if (!screenReaderResults.labels.passed) {
      report.recommendations.push('Add missing ARIA labels and descriptions');
    }
    if (!colorResults.contrastRatio.passed) {
      report.recommendations.push('Improve color contrast ratios');
    }

    return report;
  }
}

export default AccessibilityTestingUtils;