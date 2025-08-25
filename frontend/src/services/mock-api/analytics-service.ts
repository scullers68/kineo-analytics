/**
 * Mock Analytics Service
 * 
 * Simulates analytics data operations including dashboard metrics,
 * chart data generation, and report generation with customer context.
 */

import { MockDataGenerator, DashboardMetrics, TrendData } from './data-generator';
import { config } from './config';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ChartFilters {
  dateRange: DateRange;
  departments?: string[];
  courseTypes?: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}

export interface ReportParameters {
  dateRange: DateRange;
  filters: Record<string, any>;
  format: 'json' | 'csv' | 'excel';
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  generatedAt: string;
  rowCount: number;
  customerId: string;
}

export class MockAnalyticsService {
  private dataGenerator: MockDataGenerator;
  private customerData: Map<string, any> = new Map();

  constructor() {
    this.dataGenerator = new MockDataGenerator();
  }

  /**
   * Simulate network delay based on configuration
   */
  private async simulateDelay(): Promise<void> {
    const loadingSimulator = (global as any).MockLoadingSimulator;
    let delay = config.delay + Math.random() * 100;
    
    // Check for custom delay from loading simulator
    if (loadingSimulator?.getDelay?.('dashboard')) {
      delay = Math.max(delay, loadingSimulator.getDelay('dashboard'));
    }

    // Simulate loading progress
    if (loadingSimulator?.onProgressCallback) {
      loadingSimulator.onProgressCallback({ loaded: 0, total: 100 });
      await new Promise(resolve => setTimeout(resolve, delay / 2));
      loadingSimulator.onProgressCallback({ loaded: 50, total: 100 });
      await new Promise(resolve => setTimeout(resolve, delay / 2));
      loadingSimulator.onProgressCallback({ loaded: 100, total: 100 });
    } else {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Check if error should be simulated
   */
  private shouldSimulateError(): boolean {
    return Math.random() < config.errorRate;
  }

  /**
   * Get or generate customer analytics data
   */
  private getCustomerData(customerId: string) {
    if (!this.customerData.has(customerId)) {
      this.customerData.set(customerId, this.dataGenerator.generateAnalyticsData(customerId));
    }
    return this.customerData.get(customerId);
  }

  /**
   * Filter trend data by date range
   */
  private filterTrendDataByDateRange(trendsData: TrendData[], dateRange: DateRange): TrendData[] {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    return trendsData.filter(trend => {
      const trendDate = new Date(trend.date);
      return trendDate >= startDate && trendDate <= endDate;
    });
  }

  /**
   * Generate trend data for date range
   */
  private generateTrendData(dateRange: DateRange): TrendData[] {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const trends: TrendData[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      trends.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50) + 10,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trends;
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(customerId: string, dateRange: DateRange): Promise<DashboardMetrics> {
    await this.simulateDelay();

    // Check for timeout simulation
    const errorSimulator = (global as any).MockErrorSimulator;
    if (errorSimulator?.shouldSimulateTimeout) {
      throw new Error('Request timeout');
    }

    // Check for missing data simulation
    if (errorSimulator?.isMissingData?.('analytics')) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        completionRate: 0,
        averageProgress: 0,
        trendsData: [],
      };
    }

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch dashboard metrics');
    }

    const customerData = this.getCustomerData(customerId);
    const filteredTrends = this.filterTrendDataByDateRange(customerData.metrics.trendsData, dateRange);

    return {
      ...customerData.metrics,
      trendsData: filteredTrends.length > 0 ? filteredTrends : this.generateTrendData(dateRange),
    };
  }

  /**
   * Get chart data for different visualization types
   */
  async getChartData(customerId: string, chartType: string, filters: ChartFilters): Promise<ChartData> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch chart data');
    }

    const customerData = this.getCustomerData(customerId);
    
    // Generate chart data based on type
    switch (chartType) {
      case 'completion-by-department':
        return this.generateDepartmentCompletionChart(customerData, filters);
      case 'completion-rates':
        return this.generateCompletionRatesChart(customerData, filters);
      case 'progress-over-time':
        return this.generateProgressOverTimeChart(customerData, filters);
      default:
        return this.generateDefaultChart(customerData, filters);
    }
  }

  /**
   * Generate department completion chart data
   */
  private generateDepartmentCompletionChart(_customerData: any, filters: ChartFilters): ChartData {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
    const filteredDepartments = filters.departments || departments;
    
    return {
      labels: filteredDepartments,
      datasets: [{
        label: 'Completion Rate',
        data: filteredDepartments.map(() => Math.floor(Math.random() * 40) + 60),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      }],
    };
  }

  /**
   * Generate completion rates chart data
   */
  private generateCompletionRatesChart(_customerData: any, _filters: ChartFilters): ChartData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      labels: months,
      datasets: [{
        label: 'Completion Rate',
        data: months.map(() => Math.floor(Math.random() * 30) + 70),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      }],
    };
  }

  /**
   * Generate progress over time chart data
   */
  private generateProgressOverTimeChart(_customerData: any, filters: ChartFilters): ChartData {
    const startDate = new Date(filters.dateRange.startDate);
    const endDate = new Date(filters.dateRange.endDate);
    const labels: string[] = [];
    const data: number[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate && labels.length < 10) {
      labels.push(currentDate.toLocaleDateString());
      data.push(Math.floor(Math.random() * 30) + 50);
      currentDate.setDate(currentDate.getDate() + Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 10)));
    }

    return {
      labels,
      datasets: [{
        label: 'Average Progress',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      }],
    };
  }

  /**
   * Generate default chart data
   */
  private generateDefaultChart(_customerData: any, _filters: ChartFilters): ChartData {
    return {
      labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
      datasets: [{
        label: 'Data',
        data: [65, 59, 80, 81],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
      }],
    };
  }

  /**
   * Generate report data
   */
  async getReportData(customerId: string, reportType: string, parameters: ReportParameters): Promise<ReportData> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to generate report');
    }

    const customerData = this.getCustomerData(customerId);
    
    let headers: string[];
    let rows: any[][];

    switch (reportType) {
      case 'user-progress':
        headers = ['User ID', 'Name', 'Email', 'Department', 'Progress %', 'Courses Completed'];
        rows = customerData.users.slice(0, 10).map((user: any) => [
          user.id,
          user.username.replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          user.email,
          parameters.filters.department || 'Engineering',
          Math.floor(Math.random() * 40) + 60,
          Math.floor(Math.random() * 10) + 1,
        ]);
        break;
        
      case 'completion-summary':
        headers = ['Course', 'Total Enrolled', 'Completed', 'In Progress', 'Completion Rate %'];
        rows = customerData.courses.slice(0, 15).map((course: any) => {
          const enrolled = Math.floor(Math.random() * 100) + 20;
          const completed = Math.floor(enrolled * (Math.random() * 0.4 + 0.4));
          const inProgress = Math.floor((enrolled - completed) * Math.random());
          return [
            course.title,
            enrolled,
            completed,
            inProgress,
            Math.round((completed / enrolled) * 100),
          ];
        });
        break;
        
      default:
        headers = ['ID', 'Name', 'Value'];
        rows = Array.from({ length: 5 }, (_, i) => [
          `item-${i + 1}`,
          `Item ${i + 1}`,
          Math.floor(Math.random() * 100),
        ]);
    }

    return {
      headers,
      rows,
      metadata: {
        generatedAt: new Date().toISOString(),
        rowCount: rows.length,
        customerId,
      },
    };
  }

  /**
   * Export report data in specified format
   */
  async exportReport(customerId: string, reportType: string, parameters: ReportParameters): Promise<Blob> {
    const reportData = await this.getReportData(customerId, reportType, parameters);
    
    if (parameters.format === 'csv') {
      const csvContent = [
        reportData.headers.join(','),
        ...reportData.rows.map(row => row.join(','))
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }

    // Default to JSON
    return new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  }

  /**
   * Get analytics summary for customer
   */
  async getAnalyticsSummary(customerId: string): Promise<any> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw new Error('Failed to fetch analytics summary');
    }

    const customerData = this.getCustomerData(customerId);
    
    return {
      overview: {
        totalUsers: customerData.users.length,
        totalCourses: customerData.courses.length,
        totalCompletions: customerData.completions.length,
        averageCompletionRate: customerData.metrics.completionRate,
      },
      trends: {
        userGrowth: Math.floor(Math.random() * 20) + 5, // % growth
        engagementRate: Math.floor(Math.random() * 30) + 60, // %
        completionTrend: Math.random() > 0.5 ? 'up' : 'down',
      },
      topPerformers: {
        users: customerData.users.slice(0, 5),
        courses: customerData.courses.slice(0, 5),
        departments: ['Engineering', 'Sales', 'Marketing'].slice(0, 3),
      },
    };
  }
}

// Export for both ES modules and CommonJS
export default MockAnalyticsService;