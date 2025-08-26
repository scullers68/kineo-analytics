import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { ChartInstance, ChartDataset, ChartDimensions } from '../../types/store'

interface BaseChartProps {
  data?: ChartDataset[]
  width?: number
  height?: number
  className?: string
}

export const BaseChart: React.FC<BaseChartProps> = ({ 
  data = [],
  width = 400,
  height = 300,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove() // Clear previous render

    // Basic D3.js integration - minimal implementation
    svg
      .attr('width', width)
      .attr('height', height)
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .text('BaseChart Component')
      .style('font-family', 'Arial, sans-serif')
      .style('font-size', '14px')

  }, [data, width, height])

  return (
    <div className={`chart-container ${className}`}>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  )
}

export default BaseChart

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BaseChart, default: BaseChart }
}