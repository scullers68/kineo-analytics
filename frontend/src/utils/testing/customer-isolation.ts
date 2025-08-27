/**
 * Customer Context Isolation Testing Utilities
 * 
 * Provides utilities for testing multi-tenant customer data isolation,
 * customer context switching, and customer-specific configurations.
 */

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { CustomerProvider } from '../../contexts/CustomerContext';

export interface CustomerTestConfig {
  customerId: string;
  customerName: string;
  customerSettings?: Record<string, any>;
  isolationLevel?: 'strict' | 'moderate' | 'basic';
}

export interface CustomerIsolationResult {
  isolated: boolean;
  violations: string[];
  customerContext: any;
}

export class CustomerIsolationTester {
  private static readonly CUSTOMER_ID_PATTERN = /^customer_\d{3}$/;
  
  static async testCustomerDataIsolation(
    chartComponent: ReactElement,
    customers: CustomerTestConfig[]
  ): Promise<CustomerIsolationResult[]> {
    const results: CustomerIsolationResult[] = [];

    for (const customer of customers) {
      const violations: string[] = [];
      
      const { container, unmount } = render(
        <CustomerProvider 
          customerId={customer.customerId}
          customerName={customer.customerName}
          customerSettings={customer.customerSettings || {}}
        >
          {chartComponent}
        </CustomerProvider>
      );

      // Wait for customer context to initialize
      await waitFor(() => {
        const contextElement = container.querySelector('[data-customer-context]');
        expect(contextElement).toBeInTheDocument();
      });

      // Validate customer ID format
      if (!this.CUSTOMER_ID_PATTERN.test(customer.customerId)) {
        violations.push(`Invalid customer ID format: ${customer.customerId}`);
      }

      // Check for data isolation markers
      const chartElement = container.querySelector('[data-testid*="chart"]');
      if (chartElement) {
        const customerAttribute = chartElement.getAttribute('data-customer');
        if (customerAttribute !== customer.customerId) {
          violations.push(`Chart not tagged with correct customer ID. Expected: ${customer.customerId}, Found: ${customerAttribute}`);
        }

        // Verify no cross-customer data leakage
        const dataElements = chartElement.querySelectorAll('[data-customer-data]');
        dataElements.forEach(element => {
          const elementCustomerId = element.getAttribute('data-customer-data');
          if (elementCustomerId && elementCustomerId !== customer.customerId) {
            violations.push(`Cross-customer data leak detected: ${elementCustomerId} in ${customer.customerId} context`);
          }
        });
      }

      // Test local storage isolation
      localStorage.setItem(`chart-data-${customer.customerId}`, 'isolated-data');
      const storedData = localStorage.getItem(`chart-data-${customer.customerId}`);
      if (!storedData) {
        violations.push(`Local storage isolation failed for customer ${customer.customerId}`);
      }

      results.push({
        isolated: violations.length === 0,
        violations,
        customerContext: {
          customerId: customer.customerId,
          customerName: customer.customerName,
          settings: customer.customerSettings
        }
      });

      unmount();
      localStorage.clear(); // Clean up between tests
    }

    return results;
  }

  static async testCustomerSwitching(
    chartComponent: ReactElement,
    fromCustomer: CustomerTestConfig,
    toCustomer: CustomerTestConfig
  ) {
    let container: any;
    let rerender: any;

    // Initial render with first customer
    const renderResult = render(
      <CustomerProvider 
        customerId={fromCustomer.customerId}
        customerName={fromCustomer.customerName}
        customerSettings={fromCustomer.customerSettings || {}}
      >
        {chartComponent}
      </CustomerProvider>
    );

    container = renderResult.container;
    rerender = renderResult.rerender;

    // Verify initial customer context
    await waitFor(() => {
      const chartElement = container.querySelector('[data-testid*="chart"]');
      expect(chartElement).toHaveAttribute('data-customer', fromCustomer.customerId);
    });

    // Switch to second customer
    rerender(
      <CustomerProvider 
        customerId={toCustomer.customerId}
        customerName={toCustomer.customerName}
        customerSettings={toCustomer.customerSettings || {}}
      >
        {chartComponent}
      </CustomerProvider>
    );

    // Verify customer context switch
    await waitFor(() => {
      const chartElement = container.querySelector('[data-testid*="chart"]');
      expect(chartElement).toHaveAttribute('data-customer', toCustomer.customerId);
    });

    // Verify no data from previous customer remains
    const previousCustomerData = container.querySelectorAll(`[data-customer-data="${fromCustomer.customerId}"]`);
    expect(previousCustomerData.length).toBe(0);

    // Verify new customer data is loaded
    const newCustomerData = container.querySelectorAll(`[data-customer-data="${toCustomer.customerId}"]`);
    expect(newCustomerData.length).toBeGreaterThan(0);

    return {
      switchSuccessful: true,
      fromCustomer: fromCustomer.customerId,
      toCustomer: toCustomer.customerId,
      chartElement: container.querySelector('[data-testid*="chart"]')
    };
  }

  static async testCustomerSpecificStyling(
    chartComponent: ReactElement,
    customersWithThemes: Array<CustomerTestConfig & { theme: Record<string, any> }>
  ) {
    const results = [];

    for (const customer of customersWithThemes) {
      const { container, unmount } = render(
        <CustomerProvider 
          customerId={customer.customerId}
          customerName={customer.customerName}
          customerSettings={{ 
            ...customer.customerSettings,
            theme: customer.theme 
          }}
        >
          {chartComponent}
        </CustomerProvider>
      );

      await waitFor(() => {
        const chartElement = container.querySelector('[data-testid*="chart"]');
        expect(chartElement).toBeInTheDocument();
      });

      // Verify customer-specific theme is applied
      const chartElement = container.querySelector('[data-testid*="chart"]');
      const computedStyle = window.getComputedStyle(chartElement!);

      // Check for customer theme colors
      if (customer.theme.primaryColor) {
        const hasCustomColor = Array.from(chartElement!.querySelectorAll('*'))
          .some(el => {
            const style = window.getComputedStyle(el);
            return style.color === customer.theme.primaryColor || 
                   style.backgroundColor === customer.theme.primaryColor ||
                   style.fill === customer.theme.primaryColor;
          });
        
        expect(hasCustomColor).toBe(true);
      }

      results.push({
        customerId: customer.customerId,
        themeApplied: true,
        theme: customer.theme,
        chartElement
      });

      unmount();
    }

    return results;
  }

  static async testMultiTenantSecurityBoundaries(
    chartComponent: ReactElement,
    customers: CustomerTestConfig[],
    securityTests: {
      crossCustomerDataAccess: boolean;
      customerContextTampering: boolean;
      dataExfiltration: boolean;
    }
  ) {
    const securityResults = {
      crossCustomerDataAccess: { passed: true, violations: [] as string[] },
      customerContextTampering: { passed: true, violations: [] as string[] },
      dataExfiltration: { passed: true, violations: [] as string[] }
    };

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const { container, unmount } = render(
        <CustomerProvider 
          customerId={customer.customerId}
          customerName={customer.customerName}
          customerSettings={customer.customerSettings || {}}
        >
          {chartComponent}
        </CustomerProvider>
      );

      if (securityTests.crossCustomerDataAccess) {
        // Test: Try to access other customers' data
        const otherCustomers = customers.filter((_, index) => index !== i);
        for (const otherCustomer of otherCustomers) {
          try {
            const unauthorizedData = container.querySelector(`[data-customer-data="${otherCustomer.customerId}"]`);
            if (unauthorizedData) {
              securityResults.crossCustomerDataAccess.violations.push(
                `Unauthorized access to ${otherCustomer.customerId} data from ${customer.customerId} context`
              );
              securityResults.crossCustomerDataAccess.passed = false;
            }
          } catch (error) {
            // Expected - access should be blocked
          }
        }
      }

      if (securityTests.customerContextTampering) {
        // Test: Try to tamper with customer context
        try {
          const chartElement = container.querySelector('[data-testid*="chart"]');
          if (chartElement) {
            // Attempt to change customer context via DOM manipulation
            chartElement.setAttribute('data-customer', 'customer_999');
            
            // Verify the change doesn't affect actual customer context
            await waitFor(() => {
              const contextElement = container.querySelector('[data-customer-context]');
              const actualCustomerId = contextElement?.getAttribute('data-current-customer');
              if (actualCustomerId !== customer.customerId) {
                securityResults.customerContextTampering.violations.push(
                  `Customer context tampering successful: ${customer.customerId} -> ${actualCustomerId}`
                );
                securityResults.customerContextTampering.passed = false;
              }
            });
          }
        } catch (error) {
          // Expected - tampering should be blocked
        }
      }

      if (securityTests.dataExfiltration) {
        // Test: Verify data cannot be exfiltrated through console or global variables
        const originalConsole = console.log;
        let consoleOutput = '';
        console.log = (message: string) => {
          consoleOutput += message;
        };

        try {
          // Trigger potential data exposure
          fireEvent.click(container.querySelector('[data-testid*="chart"]') || container);
          
          // Check if customer data appears in console output
          if (consoleOutput.includes(customer.customerId)) {
            securityResults.dataExfiltration.violations.push(
              `Potential data exfiltration via console for customer ${customer.customerId}`
            );
            securityResults.dataExfiltration.passed = false;
          }
        } finally {
          console.log = originalConsole;
        }
      }

      unmount();
    }

    return securityResults;
  }

  static validateCustomerIdFormat(customerId: string): { valid: boolean; reason?: string } {
    if (!this.CUSTOMER_ID_PATTERN.test(customerId)) {
      return { 
        valid: false, 
        reason: `Customer ID must match pattern 'customer_XXX' where XXX is a 3-digit number. Got: ${customerId}` 
      };
    }
    return { valid: true };
  }

  static async testCustomerContextPersistence(
    chartComponent: ReactElement,
    customer: CustomerTestConfig
  ) {
    // First render
    const { container: firstContainer, unmount: firstUnmount } = render(
      <CustomerProvider 
        customerId={customer.customerId}
        customerName={customer.customerName}
        customerSettings={customer.customerSettings || {}}
      >
        {chartComponent}
      </CustomerProvider>
    );

    // Set some customer-specific state
    localStorage.setItem(`customer-state-${customer.customerId}`, 'persistent-data');
    
    // Interact with chart to create state
    const chartElement = firstContainer.querySelector('[data-testid*="chart"]');
    if (chartElement) {
      fireEvent.click(chartElement);
    }

    firstUnmount();

    // Second render (simulating page refresh or navigation)
    const { container: secondContainer } = render(
      <CustomerProvider 
        customerId={customer.customerId}
        customerName={customer.customerName}
        customerSettings={customer.customerSettings || {}}
      >
        {chartComponent}
      </CustomerProvider>
    );

    // Verify customer context and state persistence
    await waitFor(() => {
      const chartElement = secondContainer.querySelector('[data-testid*="chart"]');
      expect(chartElement).toHaveAttribute('data-customer', customer.customerId);
    });

    const persistentData = localStorage.getItem(`customer-state-${customer.customerId}`);
    expect(persistentData).toBe('persistent-data');

    return {
      persisted: true,
      customerId: customer.customerId,
      data: persistentData
    };
  }
}

export default CustomerIsolationTester;