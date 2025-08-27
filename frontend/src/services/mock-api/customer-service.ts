/**
 * Mock Customer Service
 * 
 * Simulates customer management operations including multi-tenant switching,
 * customer data retrieval, and customer context management.
 */

import { MockDataGenerator, Customer } from './data-generator';
import { config } from './config';

export class MockCustomerService {
  private dataGenerator: MockDataGenerator;
  private customers: Customer[];
  private currentCustomer: Customer | null = null;

  constructor() {
    this.dataGenerator = new MockDataGenerator();
    this.customers = this.dataGenerator.generateCustomers();
    // Set default current customer
    this.currentCustomer = this.customers[0];
  }

  /**
   * Simulate network delay based on configuration
   */
  private async simulateDelay(): Promise<void> {
    const delay = config.delay + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if error should be simulated
   */
  private shouldSimulateError(): boolean {
    return Math.random() < config.errorRate;
  }

  /**
   * Get list of all available customers
   */
  async getCustomers(): Promise<Customer[]> {
    await this.simulateDelay();

    // Check for global error simulation
    const errorSimulator = (global as any).MockErrorSimulator;
    if (errorSimulator?.shouldSimulateGlobalError?.()) {
      throw new Error('Internal server error');
    }

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch customers');
    }

    return [...this.customers];
  }

  /**
   * Get specific customer by ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    await this.simulateDelay();

    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch customer');
    }

    return { ...customer };
  }

  /**
   * Switch to different customer context
   */
  async switchCustomer(customerId: string): Promise<void> {
    await this.simulateDelay();

    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (this.shouldSimulateError()) {
      throw new Error('Failed to switch customer');
    }

    this.currentCustomer = customer;
  }

  /**
   * Get currently active customer
   */
  async getCurrentCustomer(): Promise<Customer> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to get current customer');
    }

    if (!this.currentCustomer) {
      // Return default customer if none is set
      this.currentCustomer = this.customers[0];
    }

    return { ...this.currentCustomer };
  }

  /**
   * Update customer settings
   */
  async updateCustomerSettings(customerId: string, settings: Partial<Customer['settings']>): Promise<Customer> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to update customer settings');
    }

    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    this.customers[customerIndex].settings = {
      ...this.customers[customerIndex].settings,
      ...settings,
    };

    // Update current customer if it's the one being modified
    if (this.currentCustomer?.id === customerId) {
      this.currentCustomer = this.customers[customerIndex];
    }

    return { ...this.customers[customerIndex] };
  }

  /**
   * Create new customer (admin operation)
   */
  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to create customer');
    }

    const newCustomer: Customer = {
      ...customerData,
      id: `customer${String(this.customers.length + 1).padStart(3, '0')}`,
    };

    this.customers.push(newCustomer);
    return { ...newCustomer };
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId: string, updates: Partial<Omit<Customer, 'id'>>): Promise<Customer> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to update customer');
    }

    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updates,
    };

    // Update current customer if it's the one being modified
    if (this.currentCustomer?.id === customerId) {
      this.currentCustomer = this.customers[customerIndex];
    }

    return { ...this.customers[customerIndex] };
  }

  /**
   * Delete customer (admin operation)
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to delete customer');
    }

    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    this.customers.splice(customerIndex, 1);

    // Reset current customer if the deleted one was current
    if (this.currentCustomer?.id === customerId) {
      this.currentCustomer = this.customers.length > 0 ? this.customers[0] : null;
    }
  }

  /**
   * Search customers by name or subdomain
   */
  async searchCustomers(query: string): Promise<Customer[]> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to search customers');
    }

    const lowerQuery = query.toLowerCase();
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.subdomain.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export for both ES modules and CommonJS
export default MockCustomerService;