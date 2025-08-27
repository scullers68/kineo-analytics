/**
 * Mock Data Generators for Testing
 * 
 * Provides comprehensive mock data generators for all chart types,
 * performance testing, and multi-tenant scenarios.
 */

export interface MockDataConfig {
  count?: number;
  seed?: number;
  includeNulls?: boolean;
  includeZeros?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  valueRange?: {
    min: number;
    max: number;
  };
}

export interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
  category?: string;
  color?: string;
  date?: string;
  timestamp?: number;
}

export interface TimeSeriesDataPoint {
  id: string;
  date: string;
  value: number;
  timestamp: number;
  category?: string;
}

export interface MultiLineData {
  id: string;
  label: string;
  data: TimeSeriesDataPoint[];
  color?: string;
}

export class MockDataGenerators {
  private static seedRandom(seed: number): () => number {
    let x = Math.sin(seed) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  }

  static generateBarChartData(config: MockDataConfig = {}): ChartDataPoint[] {
    const {
      count = 5,
      seed = 12345,
      includeZeros = false,
      includeNulls = false,
      categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
      valueRange = { min: 10, max: 100 }
    } = config;

    const random = this.seedRandom(seed);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return Array.from({ length: count }, (_, i) => {
      let value = Math.floor(random() * (valueRange.max - valueRange.min)) + valueRange.min;
      
      if (includeZeros && random() < 0.1) value = 0;
      if (includeNulls && random() < 0.05) value = null as any;

      return {
        id: `item-${i + 1}`,
        label: categories[i % categories.length] || `Item ${i + 1}`,
        value,
        category: categories[Math.floor(i / categories.length)] || 'default',
        color: colors[i % colors.length]
      };
    });
  }

  static generateTimeSeriesData(config: MockDataConfig = {}): TimeSeriesDataPoint[] {
    const {
      count = 30,
      seed = 12345,
      dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      valueRange = { min: 20, max: 80 },
      includeNulls = false
    } = config;

    const random = this.seedRandom(seed);
    const startTime = dateRange.start.getTime();
    const endTime = dateRange.end.getTime();
    const timeStep = (endTime - startTime) / (count - 1);

    return Array.from({ length: count }, (_, i) => {
      const timestamp = startTime + (i * timeStep);
      const date = new Date(timestamp);
      
      let value = Math.floor(random() * (valueRange.max - valueRange.min)) + valueRange.min;
      if (includeNulls && random() < 0.05) value = null as any;

      return {
        id: `point-${i + 1}`,
        date: date.toISOString().split('T')[0],
        value,
        timestamp
      };
    });
  }

  static generateMultiLineData(config: MockDataConfig & { lines?: number } = {}): MultiLineData[] {
    const {
      lines = 3,
      count = 30,
      seed = 12345,
      dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    } = config;

    const lineLabels = [
      'Course Completions',
      'Active Users',
      'Learning Hours',
      'Engagement Score',
      'Assessment Results'
    ];

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return Array.from({ length: lines }, (_, lineIndex) => {
      const lineSeed = seed + lineIndex * 1000;
      const timeSeriesData = this.generateTimeSeriesData({
        ...config,
        seed: lineSeed,
        count,
        dateRange,
        valueRange: {
          min: 10 + lineIndex * 10,
          max: 50 + lineIndex * 20
        }
      });

      return {
        id: `line-${lineIndex + 1}`,
        label: lineLabels[lineIndex] || `Line ${lineIndex + 1}`,
        data: timeSeriesData,
        color: colors[lineIndex % colors.length]
      };
    });
  }

  static generatePieChartData(config: MockDataConfig = {}): ChartDataPoint[] {
    const {
      count = 5,
      seed = 12345,
      categories = ['Completed', 'In Progress', 'Not Started', 'Overdue', 'Cancelled'],
      valueRange = { min: 5, max: 50 }
    } = config;

    const random = this.seedRandom(seed);
    const colors = ['#10b981', '#f59e0b', '#6b7280', '#ef4444', '#8b5cf6'];

    return Array.from({ length: count }, (_, i) => {
      const value = Math.floor(random() * (valueRange.max - valueRange.min)) + valueRange.min;

      return {
        id: `slice-${i + 1}`,
        label: categories[i % categories.length] || `Slice ${i + 1}`,
        value,
        category: 'status',
        color: colors[i % colors.length]
      };
    });
  }

  static generateLargeDataset(config: MockDataConfig & { type: 'bar' | 'line' | 'pie' }): any {
    const { type, count = 1000, ...restConfig } = config;

    switch (type) {
      case 'bar':
        return this.generateBarChartData({ 
          ...restConfig, 
          count,
          categories: Array.from({ length: Math.min(count, 50) }, (_, i) => `Category ${i + 1}`)
        });
      case 'line':
        return this.generateTimeSeriesData({
          ...restConfig,
          count,
          dateRange: {
            start: new Date(Date.now() - count * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        });
      case 'pie':
        return this.generatePieChartData({
          ...restConfig,
          count: Math.min(count, 20), // Pie charts shouldn't have too many slices
          categories: Array.from({ length: Math.min(count, 20) }, (_, i) => `Category ${i + 1}`)
        });
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  static generateCustomerSpecificData(customerId: string, config: MockDataConfig = {}) {
    // Generate customer-specific seed based on customer ID
    const customerSeed = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return {
      customerId,
      courses: this.generateBarChartData({
        ...config,
        seed: customerSeed,
        categories: [
          'Security Training',
          'Leadership Development',
          'Technical Skills',
          'Communication',
          'Compliance'
        ]
      }),
      trends: this.generateTimeSeriesData({
        ...config,
        seed: customerSeed + 1000,
        count: 90, // 3 months
        dateRange: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }),
      departments: this.generatePieChartData({
        ...config,
        seed: customerSeed + 2000,
        categories: [
          'Engineering',
          'Sales',
          'Marketing',
          'HR',
          'Operations',
          'Finance'
        ],
        count: 6
      }),
      certifications: this.generatePieChartData({
        ...config,
        seed: customerSeed + 3000,
        categories: [
          'Completed',
          'In Progress',
          'Not Started',
          'Expired'
        ],
        count: 4
      })
    };
  }

  static generateRealTimeDataStream(
    baseData: TimeSeriesDataPoint[],
    updateInterval: number = 1000
  ): {
    subscribe: (callback: (data: TimeSeriesDataPoint[]) => void) => () => void;
    stop: () => void;
  } {
    let isRunning = true;
    let currentData = [...baseData];
    const subscribers: Array<(data: TimeSeriesDataPoint[]) => void> = [];

    const updateData = () => {
      if (!isRunning) return;

      // Add new point
      const lastPoint = currentData[currentData.length - 1];
      const newTimestamp = lastPoint.timestamp + 24 * 60 * 60 * 1000; // Next day
      const newValue = Math.max(10, Math.min(90, 
        lastPoint.value + (Math.random() - 0.5) * 20
      ));

      const newPoint: TimeSeriesDataPoint = {
        id: `point-${Date.now()}`,
        date: new Date(newTimestamp).toISOString().split('T')[0],
        value: Math.round(newValue),
        timestamp: newTimestamp
      };

      // Keep only last 30 days
      currentData = [...currentData.slice(1), newPoint];

      // Notify subscribers
      subscribers.forEach(callback => callback([...currentData]));

      if (isRunning) {
        setTimeout(updateData, updateInterval);
      }
    };

    // Start the update loop
    setTimeout(updateData, updateInterval);

    return {
      subscribe: (callback) => {
        subscribers.push(callback);
        // Return unsubscribe function
        return () => {
          const index = subscribers.indexOf(callback);
          if (index > -1) {
            subscribers.splice(index, 1);
          }
        };
      },
      stop: () => {
        isRunning = false;
        subscribers.length = 0;
      }
    };
  }

  static generateEdgeCaseData(scenario: string): any {
    switch (scenario) {
      case 'empty':
        return [];

      case 'single-point':
        return [{
          id: 'single',
          label: 'Single Point',
          value: 50,
          category: 'test'
        }];

      case 'all-zeros':
        return Array.from({ length: 5 }, (_, i) => ({
          id: `zero-${i}`,
          label: `Zero ${i + 1}`,
          value: 0,
          category: 'test'
        }));

      case 'mixed-nulls':
        return [
          { id: '1', label: 'Valid', value: 50, category: 'test' },
          { id: '2', label: 'Null', value: null, category: 'test' },
          { id: '3', label: 'Valid', value: 75, category: 'test' },
          { id: '4', label: 'Null', value: null, category: 'test' },
          { id: '5', label: 'Valid', value: 25, category: 'test' }
        ];

      case 'extreme-values':
        return [
          { id: '1', label: 'Tiny', value: 0.001, category: 'test' },
          { id: '2', label: 'Small', value: 1, category: 'test' },
          { id: '3', label: 'Large', value: 999999, category: 'test' },
          { id: '4', label: 'Huge', value: 1000000000, category: 'test' }
        ];

      case 'special-characters':
        return [
          { id: '1', label: 'Normal', value: 50, category: 'test' },
          { id: '2', label: 'Spëciál Çhars', value: 60, category: 'test' },
          { id: '3', label: '中文字符', value: 70, category: 'test' },
          { id: '4', label: '🚀 Emoji', value: 80, category: 'test' },
          { id: '5', label: 'Very Long Label That Should Be Truncated Or Wrapped', value: 90, category: 'test' }
        ];

      case 'sparse-time-series':
        const today = new Date();
        return [
          {
            id: '1',
            date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 30,
            timestamp: today.getTime() - 30 * 24 * 60 * 60 * 1000
          },
          {
            id: '2',
            date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 45,
            timestamp: today.getTime() - 15 * 24 * 60 * 60 * 1000
          },
          {
            id: '3',
            date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 60,
            timestamp: today.getTime() - 1 * 24 * 60 * 60 * 1000
          }
        ];

      default:
        throw new Error(`Unknown edge case scenario: ${scenario}`);
    }
  }

  static generatePerformanceTestData() {
    return {
      small: this.generateLargeDataset({ type: 'line', count: 100 }),
      medium: this.generateLargeDataset({ type: 'line', count: 500 }),
      large: this.generateLargeDataset({ type: 'line', count: 1000 }),
      xlarge: this.generateLargeDataset({ type: 'line', count: 5000 }),
      xxlarge: this.generateLargeDataset({ type: 'line', count: 10000 })
    };
  }
}

// Convenience exports for common use cases
export const generateMockBarData = (count?: number) => 
  MockDataGenerators.generateBarChartData({ count });

export const generateMockLineData = (count?: number) => 
  MockDataGenerators.generateTimeSeriesData({ count });

export const generateMockPieData = (count?: number) => 
  MockDataGenerators.generatePieChartData({ count });

export const generateMockMultiLineData = (lines?: number, count?: number) => 
  MockDataGenerators.generateMultiLineData({ lines, count });

export const generateEdgeCaseData = (scenario: string) => 
  MockDataGenerators.generateEdgeCaseData(scenario);

export default MockDataGenerators;