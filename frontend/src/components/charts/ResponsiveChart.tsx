import React, { useState, useEffect } from 'react'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useResizeObserver } from '../../hooks/useResizeObserver'

interface ResponsiveChartProps {
  children?: React.ReactNode
  className?: string
  maintainAspectRatio?: boolean
  aspectRatio?: number
}

export const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  children,
  className = '',
  maintainAspectRatio = true,
  aspectRatio = 16/9
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const breakpoint = useBreakpoint()
  const { ref, entry } = useResizeObserver<HTMLDivElement>()

  useEffect(() => {
    if (entry) {
      const { width } = entry.contentRect
      const height = maintainAspectRatio ? width / aspectRatio : entry.contentRect.height
      
      setDimensions({ width, height })
    }
  }, [entry, aspectRatio, maintainAspectRatio])

  const getResponsiveClasses = () => {
    const baseClasses = 'responsive-chart w-full'
    
    switch (breakpoint) {
      case 'sm':
        return `${baseClasses} h-48`
      case 'md':
        return `${baseClasses} h-64`
      case 'lg':
        return `${baseClasses} h-80`
      case 'xl':
        return `${baseClasses} h-96`
      default:
        return `${baseClasses} h-40`
    }
  }

  return (
    <div 
      ref={ref}
      className={`${getResponsiveClasses()} ${className}`}
      style={{
        height: maintainAspectRatio ? dimensions.height : undefined
      }}
    >
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { 
              width: dimensions.width, 
              height: dimensions.height,
              breakpoint
            } as any)
          : child
      )}
    </div>
  )
}

export default ResponsiveChart