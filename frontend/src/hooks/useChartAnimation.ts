import { useState, useEffect } from 'react'
import { AnimationConfig } from '../types/animation'

export const useChartAnimation = (config: AnimationConfig = {
  duration: 300,
  easing: 'ease-in-out',
  enabled: true
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  const startAnimation = () => {
    if (!config.enabled) return
    
    setIsAnimating(true)
    setProgress(0)
    
    // Minimal animation implementation
    setTimeout(() => {
      setProgress(1)
      setIsAnimating(false)
    }, config.duration)
  }

  return {
    isAnimating,
    progress,
    startAnimation,
    config
  }
}

export default useChartAnimation