// Chart Components Barrel Exports
export { BaseChart, default as BaseChartDefault } from './BaseChart'
export { ResponsiveChart, default as ResponsiveChartDefault } from './ResponsiveChart'
export { AccessibleChart, default as AccessibleChartDefault } from './AccessibleChart'
export { PerformantChart, default as PerformantChartDefault } from './PerformantChart'
export { AnimatedChart, default as AnimatedChartDefault } from './AnimatedChart'
export { LazyChartLoader, preloadChartComponent, useChartPreloader } from './LazyChartLoader'

// Bar and Column Chart Components
export { BarChart, default as BarChartDefault } from './BarChart'
export { ColumnChart, default as ColumnChartDefault } from './ColumnChart'

// Line and Area Chart Components
export { LineChart, default as LineChartDefault } from './LineChart'
export { AreaChart, default as AreaChartDefault } from './AreaChart'
export { StreamGraphChart, default as StreamGraphChartDefault } from './StreamGraphChart'
export { LineChartLegend, default as LineChartLegendDefault } from './LineChartLegend'

// Chart Variants
export { SimpleBarChart, default as SimpleBarChartDefault } from './variants/SimpleBarChart'
export { GroupedBarChart, default as GroupedBarChartDefault } from './variants/GroupedBarChart'
export { StackedBarChart, default as StackedBarChartDefault } from './variants/StackedBarChart'
export { SimpleColumnChart, default as SimpleColumnChartDefault } from './variants/SimpleColumnChart'
export { GroupedColumnChart, default as GroupedColumnChartDefault } from './variants/GroupedColumnChart'
export { StackedColumnChart, default as StackedColumnChartDefault } from './variants/StackedColumnChart'

// Re-export for CommonJS compatibility
import BaseChart from './BaseChart'
import ResponsiveChart from './ResponsiveChart'
import AccessibleChart from './AccessibleChart'
import PerformantChart from './PerformantChart'
import AnimatedChart from './AnimatedChart'
import BarChart from './BarChart'
import ColumnChart from './ColumnChart'
import LineChart from './LineChart'
import AreaChart from './AreaChart'
import StreamGraphChart from './StreamGraphChart'
import LineChartLegend from './LineChartLegend'
import SimpleBarChart from './variants/SimpleBarChart'
import GroupedBarChart from './variants/GroupedBarChart'
import StackedBarChart from './variants/StackedBarChart'
import SimpleColumnChart from './variants/SimpleColumnChart'
import GroupedColumnChart from './variants/GroupedColumnChart'
import StackedColumnChart from './variants/StackedColumnChart'

// CommonJS exports for test compatibility
module.exports = {
  BaseChart,
  ResponsiveChart,
  AccessibleChart,
  PerformantChart,
  AnimatedChart,
  BarChart,
  ColumnChart,
  LineChart,
  AreaChart,
  StreamGraphChart,
  LineChartLegend,
  SimpleBarChart,
  GroupedBarChart,
  StackedBarChart,
  SimpleColumnChart,
  GroupedColumnChart,
  StackedColumnChart
}

// Also provide named exports for ES modules
export {
  BaseChart as BaseChartComponent,
  ResponsiveChart as ResponsiveChartComponent,
  AccessibleChart as AccessibleChartComponent,
  PerformantChart as PerformantChartComponent,
  AnimatedChart as AnimatedChartComponent,
  BarChart as BarChartComponent,
  ColumnChart as ColumnChartComponent,
  LineChart as LineChartComponent,
  AreaChart as AreaChartComponent,
  StreamGraphChart as StreamGraphChartComponent,
  LineChartLegend as LineChartLegendComponent,
  SimpleBarChart as SimpleBarChartComponent,
  GroupedBarChart as GroupedBarChartComponent,
  StackedBarChart as StackedBarChartComponent,
  SimpleColumnChart as SimpleColumnChartComponent,
  GroupedColumnChart as GroupedColumnChartComponent,
  StackedColumnChart as StackedColumnChartComponent
}