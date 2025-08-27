import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from '../../components/charts/LineChart';
import { CustomerProvider } from '../../contexts/CustomerContext';
import { ThemeProvider } from '../../components/theme/ThemeProvider';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# LineChart Component

Interactive line chart component built with D3.js for displaying time-series and continuous data in the Kineo Analytics platform.

## Features
- ✅ Time-series data visualization with date parsing
- ✅ Multi-line support with automatic color assignment
- ✅ Smooth curve interpolation and line animations
- ✅ Interactive data points with tooltips
- ✅ Zoom and pan functionality for large datasets
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Responsive design with adaptive breakpoints
- ✅ Performance optimized for real-time updates

## Accessibility Features
- Keyboard navigation between data points
- Screen reader compatible with data announcements
- Alternative pattern support for color blindness
- Focus indicators and semantic ARIA markup
- Configurable contrast ratios and text sizes

## Performance Targets
- Initial render: <200ms for datasets up to 2000 points
- Real-time updates: <50ms per data point addition
- Animation frame rate: 60fps during transitions
- Memory efficient path generation and cleanup
        `
      }
    },
    a11y: {
      element: '[data-testid="line-chart"]'
    }
  },
  argTypes: {
    data: {
      description: 'Array of time-series data points to visualize',
      control: { type: 'object' }
    },
    config: {
      description: 'Chart configuration options',
      control: { type: 'object' }
    },
    variant: {
      description: 'Chart style variant',
      control: { type: 'select' },
      options: ['simple', 'multi-line', 'area', 'stepped']
    },
    onPointClick: {
      description: 'Callback function when data point is clicked',
      action: 'point clicked'
    },
    onLineHover: {
      description: 'Callback function when line is hovered',
      action: 'line hovered'
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
const generateTimeSeriesData = (days: number = 30) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    return {
      id: `day-${i}`,
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 30,
      timestamp: date.getTime()
    };
  });
};

const generateMultiLineData = () => {
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return date.toISOString().split('T')[0];
  });

  return [
    {
      id: 'course-completions',
      label: 'Course Completions',
      data: dates.map((date, i) => ({
        id: `completion-${i}`,
        date,
        value: Math.floor(Math.random() * 20) + 15,
        timestamp: new Date(date).getTime()
      }))
    },
    {
      id: 'active-users',
      label: 'Active Users',
      data: dates.map((date, i) => ({
        id: `user-${i}`,
        date,
        value: Math.floor(Math.random() * 30) + 25,
        timestamp: new Date(date).getTime()
      }))
    },
    {
      id: 'learning-hours',
      label: 'Learning Hours',
      data: dates.map((date, i) => ({
        id: `hours-${i}`,
        date,
        value: Math.floor(Math.random() * 15) + 8,
        timestamp: new Date(date).getTime()
      }))
    }
  ];
};

const generateLearningProgressData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
  return weeks.map((week, index) => ({
    id: `week-${index + 1}`,
    date: week,
    value: Math.min(100, 20 + (index * 12) + Math.floor(Math.random() * 10)),
    timestamp: Date.now() + (index * 7 * 24 * 60 * 60 * 1000)
  }));
};

// Default story
export const Default: Story = {
  args: {
    data: generateTimeSeriesData(),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      showLegend: false,
      curveType: 'natural'
    },
    variant: 'simple'
  }
};

// Interactive controls story
export const Interactive: Story = {
  args: {
    data: generateTimeSeriesData(21),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      showLegend: true,
      showGrid: true,
      curveType: 'natural',
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 50 }
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive line chart with all controls available for customization. Use the Controls panel to modify properties.'
      }
    }
  }
};

// Multi-line chart demonstration
export const MultiLineChart: Story = {
  args: {
    data: generateMultiLineData(),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      showLegend: true,
      showGrid: true,
      curveType: 'natural',
      height: 450
    },
    variant: 'multi-line'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Multi-line Features:**
- Multiple data series with automatic color assignment
- Interactive legend for show/hide series
- Cross-line tooltip comparisons
- Individual line hover effects
- Performance optimized for multiple series
        `
      }
    }
  }
};

// Accessibility demonstration
export const AccessibilityFeatures: Story = {
  args: {
    data: generateLearningProgressData(),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      accessibilityLabel: 'Learning progress line chart',
      accessibilityDescription: 'Shows learning progress over 8 weeks, increasing from 20% to 96%',
      enableKeyboardNavigation: true,
      highContrastMode: true
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Accessibility Testing Instructions:**
1. Use Tab key to navigate between data points
2. Use Arrow keys to move along the line
3. Press Enter to announce current data point value
4. Screen reader announces trend direction and values
5. High contrast patterns for color blind users
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
    data: generateTimeSeriesData(365), // Full year of data
    config: {
      responsive: true,
      animate: false, // Disabled for performance
      showPoints: false, // Disabled for performance
      showTooltips: true,
      height: 500,
      performanceMode: true,
      virtualScrolling: true
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Performance Demonstration:**
- Dataset: 365 data points (full year)
- Target render time: <200ms
- Virtualized rendering for large datasets
- Optimized path generation algorithms

Use browser DevTools Performance tab to measure rendering performance.
        `
      }
    }
  }
};

// Real-time data updates
export const RealTimeUpdates: Story = {
  render: (args) => {
    const [data, setData] = React.useState(generateTimeSeriesData(10));
    
    React.useEffect(() => {
      const interval = setInterval(() => {
        setData(currentData => {
          const newPoint = {
            id: `point-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            value: Math.floor(Math.random() * 50) + 30,
            timestamp: Date.now()
          };
          return [...currentData.slice(1), newPoint];
        });
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return <LineChart {...args} data={data} />;
  },
  args: {
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      realTimeUpdates: true,
      animationDuration: 750
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Real-time Features:**
- Automatic data updates every 2 seconds
- Smooth transitions for new data points
- Rolling window maintains performance
- Optimized re-rendering strategies
        `
      }
    }
  }
};

// Area chart variant
export const AreaChart: Story = {
  args: {
    data: generateLearningProgressData(),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      showArea: true,
      areaOpacity: 0.3,
      curveType: 'cardinal'
    },
    variant: 'area'
  },
  parameters: {
    docs: {
      description: {
        story: 'Area chart variant fills the space below the line to emphasize cumulative values or progress over time.'
      }
    }
  }
};

// Stepped line chart
export const SteppedChart: Story = {
  args: {
    data: generateTimeSeriesData(12),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      curveType: 'step',
      stepPosition: 'after'
    },
    variant: 'stepped'
  },
  parameters: {
    docs: {
      description: {
        story: 'Stepped line chart for discrete data changes, commonly used for status transitions or categorical time data.'
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
          <LineChart {...args} />
        </ThemeProvider>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Dark Theme</h3>
        <ThemeProvider theme="dark">
          <LineChart {...args} />
        </ThemeProvider>
      </div>
    </div>
  ),
  args: {
    data: generateMultiLineData(),
    config: {
      responsive: true,
      animate: true,
      showPoints: true,
      showTooltips: true,
      showLegend: true,
      height: 300
    },
    variant: 'multi-line'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates automatic theme adaptation with appropriate colors for light and dark modes.'
      }
    }
  }
};

// Zoom and pan functionality
export const ZoomAndPan: Story = {
  args: {
    data: generateTimeSeriesData(90), // 3 months of data
    config: {
      responsive: true,
      animate: true,
      showPoints: false,
      showTooltips: true,
      enableZoom: true,
      enablePan: true,
      zoomExtent: [0.1, 10],
      height: 400
    },
    variant: 'simple'
  },
  parameters: {
    docs: {
      description: {
        story: `
**Zoom and Pan Features:**
- Mouse wheel zoom functionality
- Click and drag to pan across data
- Double-click to reset zoom
- Zoom extent controls for limits
- Smooth zoom animations
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
        <LineChart 
          data={[]} 
          config={{ responsive: true, showEmptyState: true }}
          variant="simple"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Data Point</h3>
        <LineChart 
          data={[{ id: '1', date: '2024-01-01', value: 75, timestamp: Date.now() }]}
          config={{ responsive: true, animate: true }}
          variant="simple"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Sparse Data</h3>
        <LineChart 
          data={[
            { id: '1', date: '2024-01-01', value: 30, timestamp: Date.now() - 86400000 * 10 },
            { id: '2', date: '2024-01-15', value: 45, timestamp: Date.now() - 86400000 * 5 },
            { id: '3', date: '2024-01-30', value: 60, timestamp: Date.now() }
          ]}
          config={{ responsive: true, animate: true, showPoints: true }}
          variant="simple"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates graceful handling of edge cases: empty data, single points, and sparse datasets.'
      }
    }
  }
};