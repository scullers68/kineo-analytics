import React from 'react'
import { BaseChart } from './BaseChart'
import { AnimationConfig } from '../../types/store'

interface AnimatedChartProps {
  animation?: AnimationConfig
  children?: React.ReactNode
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({ 
  animation = {
    duration: 300,
    easing: 'ease-in-out',
    enabled: true
  },
  children
}) => {
  return (
    <div className="animated-chart">
      {children}
    </div>
  )
}

export default AnimatedChart