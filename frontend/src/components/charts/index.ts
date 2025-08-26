// Chart Components Barrel Exports
export { BaseChart, default as BaseChartDefault } from './BaseChart'
export { ResponsiveChart, default as ResponsiveChartDefault } from './ResponsiveChart'
export { AccessibleChart, default as AccessibleChartDefault } from './AccessibleChart'
export { PerformantChart, default as PerformantChartDefault } from './PerformantChart'
export { AnimatedChart, default as AnimatedChartDefault } from './AnimatedChart'
export { LazyChartLoader, preloadChartComponent, useChartPreloader } from './LazyChartLoader'

// Re-export for CommonJS compatibility
import BaseChart from './BaseChart'
import ResponsiveChart from './ResponsiveChart'
import AccessibleChart from './AccessibleChart'
import PerformantChart from './PerformantChart'
import AnimatedChart from './AnimatedChart'

// CommonJS exports for test compatibility
module.exports = {
  BaseChart,
  ResponsiveChart,
  AccessibleChart,
  PerformantChart,
  AnimatedChart
}

// Also provide named exports for ES modules
export {
  BaseChart as BaseChartComponent,
  ResponsiveChart as ResponsiveChartComponent,
  AccessibleChart as AccessibleChartComponent,
  PerformantChart as PerformantChartComponent,
  AnimatedChart as AnimatedChartComponent
}