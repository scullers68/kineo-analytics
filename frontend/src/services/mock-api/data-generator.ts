/**
 * Mock Data Generator
 * 
 * Generates realistic mock data for the Kineo Analytics platform including
 * users, courses, completions, and analytics metrics.
 */

// Configuration is accessed via global error simulator when needed

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  customerId: string;
  permissions: string[];
}

export interface Customer {
  id: string;
  name: string;
  subdomain: string;
  active: boolean;
  settings: CustomerSettings;
}

export interface CustomerSettings {
  theme: string;
  timezone: string;
  locale: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: number;
  active: boolean;
}

export interface Completion {
  id: string;
  userId: string;
  courseId: string;
  completedAt: string;
  score: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageProgress: number;
  trendsData: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface AnalyticsData {
  users: User[];
  courses: Course[];
  completions: Completion[];
  metrics: DashboardMetrics;
}

export class MockDataGenerator {
  private corruptedDataMode = false;

  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate random name
   */
  private generateName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Cameron', 'Devon', 'Sage'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  /**
   * Generate random email from name
   */
  private generateEmail(name: string, customerId?: string): string {
    if (this.corruptedDataMode && Math.random() < 0.2) {
      return ''; // Return empty email for corrupted data simulation
    }
    const username = name.toLowerCase().replace(/\s+/g, '.');
    const domain = customerId ? `${customerId}.com` : 'example.com';
    return `${username}@${domain}`;
  }

  /**
   * Generate random company name
   */
  private generateCompanyName(): string {
    const adjectives = ['Global', 'Innovative', 'Advanced', 'Premier', 'Strategic', 'Dynamic', 'Progressive', 'Elite'];
    const nouns = ['Solutions', 'Technologies', 'Systems', 'Enterprises', 'Industries', 'Corporation', 'Group', 'Partners'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  }

  /**
   * Generate specified number of users
   */
  generateUsers(count: number): User[] {
    const roles = ['admin', 'manager', 'user', 'analyst'];
    const permissions = ['read', 'write', 'admin', 'analytics', 'reports'];
    const customerIds = ['customer001', 'customer002', 'customer003'];

    return Array.from({ length: count }, (_, index) => {
      const name = this.generateName();
      const customerId = customerIds[index % customerIds.length];
      const role = roles[Math.floor(Math.random() * roles.length)];
      
      // Role-based permissions
      let userPermissions: string[] = ['read'];
      if (role === 'admin') {
        userPermissions = [...permissions];
      } else if (role === 'manager') {
        userPermissions = ['read', 'write', 'analytics'];
      } else if (role === 'analyst') {
        userPermissions = ['read', 'analytics', 'reports'];
      }

      return {
        id: this.corruptedDataMode && Math.random() < 0.3 ? '' : this.generateUUID(),
        username: name.toLowerCase().replace(/\s+/g, '.'),
        email: this.corruptedDataMode && Math.random() < 0.3 ? '' : this.generateEmail(name, customerId.replace('customer', '')),
        role,
        customerId,
        permissions: userPermissions,
      };
    });
  }

  /**
   * Generate specified number of courses
   */
  generateCourses(count: number): Course[] {
    const categories = ['Compliance', 'Safety', 'Leadership', 'Technical', 'Soft Skills', 'Professional Development'];
    const courseTypes = [
      'Introduction to', 'Advanced', 'Essential', 'Comprehensive', 'Practical', 'Strategic',
      'Fundamentals of', 'Mastering', 'Understanding', 'Effective'
    ];
    const topics = [
      'Workplace Safety', 'Data Protection', 'Team Management', 'Communication Skills',
      'Project Management', 'Quality Assurance', 'Customer Service', 'Financial Management',
      'Risk Assessment', 'Regulatory Compliance', 'Emergency Procedures', 'Conflict Resolution'
    ];

    return Array.from({ length: count }, () => {
      const courseType = courseTypes[Math.floor(Math.random() * courseTypes.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];

      return {
        id: this.generateUUID(),
        title: `${courseType} ${topic}`,
        category,
        duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        active: Math.random() > 0.1, // 90% active
      };
    });
  }

  /**
   * Generate completion records for users and courses
   */
  generateCompletions(userCount: number, courseCount: number): Completion[] {
    const users = this.generateUsers(userCount);
    const courses = this.generateCourses(courseCount);
    const statuses: Completion['status'][] = ['completed', 'in_progress', 'not_started'];
    
    const completions: Completion[] = [];
    const completionRate = 0.3; // 30% completion rate

    users.forEach(user => {
      courses.forEach(course => {
        if (Math.random() < completionRate) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const daysAgo = Math.floor(Math.random() * 365);
          const completedAt = new Date();
          completedAt.setDate(completedAt.getDate() - daysAgo);

          completions.push({
            id: this.generateUUID(),
            userId: user.id,
            courseId: course.id,
            completedAt: completedAt.toISOString(),
            score: status === 'completed' ? Math.floor(Math.random() * 40) + 60 : 0, // 60-100 for completed
            status,
          });
        }
      });
    });

    return completions;
  }

  /**
   * Generate comprehensive analytics data for a customer
   */
  generateAnalyticsData(customerId: string): AnalyticsData {
    const userCount = Math.floor(Math.random() * 200) + 50; // 50-250 users
    const courseCount = Math.floor(Math.random() * 50) + 20; // 20-70 courses
    
    const users = this.generateUsers(userCount).map(user => ({
      ...user,
      customerId,
    }));
    
    const courses = this.generateCourses(courseCount);
    const completions = this.generateCompletions(userCount, courseCount);

    // Calculate metrics
    const completedCount = completions.filter(c => c.status === 'completed').length;
    const inProgressCount = completions.filter(c => c.status === 'in_progress').length;
    const activeUsers = users.filter(u => 
      completions.some(c => c.userId === u.id && (c.status === 'completed' || c.status === 'in_progress'))
    ).length;

    // Generate trend data for last 30 days
    const trendsData: TrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trendsData.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50) + 10,
      });
    }

    const metrics: DashboardMetrics = {
      totalUsers: users.length,
      activeUsers,
      completionRate: completions.length > 0 ? (completedCount / completions.length) * 100 : 0,
      averageProgress: completions.length > 0 ? 
        (completedCount * 100 + inProgressCount * 50) / completions.length : 0,
      trendsData,
    };

    return {
      users,
      courses,
      completions,
      metrics,
    };
  }

  /**
   * Generate customer data
   */
  generateCustomers(): Customer[] {
    const themes = ['light', 'dark', 'auto'];
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
    const locales = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP'];

    return [
      {
        id: 'customer001',
        name: 'Acme Corporation',
        subdomain: 'acme',
        active: true,
        settings: {
          theme: 'light',
          timezone: 'America/New_York',
          locale: 'en-US',
        },
      },
      {
        id: 'customer002',
        name: 'Global Tech Solutions',
        subdomain: 'globaltech',
        active: true,
        settings: {
          theme: 'dark',
          timezone: 'Europe/London',
          locale: 'en-GB',
        },
      },
      {
        id: 'customer003',
        name: 'Innovation Industries',
        subdomain: 'innovation',
        active: true,
        settings: {
          theme: 'auto',
          timezone: 'Asia/Tokyo',
          locale: 'ja-JP',
        },
      },
    ].concat(
      Array.from({ length: 7 }, (_, index) => ({
        id: `customer${String(index + 4).padStart(3, '0')}`,
        name: this.generateCompanyName(),
        subdomain: `company${index + 4}`,
        active: Math.random() > 0.2, // 80% active
        settings: {
          theme: themes[Math.floor(Math.random() * themes.length)],
          timezone: timezones[Math.floor(Math.random() * timezones.length)],
          locale: locales[Math.floor(Math.random() * locales.length)],
        },
      }))
    );
  }

  /**
   * Enable corrupted data mode for testing error handling
   */
  simulateCorruptedData(enabled: boolean): void {
    this.corruptedDataMode = enabled;
  }
}

// Export for both ES modules and CommonJS
export default MockDataGenerator;