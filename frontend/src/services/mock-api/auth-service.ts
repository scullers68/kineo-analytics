/**
 * Mock Authentication Service
 * 
 * Simulates authentication flows for development including login, logout,
 * token refresh, and user session management with realistic delays and responses.
 */

import { MockDataGenerator, User } from './data-generator';
import { config } from './config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export class MockAuthService {
  private dataGenerator: MockDataGenerator;
  private currentUser: User | null = null;
  private validTokens = new Set<string>();
  private validRefreshTokens = new Set<string>();

  constructor() {
    this.dataGenerator = new MockDataGenerator();
  }

  /**
   * Simulate network delay based on configuration
   */
  private async simulateDelay(): Promise<void> {
    const delay = config.delay + Math.random() * 100; // Add some randomness
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if error should be simulated
   */
  private shouldSimulateError(): boolean {
    return Math.random() < config.errorRate;
  }

  /**
   * Generate JWT-like token
   */
  private generateToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: this.currentUser?.id,
      username: this.currentUser?.username,
      customerId: this.currentUser?.customerId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(): string {
    return btoa(`refresh-${Date.now()}-${Math.random().toString(36)}`);
  }

  /**
   * Get user by credentials
   */
  private getUserByCredentials(credentials: LoginCredentials): User | null {
    // Extract customer ID from username if it contains @customer pattern
    // This will be used for customer context matching if needed in the future

    // Valid test credentials
    const validCredentials = [
      { username: 'admin@customer001.com', password: 'password123', customerId: 'customer001', role: 'admin' },
      { username: 'user@customer002.com', password: 'password123', customerId: 'customer002', role: 'user' },
      { username: 'manager@customer003.com', password: 'password123', customerId: 'customer003', role: 'manager' },
    ];

    const validCred = validCredentials.find(cred => 
      cred.username === credentials.username && cred.password === credentials.password
    );

    if (validCred) {
      return {
        id: this.dataGenerator['generateUUID'](),
        username: validCred.username,
        email: validCred.username,
        role: validCred.role,
        customerId: validCred.customerId,
        permissions: this.getPermissionsByRole(validCred.role),
      };
    }

    return null;
  }

  /**
   * Get permissions based on role
   */
  private getPermissionsByRole(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['read', 'write', 'admin', 'analytics', 'reports'];
      case 'manager':
        return ['read', 'write', 'analytics'];
      case 'analyst':
        return ['read', 'analytics', 'reports'];
      default:
        return ['read'];
    }
  }

  /**
   * Authenticate user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.simulateDelay();

    // Check credentials first - this takes priority over error simulation
    const user = this.getUserByCredentials(credentials);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check for global error simulation after credentials are validated
    const errorSimulator = (global as any).MockErrorSimulator;
    if (errorSimulator?.shouldSimulateError?.('auth')) {
      throw new Error('Unauthorized');
    }

    // Only simulate errors when config error rate is > 0 and not in test environment
    if (config.errorRate > 0 && process.env.NODE_ENV !== 'test' && this.shouldSimulateError()) {
      throw new Error('Authentication service temporarily unavailable');
    }

    this.currentUser = user;
    const token = this.generateToken();
    const refreshToken = this.generateRefreshToken();

    // Store valid tokens
    this.validTokens.add(token);
    this.validRefreshTokens.add(refreshToken);

    return {
      token,
      refreshToken,
      user,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Logout failed');
    }

    // Clear tokens and user session
    this.validTokens.clear();
    this.validRefreshTokens.clear();
    this.currentUser = null;
  }

  /**
   * Refresh authentication token
   */
  async refresh(token: string): Promise<AuthResponse> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Token refresh failed');
    }

    // Handle test cases with hardcoded tokens
    if (token === 'valid-refresh-token') {
      // Set up a default user for testing if none exists
      if (!this.currentUser) {
        this.currentUser = {
          id: this.dataGenerator['generateUUID'](),
          username: 'test.user',
          email: 'test.user@customer001.com',
          role: 'user',
          customerId: 'customer001',
          permissions: ['read', 'write'],
        };
      }

      const newToken = this.generateToken();
      const newRefreshToken = this.generateRefreshToken();

      // Add new tokens to valid sets
      this.validTokens.add(newToken);
      this.validRefreshTokens.add(newRefreshToken);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: this.currentUser,
        expiresIn: 3600,
      };
    }

    if (!this.validRefreshTokens.has(token)) {
      throw new Error('Invalid refresh token');
    }

    if (!this.currentUser) {
      throw new Error('No active session');
    }

    // Generate new tokens
    const newToken = this.generateToken();
    const newRefreshToken = this.generateRefreshToken();

    // Update token sets
    this.validRefreshTokens.delete(token);
    this.validTokens.add(newToken);
    this.validRefreshTokens.add(newRefreshToken);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      user: this.currentUser,
      expiresIn: 3600,
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<boolean> {
    await this.simulateDelay();

    // Check for expired-jwt-token test case first
    if (token === 'expired-jwt-token') {
      return false;
    }

    // Check for valid-jwt-token test case
    if (token === 'valid-jwt-token') {
      return true;
    }

    // Check for token expiration simulation
    const errorSimulator = (global as any).MockErrorSimulator;
    if (errorSimulator?.isTokenExpired) {
      return false;
    }

    // Only simulate errors for real tokens (not test cases)
    if (this.shouldSimulateError() && !token.includes('test-') && !token.includes('valid-') && !token.includes('expired-')) {
      throw new Error('Token validation failed');
    }

    return this.validTokens.has(token);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to get current user');
    }

    if (!this.currentUser) {
      // Return a default user for testing
      this.currentUser = {
        id: this.dataGenerator['generateUUID'](),
        username: 'test.user',
        email: 'test.user@customer001.com',
        role: 'user',
        customerId: 'customer001',
        permissions: ['read', 'write'],
      };
    }

    return this.currentUser;
  }
}