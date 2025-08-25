/**
 * Mock API Interceptor
 * 
 * Development-only HTTP interceptor that routes API requests to mock services
 * when real backend APIs are not available.
 */

import { config } from './config';
import { MockAuthService } from './auth-service';
import { MockCustomerService } from './customer-service';
import { MockAnalyticsService } from './analytics-service';

export interface InterceptorConfig {
  enabled: boolean;
  baseURL: string;
  interceptedPaths: string[];
}

export interface RequestInterceptor {
  method: string;
  url: string;
  handler: (req: any) => Promise<any>;
}

class MockAPIInterceptorClass {
  private authService: MockAuthService;
  private customerService: MockCustomerService;
  private analyticsService: MockAnalyticsService;
  private interceptors: Map<string, RequestInterceptor[]> = new Map();
  private originalFetch: typeof fetch | null = null;

  constructor() {
    this.authService = new MockAuthService();
    this.customerService = new MockCustomerService();
    this.analyticsService = new MockAnalyticsService();
    this.initializeInterceptors();
  }

  /**
   * Check if interceptor should be active
   */
  get isActive(): boolean {
    return config.enabled && process.env.NODE_ENV !== 'production';
  }

  /**
   * Get list of intercepted API paths
   */
  getInterceptedPaths(): string[] {
    return [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/refresh',
      '/api/auth/validate',
      '/api/auth/me',
      '/api/customers',
      '/api/customers/:id',
      '/api/customers/current',
      '/api/customers/:id/switch',
      '/api/analytics/dashboard',
      '/api/analytics/charts',
      '/api/analytics/reports',
      '/api/analytics/summary',
    ];
  }

  /**
   * Initialize request interceptors
   */
  private initializeInterceptors(): void {
    // Authentication endpoints
    this.addInterceptor('POST', '/api/auth/login', this.handleLogin.bind(this));
    this.addInterceptor('POST', '/api/auth/logout', this.handleLogout.bind(this));
    this.addInterceptor('POST', '/api/auth/refresh', this.handleRefresh.bind(this));
    this.addInterceptor('POST', '/api/auth/validate', this.handleValidateToken.bind(this));
    this.addInterceptor('GET', '/api/auth/me', this.handleGetCurrentUser.bind(this));

    // Customer endpoints
    this.addInterceptor('GET', '/api/customers', this.handleGetCustomers.bind(this));
    this.addInterceptor('GET', '/api/customers/:id', this.handleGetCustomerById.bind(this));
    this.addInterceptor('GET', '/api/customers/current', this.handleGetCurrentCustomer.bind(this));
    this.addInterceptor('POST', '/api/customers/:id/switch', this.handleSwitchCustomer.bind(this));

    // Analytics endpoints
    this.addInterceptor('GET', '/api/analytics/dashboard', this.handleGetDashboardMetrics.bind(this));
    this.addInterceptor('GET', '/api/analytics/charts', this.handleGetChartData.bind(this));
    this.addInterceptor('GET', '/api/analytics/reports', this.handleGetReportData.bind(this));
    this.addInterceptor('GET', '/api/analytics/summary', this.handleGetAnalyticsSummary.bind(this));
  }

  /**
   * Add request interceptor
   */
  private addInterceptor(method: string, path: string, handler: (req: any) => Promise<any>): void {
    const key = `${method} ${path}`;
    if (!this.interceptors.has(key)) {
      this.interceptors.set(key, []);
    }
    this.interceptors.get(key)!.push({ method, url: path, handler });
  }

  /**
   * Install fetch interceptor
   */
  install(): void {
    if (!this.isActive || this.originalFetch) {
      return;
    }

    this.originalFetch = window.fetch;
    window.fetch = this.interceptFetch.bind(this);
  }

  /**
   * Uninstall fetch interceptor
   */
  uninstall(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }

  /**
   * Intercept fetch requests
   */
  private async interceptFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    
    // Check if this request should be intercepted
    const interceptor = this.findInterceptor(method, url);
    
    if (!interceptor) {
      // Not intercepted, use original fetch
      return this.originalFetch!(input, init);
    }

    try {
      // Parse request body
      let body = null;
      if (init?.body) {
        if (typeof init.body === 'string') {
          try {
            body = JSON.parse(init.body);
          } catch {
            body = init.body;
          }
        } else {
          body = init.body;
        }
      }

      // Create request object
      const req = {
        url,
        method,
        headers: init?.headers || {},
        body,
        params: this.extractParams(interceptor.url, url),
        query: this.extractQuery(url),
      };

      // Handle request with interceptor
      const result = await interceptor.handler(req);

      // Return mock response
      return new Response(JSON.stringify(result), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Return error response
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const status = this.getErrorStatus(errorMessage);
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status,
        statusText: this.getStatusText(status),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  /**
   * Find matching interceptor
   */
  private findInterceptor(method: string, url: string): RequestInterceptor | null {
    for (const [key, interceptors] of this.interceptors) {
      const [interceptorMethod, interceptorPath] = key.split(' ');
      
      if (interceptorMethod === method && this.matchPath(interceptorPath, url)) {
        return interceptors[0]; // Return first matching interceptor
      }
    }
    return null;
  }

  /**
   * Check if URL matches interceptor path pattern
   */
  private matchPath(pattern: string, url: string): boolean {
    // Extract pathname from URL
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;
    
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/:[^/]+/g, '[^/]+') // Replace :param with [^/]+
      .replace(/\//g, '\\/'); // Escape forward slashes
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  }

  /**
   * Extract path parameters
   */
  private extractParams(pattern: string, url: string): Record<string, string> {
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;
    
    const patternParts = pattern.split('/');
    const urlParts = pathname.split('/');
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      if (patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1);
        params[paramName] = urlParts[i] || '';
      }
    }
    
    return params;
  }

  /**
   * Extract query parameters
   */
  private extractQuery(url: string): Record<string, string> {
    const urlObj = new URL(url, 'http://localhost');
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  /**
   * Get HTTP status code for error
   */
  private getErrorStatus(error: string): number {
    if (error.includes('Unauthorized') || error.includes('Invalid credentials')) {
      return 401;
    }
    if (error.includes('Forbidden')) {
      return 403;
    }
    if (error.includes('Not found') || error.includes('not found')) {
      return 404;
    }
    if (error.includes('timeout') || error.includes('Timeout')) {
      return 408;
    }
    if (error.includes('Rate limit')) {
      return 429;
    }
    return 500;
  }

  /**
   * Get status text for HTTP status code
   */
  private getStatusText(status: number): string {
    const statusTexts: { [key: number]: string } = {
      200: 'OK',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }

  // Authentication handlers
  private async handleLogin(req: any) {
    return this.authService.login(req.body);
  }

  private async handleLogout(_req: any) {
    return this.authService.logout();
  }

  private async handleRefresh(req: any) {
    return this.authService.refresh(req.body.refreshToken);
  }

  private async handleValidateToken(req: any) {
    const isValid = await this.authService.validateToken(req.body.token);
    return { valid: isValid };
  }

  private async handleGetCurrentUser(_req: any) {
    return this.authService.getCurrentUser();
  }

  // Customer handlers
  private async handleGetCustomers(_req: any) {
    return this.customerService.getCustomers();
  }

  private async handleGetCustomerById(req: any) {
    return this.customerService.getCustomerById(req.params.id);
  }

  private async handleGetCurrentCustomer(_req: any) {
    return this.customerService.getCurrentCustomer();
  }

  private async handleSwitchCustomer(req: any) {
    await this.customerService.switchCustomer(req.params.id);
    return { success: true };
  }

  // Analytics handlers
  private async handleGetDashboardMetrics(req: any) {
    const { customerId, startDate, endDate } = req.query;
    return this.analyticsService.getDashboardMetrics(customerId, { startDate, endDate });
  }

  private async handleGetChartData(req: any) {
    const { customerId, chartType, ...filters } = req.query;
    return this.analyticsService.getChartData(customerId, chartType, filters);
  }

  private async handleGetReportData(req: any) {
    const { customerId, reportType, ...parameters } = req.query;
    return this.analyticsService.getReportData(customerId, reportType, parameters);
  }

  private async handleGetAnalyticsSummary(req: any) {
    const { customerId } = req.query;
    return this.analyticsService.getAnalyticsSummary(customerId);
  }
}

// Export singleton instance
export const MockAPIInterceptor = new MockAPIInterceptorClass();

// Auto-install in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  MockAPIInterceptor.install();
}

// Export for both ES modules and CommonJS
export default MockAPIInterceptor;