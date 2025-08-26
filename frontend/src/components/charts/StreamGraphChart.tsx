import React from 'react'
import { AreaChart } from './AreaChart'
import { AreaChartProps, StreamGraphConfig } from '../../types/area-chart'

// StreamGraphChart is a specialized variant of AreaChart
export interface StreamGraphChartProps extends Omit<AreaChartProps, 'variant' | 'config'> {
  config?: StreamGraphConfig
}

export const StreamGraphChart: React.FC<StreamGraphChartProps> = ({
  data,
  config = {},
  width = 400,
  height = 300,
  onPointClick,
  onPointHover,
  onZoom,
  className = ''
}) => {
  // StreamGraph-specific default configuration
  const streamConfig: StreamGraphConfig = {
    interpolation: 'cardinal',
    stackedMode: 'stream',
    showPoints: false,
    pointRadius: 3,
    strokeWidth: 0.5,
    areaOpacity: 0.85,
    showGrid: false,
    showLegend: true,
    zoomable: true,
    pannable: true,
    gradientFill: true,
    streamOrder: 'inside-out',
    streamOffset: 'wiggle',
    symmetrical: true,
    flowAnimation: true,
    theme: { primary: '#3b82f6', secondary: '#64748b', background: '#ffffff' },
    animation: {
      duration: 1200,
      easing: 'ease-in-out',
      enabled: true,
      drawDuration: 1500,
      pointDelay: 150,
      morphDuration: 800,
      pathLength: true
    },
    accessibility: { enabled: true, announceChanges: true },
    missingData: {
      detectGaps: true,
      gapThreshold: 86400000,
      interpolationMethod: 'linear',
      showGapIndicators: false // Less prominent for aesthetic flow
    },
    ...config
  }

  return (
    <div className={`stream-graph-container ${className}`}>
      <AreaChart
        data={data}
        config={streamConfig}
        variant="stream"
        width={width}
        height={height}
        onPointClick={onPointClick}
        onPointHover={onPointHover}
        onZoom={onZoom}
        className="stream-graph"
      />
      
      {/* Stream Graph specific legend */}
      {streamConfig.showLegend && data.length > 1 && (
        <div className="mt-2 text-center">
          <div className="text-sm text-gray-600 mb-2">Stream Graph - Flow of {data.length} Data Series</div>
          <div className="flex flex-wrap justify-center gap-4">
            {data.map((series, i) => (
              <div key={series.id} className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: series.color || `hsl(${(i * 137.5) % 360}, 65%, 55%)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
                <span className="text-sm font-medium">{series.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stream Graph description for accessibility */}
      <div className="sr-only">
        Stream graph visualization showing the flow and evolution of {data.length} data series over time.
        The symmetric layout emphasizes the organic flow of data while maintaining readability.
        Stream order: {streamConfig.streamOrder}, Stream offset: {streamConfig.streamOffset}.
        {streamConfig.symmetrical && 'Symmetrical layout for balanced visual weight.'}
        {streamConfig.flowAnimation && streamConfig.animation?.enabled && 'Animated flow for enhanced visual appeal.'}
      </div>

      {/* Stream Graph specific controls */}
      <div className="mt-2 flex justify-center gap-2 text-xs">
        <div className="bg-gray-100 px-2 py-1 rounded">
          Order: {streamConfig.streamOrder?.replace('-', ' ') || 'default'}
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded">
          Offset: {streamConfig.streamOffset || 'wiggle'}
        </div>
        {streamConfig.symmetrical && (
          <div className="bg-blue-100 px-2 py-1 rounded">
            Symmetrical
          </div>
        )}
      </div>
    </div>
  )
}

export default StreamGraphChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StreamGraphChart, default: StreamGraphChart }
}