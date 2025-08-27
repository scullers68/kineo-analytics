import type { Meta, StoryObj } from '@storybook/react';
import { DashboardGrid } from '../../components/dashboard/DashboardGrid';
import { WidgetContainer } from '../../components/dashboard/WidgetContainer';
import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart } from '../../components/charts/PieChart';
import { CustomerProvider } from '../../contexts/CustomerContext';
import { ThemeProvider } from '../../components/theme/ThemeProvider';
import React from 'react';

const meta: Meta = {
  title: 'Dashboard/Chart Integration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Dashboard Chart Integration

Demonstrates how D3.js chart components integrate seamlessly with the Kineo Analytics dashboard framework, providing responsive layouts, customer isolation, and interactive features.

## Features
- ✅ Responsive grid layout with breakpoint adaptations
- ✅ Chart resizing and reflow in containers
- ✅ Multi-tenant customer context isolation  
- ✅ Theme consistency across dashboard and charts
- ✅ Interactive widget controls (maximize, minimize, settings)
- ✅ Cross-chart communication and filtering
- ✅ Performance optimized rendering in grids
- ✅ Accessibility navigation between widgets

## Dashboard Framework Benefits
- Consistent spacing and typography across widgets
- Automatic responsive behavior for mobile/tablet/desktop
- Customer-specific styling and data isolation
- Theme switching with chart color coordination
- Widget state management and persistence
- Cross-widget communication for data filtering
        `
      }
    }
  },
  decorators: [
    (Story, context) => {
      const { theme = 'light', customer = 'customer_001' } = context.globals;
      
      return (
        <CustomerProvider 
          customerId={customer}
          customerName={`Customer ${customer.split('_')[1]}`}
          customerSettings={{
            branding: {
              primaryColor: customer === 'customer_001' ? '#3b82f6' : 
                           customer === 'customer_002' ? '#10b981' : '#8b5cf6',
              logo: `/logos/${customer}-logo.svg`
            }
          }}
        >
          <ThemeProvider theme={theme}>
            <div className="min-h-screen bg-background p-4">
              <Story />
            </div>
          </ThemeProvider>
        </CustomerProvider>
      );
    }
  ],
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof meta>;

// Sample data generators for consistent dashboard data
const generateDashboardData = () => ({
  courseCompletions: [
    { id: 'react', label: 'React Fundamentals', value: 89, category: 'technical' },
    { id: 'ts', label: 'TypeScript Advanced', value: 76, category: 'technical' },
    { id: 'leadership', label: 'Leadership Skills', value: 92, category: 'soft-skills' },
    { id: 'communication', label: 'Communication', value: 84, category: 'soft-skills' },
    { id: 'security', label: 'Security Training', value: 97, category: 'compliance' }
  ],
  learningTrends: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      id: `day-${i}`,
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 40) + 30,
      timestamp: date.getTime()
    };
  }),
  departmentDistribution: [
    { id: 'engineering', label: 'Engineering', value: 145, color: '#3b82f6' },
    { id: 'sales', label: 'Sales', value: 98, color: '#10b981' },
    { id: 'marketing', label: 'Marketing', value: 67, color: '#f59e0b' },
    { id: 'hr', label: 'HR', value: 54, color: '#8b5cf6' },
    { id: 'operations', label: 'Operations', value: 43, color: '#ef4444' }
  ],
  certificationStatus: [
    { id: 'completed', label: 'Completed', value: 234, color: '#10b981' },
    { id: 'in-progress', label: 'In Progress', value: 156, color: '#f59e0b' },
    { id: 'not-started', label: 'Not Started', value: 89, color: '#6b7280' },
    { id: 'expired', label: 'Expired', value: 23, color: '#ef4444' }
  ]
});

// Basic dashboard layout
export const BasicDashboard: Story = {
  render: () => {
    const data = generateDashboardData();
    
    return (
      <DashboardGrid>
        <WidgetContainer 
          title="Course Completion Rates"
          subtitle="Current quarter performance"
        >
          <BarChart
            data={data.courseCompletions}
            config={{
              responsive: true,
              animate: true,
              showLabels: true,
              showTooltips: true,
              height: 300
            }}
            variant="simple"
          />
        </WidgetContainer>

        <WidgetContainer 
          title="Learning Activity Trend"
          subtitle="Past 30 days"
        >
          <LineChart
            data={data.learningTrends}
            config={{
              responsive: true,
              animate: true,
              showPoints: true,
              showTooltips: true,
              height: 300,
              curveType: 'natural'
            }}
            variant="simple"
          />
        </WidgetContainer>

        <WidgetContainer 
          title="Department Distribution"
          subtitle="Active learners by department"
        >
          <PieChart
            data={data.departmentDistribution}
            config={{
              responsive: true,
              animate: true,
              showLabels: true,
              showTooltips: true,
              showLegend: true,
              height: 300
            }}
            variant="donut"
          />
        </WidgetContainer>

        <WidgetContainer 
          title="Certification Status"
          subtitle="Overall certification progress"
        >
          <PieChart
            data={data.certificationStatus}
            config={{
              responsive: true,
              animate: true,
              showLabels: true,
              showTooltips: true,
              showPercentages: true,
              height: 300
            }}
            variant="pie"
          />
        </WidgetContainer>
      </DashboardGrid>
    );
  }
};

// Responsive dashboard behavior
export const ResponsiveDashboard: Story = {
  render: () => {
    const data = generateDashboardData();
    
    return (
      <DashboardGrid responsive={true} columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
        <WidgetContainer 
          title="Performance Overview"
          className="md:col-span-2"
        >
          <LineChart
            data={data.learningTrends}
            config={{
              responsive: true,
              animate: true,
              showPoints: false,
              showTooltips: true,
              height: 250,
              showGrid: true
            }}
            variant="area"
          />
        </WidgetContainer>

        <WidgetContainer 
          title="Top Courses"
          className="lg:col-span-1"
        >
          <BarChart
            data={data.courseCompletions.slice(0, 3)}
            config={{
              responsive: true,
              animate: true,
              showLabels: false,
              showTooltips: true,
              height: 250,
              orientation: 'horizontal'
            }}
            variant="simple"
          />
        </WidgetContainer>

        <WidgetContainer 
          title="Department Breakdown"
          className="lg:col-span-1"
        >
          <PieChart
            data={data.departmentDistribution}
            config={{
              responsive: true,
              animate: true,
              showLabels: false,
              showTooltips: true,
              showLegend: true,
              height: 250
            }}
            variant="donut"
          />
        </WidgetContainer>
      </DashboardGrid>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: `
**Responsive Features:**
- Grid automatically adapts to screen size
- Charts resize to fit widget containers  
- Labels and legends adjust for available space
- Touch-friendly interactions on mobile devices
        `
      }
    }
  }
};

// Interactive dashboard with cross-chart communication
export const InteractiveDashboard: Story = {
  render: () => {
    const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null);
    const [dateRange, setDateRange] = React.useState({ start: -30, end: 0 });
    
    const data = generateDashboardData();
    
    // Filter data based on selections
    const filteredCourseData = selectedDepartment 
      ? data.courseCompletions.filter(course => 
          selectedDepartment === 'engineering' ? course.category === 'technical' :
          selectedDepartment === 'hr' ? course.category === 'soft-skills' :
          course.category === 'compliance'
        )
      : data.courseCompletions;

    const handleDepartmentSelect = (slice: any) => {
      setSelectedDepartment(slice.id === selectedDepartment ? null : slice.id);
    };

    return (
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Learning Analytics Dashboard</h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Selected Department: {selectedDepartment || 'All'}</span>
            <button 
              onClick={() => setSelectedDepartment(null)}
              className="text-primary hover:underline"
              disabled={!selectedDepartment}
            >
              Clear Filter
            </button>
          </div>
        </div>

        <DashboardGrid>
          <WidgetContainer 
            title="Department Filter"
            subtitle="Click to filter other charts"
            className="md:col-span-1"
          >
            <PieChart
              data={data.departmentDistribution}
              config={{
                responsive: true,
                animate: true,
                showLabels: true,
                showTooltips: true,
                showLegend: false,
                height: 300,
                highlightSelected: true,
                selectedSlice: selectedDepartment
              }}
              variant="donut"
              onSliceClick={handleDepartmentSelect}
            />
          </WidgetContainer>

          <WidgetContainer 
            title={selectedDepartment ? `${selectedDepartment} Courses` : "All Course Completions"}
            subtitle="Filtered by department selection"
            className="md:col-span-2"
          >
            <BarChart
              data={filteredCourseData}
              config={{
                responsive: true,
                animate: true,
                showLabels: true,
                showTooltips: true,
                height: 300
              }}
              variant="simple"
            />
          </WidgetContainer>

          <WidgetContainer 
            title="Learning Trend"
            subtitle="Past 30 days activity"
          >
            <LineChart
              data={data.learningTrends}
              config={{
                responsive: true,
                animate: true,
                showPoints: true,
                showTooltips: true,
                height: 300,
                enableZoom: true
              }}
              variant="simple"
            />
          </WidgetContainer>
        </DashboardGrid>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Interactive Features:**
- Click on department slices to filter other charts
- Cross-chart communication updates related data
- Visual feedback shows active filters
- Clear filter functionality resets all charts
        `
      }
    }
  }
};

// Multi-tenant customer isolation
export const MultiTenantDashboard: Story = {
  render: () => {
    const data = generateDashboardData();
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CustomerProvider customerId="customer_001" customerName="Acme Corp">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Acme Corp Dashboard</h3>
              <DashboardGrid>
                <WidgetContainer title="Completion Rates">
                  <BarChart
                    data={data.courseCompletions}
                    config={{
                      responsive: true,
                      animate: true,
                      showLabels: false,
                      showTooltips: true,
                      height: 200
                    }}
                    variant="simple"
                  />
                </WidgetContainer>
                <WidgetContainer title="Department Split">
                  <PieChart
                    data={data.departmentDistribution}
                    config={{
                      responsive: true,
                      animate: true,
                      showLabels: false,
                      showTooltips: true,
                      height: 200
                    }}
                    variant="donut"
                  />
                </WidgetContainer>
              </DashboardGrid>
            </div>
          </CustomerProvider>

          <CustomerProvider customerId="customer_002" customerName="TechStart Inc">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">TechStart Inc Dashboard</h3>
              <DashboardGrid>
                <WidgetContainer title="Learning Trends">
                  <LineChart
                    data={data.learningTrends}
                    config={{
                      responsive: true,
                      animate: true,
                      showPoints: false,
                      showTooltips: true,
                      height: 200
                    }}
                    variant="simple"
                  />
                </WidgetContainer>
                <WidgetContainer title="Certifications">
                  <PieChart
                    data={data.certificationStatus}
                    config={{
                      responsive: true,
                      animate: true,
                      showLabels: false,
                      showTooltips: true,
                      height: 200
                    }}
                    variant="pie"
                  />
                </WidgetContainer>
              </DashboardGrid>
            </div>
          </CustomerProvider>

          <CustomerProvider customerId="customer_003" customerName="Enterprise Solutions">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Enterprise Solutions Dashboard</h3>
              <DashboardGrid>
                <WidgetContainer title="Top Performers">
                  <BarChart
                    data={data.courseCompletions.slice(0, 3)}
                    config={{
                      responsive: true,
                      animate: true,
                      showLabels: false,
                      showTooltips: true,
                      height: 200,
                      orientation: 'horizontal'
                    }}
                    variant="simple"
                  />
                </WidgetContainer>
                <WidgetContainer title="Activity Overview">
                  <LineChart
                    data={data.learningTrends.slice(-14)}
                    config={{
                      responsive: true,
                      animate: true,
                      showPoints: true,
                      showTooltips: true,
                      height: 200
                    }}
                    variant="area"
                  />
                </WidgetContainer>
              </DashboardGrid>
            </div>
          </CustomerProvider>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Multi-Tenant Features:**
- Complete data isolation between customers
- Customer-specific styling and branding
- Independent theme and configuration settings
- Secure context boundaries for data access
        `
      }
    }
  }
};

// Performance optimized dashboard
export const PerformanceDashboard: Story = {
  render: () => {
    // Generate larger datasets for performance testing
    const largeDataset = Array.from({ length: 500 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 10,
      category: ['technical', 'soft-skills', 'compliance'][i % 3]
    }));

    const timeSeriesData = Array.from({ length: 365 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (364 - i));
      return {
        id: `day-${i}`,
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 50) + 25,
        timestamp: date.getTime()
      };
    });

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800">Performance Test Dashboard</h3>
          <p className="text-sm text-yellow-700">
            Large datasets: 500 items in charts, 365 days of time series data.
            Optimized for rendering performance and memory efficiency.
          </p>
        </div>

        <DashboardGrid>
          <WidgetContainer 
            title="Large Dataset Chart"
            subtitle="500 data points with virtualization"
          >
            <LineChart
              data={timeSeriesData}
              config={{
                responsive: true,
                animate: false, // Disabled for performance
                showPoints: false,
                showTooltips: true,
                height: 300,
                performanceMode: true,
                virtualScrolling: true
              }}
              variant="simple"
            />
          </WidgetContainer>

          <WidgetContainer 
            title="Aggregated View"
            subtitle="Smart data aggregation"
          >
            <BarChart
              data={largeDataset.slice(0, 20)} // Show top 20 items
              config={{
                responsive: true,
                animate: true,
                showLabels: false,
                showTooltips: true,
                height: 300,
                performanceMode: true
              }}
              variant="simple"
            />
          </WidgetContainer>

          <WidgetContainer 
            title="Summary Metrics"
            subtitle="Real-time calculations"
          >
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {largeDataset.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(largeDataset.reduce((sum, item) => sum + item.value, 0) / largeDataset.length)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
              </div>
              <PieChart
                data={[
                  { id: 'technical', label: 'Technical', value: largeDataset.filter(i => i.category === 'technical').length, color: '#3b82f6' },
                  { id: 'soft-skills', label: 'Soft Skills', value: largeDataset.filter(i => i.category === 'soft-skills').length, color: '#10b981' },
                  { id: 'compliance', label: 'Compliance', value: largeDataset.filter(i => i.category === 'compliance').length, color: '#f59e0b' }
                ]}
                config={{
                  responsive: true,
                  animate: true,
                  showLabels: false,
                  showTooltips: true,
                  height: 200
                }}
                variant="donut"
              />
            </div>
          </WidgetContainer>
        </DashboardGrid>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Performance Features:**
- Virtualized rendering for large datasets
- Smart data aggregation and sampling
- Disabled animations for heavy charts
- Memory-efficient chart lifecycle management
        `
      }
    }
  }
};

// Accessibility-focused dashboard
export const AccessibilityDashboard: Story = {
  render: () => {
    const data = generateDashboardData();
    
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800">Accessibility-Focused Dashboard</h3>
          <p className="text-sm text-blue-700">
            Enhanced for screen readers, keyboard navigation, and high contrast. 
            Use Tab to navigate, Arrow keys within charts, Enter to interact.
          </p>
        </div>

        <DashboardGrid>
          <WidgetContainer 
            title="Course Performance"
            subtitle="Keyboard navigable bar chart"
            accessibilityLabel="Course completion rates chart"
          >
            <BarChart
              data={data.courseCompletions}
              config={{
                responsive: true,
                animate: true,
                showLabels: true,
                showTooltips: true,
                height: 300,
                accessibilityLabel: "Course completion rates by subject",
                accessibilityDescription: "Bar chart showing completion rates from 76% to 97%",
                enableKeyboardNavigation: true,
                highContrastMode: true
              }}
              variant="simple"
            />
          </WidgetContainer>

          <WidgetContainer 
            title="Learning Trends"
            subtitle="Time series with data table alternative"
          >
            <div className="space-y-4">
              <LineChart
                data={data.learningTrends.slice(-7)} // Last 7 days
                config={{
                  responsive: true,
                  animate: true,
                  showPoints: true,
                  showTooltips: true,
                  height: 250,
                  accessibilityLabel: "Weekly learning activity trend",
                  enableKeyboardNavigation: true
                }}
                variant="simple"
              />
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">View Data Table</summary>
                <table className="mt-2 w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Date</th>
                      <th className="border border-gray-300 p-2 text-left">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.learningTrends.slice(-7).map(item => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">{item.date}</td>
                        <td className="border border-gray-300 p-2">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          </WidgetContainer>

          <WidgetContainer 
            title="Department Distribution"
            subtitle="Pattern-enhanced pie chart"
          >
            <PieChart
              data={data.departmentDistribution}
              config={{
                responsive: true,
                animate: true,
                showLabels: true,
                showTooltips: true,
                showLegend: true,
                height: 300,
                usePatterns: true, // For color blind accessibility
                highContrastMode: true,
                enableKeyboardNavigation: true,
                accessibilityLabel: "Department learner distribution"
              }}
              variant="donut"
            />
          </WidgetContainer>
        </DashboardGrid>
      </div>
    );
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
          { id: 'keyboard', enabled: true },
          { id: 'landmark-unique', enabled: true }
        ]
      }
    },
    docs: {
      description: {
        story: `
**Accessibility Features:**
- Full keyboard navigation support
- Screen reader compatible with ARIA labels
- Alternative data table views
- High contrast mode with patterns
- Focus management and semantic structure
        `
      }
    }
  }
};