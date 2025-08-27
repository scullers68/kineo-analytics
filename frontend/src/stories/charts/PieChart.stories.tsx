import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from '../../components/charts/PieChart';
import { CustomerProvider } from '../../contexts/CustomerContext';
import { ThemeProvider } from '../../components/theme/ThemeProvider';
import React from 'react';

const meta: Meta<typeof PieChart> = {
  title: 'Charts/PieChart',
  component: PieChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# PieChart Component

Interactive pie chart component built with D3.js for displaying categorical data proportions in the Kineo Analytics platform.

## Features
- ✅ Interactive slice selection with explode effects
- ✅ Customizable donut hole for donut chart variant
- ✅ Smart label positioning to avoid overlaps
- ✅ Drill-down capabilities for hierarchical data
- ✅ Animated transitions and hover effects
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Responsive design with adaptive sizing
- ✅ Performance optimized arc calculations

## Accessibility Features
- Keyboard navigation between slices using arrow keys
- Screen reader announcements with percentages and values
- Pattern fills for color blind accessibility
- Focus indicators with clear visual feedback
- Alternative table view for screen readers
- Configurable color contrast ratios

## Performance Targets
- Initial render: <200ms for datasets up to 50 slices
- Interaction response: <50ms for hover and click effects
- Animation frame rate: 60fps during transitions
- Memory efficient path calculations and cleanup
        `
      }
    },
    a11y: {
      element: '[data-testid="pie-chart"]'
    }
  },
  argTypes: {
    data: {
      description: 'Array of categorical data points to visualize',
      control: { type: 'object' }
    },
    config: {
      description: 'Chart configuration options',
      control: { type: 'object' }
    },
    variant: {
      description: 'Chart style variant',
      control: { type: 'select' },
      options: ['pie', 'donut', 'semi-circle', 'nested']
    },
    onSliceClick: {
      description: 'Callback function when slice is clicked',
      action: 'slice clicked'
    },
    onSliceHover: {
      description: 'Callback function when slice is hovered',
      action: 'slice hovered'
    }
  },
  decorators: [
    (Story, context) => {
      const { theme = 'light', customer = 'customer_001' } = context.globals;
      
      return (
        <CustomerProvider 
          customerId={customer}
          customerName={`Test ${customer}`}
          customerSettings={{}}
        >
          <ThemeProvider theme={theme}>
            <div className="p-8 min-h-[600px] bg-background">
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

// Sample data generators
const generateCertificationData = () => [
  { id: 'completed', label: 'Completed', value: 342, color: '#10b981' },
  { id: 'in-progress', label: 'In Progress', value: 156, color: '#f59e0b' },
  { id: 'not-started', label: 'Not Started', value: 89, color: '#6b7280' },
  { id: 'expired', label: 'Expired', value: 23, color: '#ef4444' }
];

const generateDepartmentDistribution = () => [
  { id: 'engineering', label: 'Engineering', value: 125, color: '#3b82f6' },
  { id: 'sales', label: 'Sales', value: 87, color: '#10b981' },
  { id: 'marketing', label: 'Marketing', value: 64, color: '#f59e0b' },
  { id: 'hr', label: 'Human Resources', value: 45, color: '#8b5cf6' },
  { id: 'finance', label: 'Finance', value: 38, color: '#ef4444' },
  { id: 'operations', label: 'Operations', value: 52, color: '#06b6d4' }
];

const generateLearningMethods = () => [
  { id: 'online', label: 'Online Courses', value: 456, color: '#3b82f6' },
  { id: 'instructor-led', label: 'Instructor-Led Training', value: 234, color: '#10b981' },
  { id: 'workshops', label: 'Workshops', value: 189, color: '#f59e0b' },
  { id: 'webinars', label: 'Webinars', value: 145, color: '#8b5cf6' },
  { id: 'mentoring', label: 'Mentoring', value: 78, color: '#ef4444' }
];

const generateSkillLevels = () => [
  { id: 'expert', label: 'Expert', value: 45, color: '#10b981' },
  { id: 'advanced', label: 'Advanced', value: 123, color: '#3b82f6' },
  { id: 'intermediate', label: 'Intermediate', value: 234, color: '#f59e0b' },
  { id: 'beginner', label: 'Beginner', value: 187, color: '#6b7280' }
];

// Default story
export const Default: Story = {
  args: {
    data: generateCertificationData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      showPercentages: true
    },
    variant: 'pie'
  }
};

// Interactive controls story
export const Interactive: Story = {
  args: {
    data: generateDepartmentDistribution(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      showPercentages: true,
      enableExplode: true,
      explodeDistance: 10,
      height: 500,
      margin: { top: 20, right: 30, bottom: 40, left: 30 }
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive pie chart with all controls available for customization. Use the Controls panel to modify properties.'
      }
    }
  }
};

// Donut chart variant
export const DonutChart: Story = {
  args: {
    data: generateLearningMethods(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      showPercentages: true,
      innerRadius: 0.4,
      centerText: '1,102\nTotal Enrollments'
    },
    variant: 'donut'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Donut Chart Features:**
- Configurable inner radius for donut hole
- Center text display for totals or key metrics
- Enhanced readability with separated segments
- Optimal space utilization for legends
        `
      }
    }
  }
};

// Semi-circle chart variant
export const SemiCircleChart: Story = {
  args: {
    data: generateSkillLevels(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      showPercentages: true,
      startAngle: 0,
      endAngle: Math.PI
    },
    variant: 'semi-circle'
  },
  parameters: {
    docs: {
      description: {
        story: 'Semi-circle chart variant saves vertical space while maintaining data clarity, ideal for dashboard widgets.'
      }
    }
  }
};

// Accessibility demonstration
export const AccessibilityFeatures: Story = {
  args: {
    data: generateCertificationData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      enableKeyboardNavigation: true,
      accessibilityLabel: 'Certification status pie chart',
      accessibilityDescription: 'Shows distribution of certification statuses: 342 completed, 156 in progress, 89 not started, 23 expired',
      usePatterns: true,
      highContrastMode: true
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Accessibility Testing Instructions:**
1. Use Tab key to focus on the chart
2. Use Arrow keys to navigate between slices
3. Press Enter or Space to select/explode slices
4. Screen reader announces slice values and percentages
5. Pattern fills provide color-blind accessibility
        `
      }
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
          { id: 'keyboard', enabled: true }
        ]
      }
    }
  }
};

// Performance benchmark with many slices
export const ManySlices: Story = {
  args: {
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `slice-${i}`,
      label: `Category ${i + 1}`,
      value: Math.floor(Math.random() * 50) + 10,
      color: `hsl(${(i * 360) / 20}, 70%, 50%)`
    })),
    config: {
      responsive: true,
      animate: true,
      showLabels: false, // Disabled for performance
      showTooltips: true,
      showLegend: true,
      performanceMode: true,
      labelThreshold: 0.05 // Only show labels for slices > 5%
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Performance Demonstration:**
- Dataset: 20 slices with automatic colors
- Smart label positioning to avoid overlaps
- Performance mode for optimized rendering
- Label threshold filtering for clarity
        `
      }
    }
  }
};

// Drill-down functionality
export const DrillDownChart: Story = {
  render: (args) => {
    const [currentData, setCurrentData] = React.useState(generateDepartmentDistribution());
    const [breadcrumb, setBreadcrumb] = React.useState(['Departments']);

    const handleSliceClick = (slice: any) => {
      // Simulate drill-down data
      const drillDownData = Array.from({ length: 4 }, (_, i) => ({
        id: `${slice.id}-${i}`,
        label: `${slice.label} Team ${i + 1}`,
        value: Math.floor(slice.value / 4) + Math.floor(Math.random() * 10),
        color: `${slice.color}${80 + i * 5}`
      }));

      setCurrentData(drillDownData);
      setBreadcrumb([...breadcrumb, slice.label]);
    };

    const handleBreadcrumbClick = (index: number) => {
      if (index === 0) {
        setCurrentData(generateDepartmentDistribution());
        setBreadcrumb(['Departments']);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`${
                  index === breadcrumb.length - 1
                    ? 'text-gray-600 cursor-default'
                    : 'text-blue-600 hover:underline cursor-pointer'
                }`}
              >
                {item}
              </button>
              {index < breadcrumb.length - 1 && <span className="text-gray-400">›</span>}
            </React.Fragment>
          ))}
        </div>
        <PieChart
          {...args}
          data={currentData}
          onSliceClick={breadcrumb.length === 1 ? handleSliceClick : undefined}
        />
      </div>
    );
  },
  args: {
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      enableExplode: true
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Drill-down Features:**
- Click on slices to drill down into sub-categories
- Breadcrumb navigation for easy traversal
- Smooth transitions between hierarchy levels
- Context preservation during navigation
        `
      }
    }
  }
};

// Nested pie chart
export const NestedPieChart: Story = {
  render: (args) => {
    const outerData = generateDepartmentDistribution();
    const innerData = generateSkillLevels();

    return (
      <div className="relative">
        <PieChart
          data={outerData}
          config={{
            ...args.config,
            innerRadius: 0.6,
            showLegend: false
          }}
          variant="donut"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48">
            <PieChart
              data={innerData}
              config={{
                responsive: true,
                animate: true,
                showLabels: false,
                showTooltips: true,
                showLegend: false,
                radius: 0.8
              }}
              variant="pie"
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Departments (Outer)</h4>
            <ul className="text-sm space-y-1">
              {outerData.map(item => (
                <li key={item.id} className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Skill Levels (Inner)</h4>
            <ul className="text-sm space-y-1">
              {innerData.map(item => (
                <li key={item.id} className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  },
  args: {
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Nested pie charts show multiple related datasets in a compact, visually appealing format.'
      }
    }
  }
};

// Small slices handling
export const SmallSlicesHandling: Story = {
  args: {
    data: [
      { id: 'large', label: 'Major Category', value: 450, color: '#3b82f6' },
      { id: 'medium', label: 'Medium Category', value: 120, color: '#10b981' },
      { id: 'small1', label: 'Small Category 1', value: 15, color: '#f59e0b' },
      { id: 'small2', label: 'Small Category 2', value: 8, color: '#ef4444' },
      { id: 'small3', label: 'Small Category 3', value: 5, color: '#8b5cf6' },
      { id: 'small4', label: 'Small Category 4', value: 3, color: '#06b6d4' },
      { id: 'small5', label: 'Small Category 5', value: 2, color: '#84cc16' }
    ],
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      smallSliceThreshold: 0.05, // Group slices < 5%
      smallSliceLabel: 'Others',
      expandSmallSlices: true
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Small Slices Features:**
- Automatic grouping of slices below threshold
- Expandable "Others" category
- Smart label positioning for tiny slices  
- Configurable threshold and grouping behavior
        `
      }
    }
  }
};

// Theme variations
export const ThemeVariations: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Light Theme</h3>
        <ThemeProvider theme="light">
          <PieChart {...args} />
        </ThemeProvider>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Dark Theme</h3>
        <ThemeProvider theme="dark">
          <PieChart {...args} />
        </ThemeProvider>
      </div>
    </div>
  ),
  args: {
    data: generateLearningMethods(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      height: 350
    },
    variant: 'donut'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates automatic theme adaptation with appropriate colors and contrast for light and dark modes.'
      }
    }
  }
};

// Animation showcase
export const AnimationShowcase: Story = {
  args: {
    data: generateCertificationData(),
    config: {
      responsive: true,
      animate: true,
      animationDuration: 1500,
      animationEasing: 'elastic',
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      enableExplode: true,
      hoverExplodeDistance: 15,
      clickExplodeDistance: 25
    },
    variant: 'pie'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Animation Features:**
- Smooth slice entrance with staggered timing
- Elastic easing for playful interactions
- Hover explode effects with distance control
- Click explode for enhanced feedback
- Configurable duration and easing functions
        `
      }
    }
  }
};

// Error states and edge cases
export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Empty Data</h3>
        <PieChart 
          data={[]} 
          config={{ responsive: true, showEmptyState: true }}
          variant="pie"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Slice</h3>
        <PieChart 
          data={[{ id: '1', label: 'Complete', value: 100, color: '#10b981' }]}
          config={{ responsive: true, animate: true }}
          variant="pie"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Zero Values</h3>
        <PieChart 
          data={[
            { id: '1', label: 'Has Value', value: 50, color: '#3b82f6' },
            { id: '2', label: 'Zero Value', value: 0, color: '#6b7280' },
            { id: '3', label: 'Another Value', value: 30, color: '#10b981' }
          ]}
          config={{ responsive: true, animate: true, showZeroValues: false }}
          variant="pie"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates graceful handling of edge cases: empty data, single slices, and zero values.'
      }
    }
  }
};