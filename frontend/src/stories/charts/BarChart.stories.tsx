import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from '../../components/charts/BarChart';
import { CustomerProvider } from '../../contexts/CustomerContext';
import { ThemeProvider } from '../../components/theme/ThemeProvider';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# BarChart Component

Interactive bar chart component built with D3.js for displaying categorical data in the Kineo Analytics platform.

## Features
- ✅ Responsive design with breakpoint adaptations  
- ✅ Smooth D3.js animations and transitions
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Multi-tenant customer context support
- ✅ Theme switching (light/dark modes)
- ✅ Interactive tooltips and hover effects
- ✅ Keyboard navigation support
- ✅ Performance optimized for large datasets

## Accessibility Features
- Screen reader compatible with proper ARIA labels
- Keyboard navigation with Tab and Arrow keys
- High contrast color schemes for visual impairments
- Focus indicators and semantic markup
- Alternative text descriptions for chart data

## Performance Targets
- Initial render: <200ms for datasets up to 1000 points
- Animation frame rate: 60fps during transitions
- Memory usage: Efficient cleanup on unmount
- Bundle impact: Tree-shakeable and optimized
        `
      }
    },
    a11y: {
      element: '[data-testid="bar-chart"]'
    }
  },
  argTypes: {
    data: {
      description: 'Array of data points to visualize',
      control: { type: 'object' }
    },
    config: {
      description: 'Chart configuration options',
      control: { type: 'object' }
    },
    variant: {
      description: 'Chart style variant',
      control: { type: 'select' },
      options: ['simple', 'grouped', 'stacked']
    },
    onBarClick: {
      description: 'Callback function when bar is clicked',
      action: 'bar clicked'
    },
    onBarHover: {
      description: 'Callback function when bar is hovered',
      action: 'bar hovered'
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
const generateCourseCompletionData = (count: number = 5) => {
  const courses = ['React Basics', 'Advanced TypeScript', 'D3.js Visualization', 'Testing Strategies', 'Performance Optimization'];
  return courses.slice(0, count).map((course, index) => ({
    id: `course-${index + 1}`,
    label: course,
    value: Math.floor(Math.random() * 100) + 20,
    category: 'completion'
  }));
};

const generateLearningTimeData = () => [
  { id: 'week-1', label: 'Week 1', value: 42, category: 'time' },
  { id: 'week-2', label: 'Week 2', value: 38, category: 'time' },
  { id: 'week-3', label: 'Week 3', value: 55, category: 'time' },
  { id: 'week-4', label: 'Week 4', value: 61, category: 'time' },
  { id: 'week-5', label: 'Week 5', value: 48, category: 'time' }
];

const generateDepartmentData = () => [
  { id: 'hr', label: 'Human Resources', value: 87, category: 'department' },
  { id: 'it', label: 'Information Technology', value: 92, category: 'department' },
  { id: 'sales', label: 'Sales', value: 78, category: 'department' },
  { id: 'marketing', label: 'Marketing', value: 84, category: 'department' },
  { id: 'operations', label: 'Operations', value: 90, category: 'department' }
];

// Default story
export const Default: Story = {
  args: {
    data: generateCourseCompletionData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: false
    },
    variant: 'simple'
  }
};

// Interactive controls story
export const Interactive: Story = {
  args: {
    data: generateCourseCompletionData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 50 }
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive bar chart with all controls available for customization. Use the Controls panel to modify properties.'
      }
    }
  }
};

// Accessibility demonstration
export const AccessibilityFeatures: Story = {
  args: {
    data: generateDepartmentData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      accessibilityLabel: 'Department completion rates bar chart',
      accessibilityDescription: 'Shows completion rates for different departments ranging from 78% to 92%'
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Accessibility Testing Instructions:**
1. Use Tab key to navigate between bars
2. Use Arrow keys to move between data points
3. Press Enter or Space to select/interact with bars
4. Screen reader will announce data values and descriptions
5. High contrast mode automatically applies appropriate colors
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

// Performance benchmark with large dataset
export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 10,
      category: 'performance'
    })),
    config: {
      responsive: true,
      animate: true,
      showLabels: false, // Disabled for performance
      showTooltips: true,
      height: 500,
      performanceMode: true
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Performance Demonstration:**
- Dataset: 100 data points
- Target render time: <200ms
- Animation frame rate: 60fps
- Memory efficient rendering

Use browser DevTools Performance tab to measure rendering performance.
        `
      }
    }
  }
};

// Responsive behavior demonstration
export const ResponsiveBehavior: Story = {
  args: {
    data: generateLearningTimeData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      showLegend: true
    },
    variant: 'simple'
  },
  parameters: {
    viewport: {
      defaultViewport: 'kineo_mobile'
    },
    docs: {
      description: {
        story: `
**Responsive Testing:**
Use the viewport controls in the toolbar to test different screen sizes:
- Mobile (375px): Simplified layout, stacked legend
- Tablet (768px): Horizontal legend, optimized spacing  
- Desktop (1440px): Full layout with all features
- Wide (1920px): Maximum width with enhanced spacing
        `
      }
    }
  }
};

// Theme variations
export const ThemeVariations: Story = {
  render: (args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Light Theme</h3>
        <ThemeProvider theme="light">
          <BarChart {...args} />
        </ThemeProvider>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Dark Theme</h3>
        <ThemeProvider theme="dark">
          <BarChart {...args} />
        </ThemeProvider>
      </div>
    </div>
  ),
  args: {
    data: generateDepartmentData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates automatic theme adaptation for light and dark modes with appropriate color schemes.'
      }
    }
  }
};

// Multi-tenant customer variations
export const CustomerVariations: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer 001</h3>
        <CustomerProvider customerId="customer_001" customerName="Acme Corp">
          <BarChart {...args} />
        </CustomerProvider>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer 002</h3>
        <CustomerProvider customerId="customer_002" customerName="TechStart Inc">
          <BarChart {...args} />
        </CustomerProvider>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Customer 003</h3>
        <CustomerProvider customerId="customer_003" customerName="Enterprise Solutions">
          <BarChart {...args} />
        </CustomerProvider>
      </div>
    </div>
  ),
  args: {
    data: generateCourseCompletionData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      height: 300
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates multi-tenant customer context with customer-specific styling and data isolation.'
      }
    }
  }
};

// Chart variants comparison
export const VariantsComparison: Story = {
  render: (args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Simple Bar Chart</h3>
        <BarChart {...args} variant="simple" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Grouped Bar Chart</h3>
        <BarChart {...args} variant="grouped" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Stacked Bar Chart</h3>
        <BarChart {...args} variant="stacked" />
      </div>
    </div>
  ),
  args: {
    data: generateDepartmentData(),
    config: {
      responsive: true,
      animate: true,
      showLabels: true,
      showTooltips: true,
      height: 300
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available bar chart variants: simple, grouped, and stacked layouts.'
      }
    }
  }
};

// Animation and interaction showcase
export const AnimationShowcase: Story = {
  args: {
    data: generateLearningTimeData(),
    config: {
      responsive: true,
      animate: true,
      animationDuration: 1000,
      animationEasing: 'ease-out',
      showLabels: true,
      showTooltips: true,
      enableHoverEffects: true,
      enableClickEffects: true
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Animation Features:**
- Smooth entrance animations with staggered timing
- Interactive hover effects with scale and color transitions  
- Click animations with visual feedback
- Configurable duration and easing functions
- Performance-optimized 60fps animations
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
        <BarChart 
          data={[]} 
          config={{ responsive: true, showEmptyState: true }}
          variant="simple"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Data Point</h3>
        <BarChart 
          data={[{ id: '1', label: 'Single Point', value: 75, category: 'test' }]}
          config={{ responsive: true, animate: true }}
          variant="simple"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Zero Values</h3>
        <BarChart 
          data={[
            { id: '1', label: 'Zero Value', value: 0, category: 'test' },
            { id: '2', label: 'Normal Value', value: 50, category: 'test' }
          ]}
          config={{ responsive: true, animate: true }}
          variant="simple"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates graceful handling of edge cases: empty data, single points, and zero values.'
      }
    }
  }
};