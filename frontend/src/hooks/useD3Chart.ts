import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartInstance } from '../types/store'

export interface UseD3ChartOptions {
  data?: any[]
  width?: number
  height?: number
}

export const useD3Chart = (options: UseD3ChartOptions = {}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    
    // Minimal D3 integration
    svg.selectAll("*").remove()
    
    return () => {
      // Cleanup
      svg.selectAll("*").remove()
    }
  }, [options.data, options.width, options.height])

  return { svgRef }
}

export default useD3Chart