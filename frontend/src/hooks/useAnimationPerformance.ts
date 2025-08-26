import { useState, useEffect } from 'react'

export interface AnimationPerformanceMetrics {
  frameRate: number
  averageFrameTime: number
  droppedFrames: number
  isPerformant: boolean
}

export const useAnimationPerformance = () => {
  const [metrics, setMetrics] = useState<AnimationPerformanceMetrics>({
    frameRate: 60,
    averageFrameTime: 16.67, // 1000ms / 60fps
    droppedFrames: 0,
    isPerformant: true
  })

  const startMonitoring = () => {
    // Minimal performance monitoring implementation
    const startTime = performance.now()
    let frameCount = 0
    
    const monitor = () => {
      frameCount++
      const elapsed = performance.now() - startTime
      const fps = (frameCount / elapsed) * 1000
      
      setMetrics({
        frameRate: Math.round(fps),
        averageFrameTime: 1000 / fps,
        droppedFrames: Math.max(0, 60 - fps),
        isPerformant: fps >= 50 // Consider 50+ FPS as performant
      })
      
      if (frameCount < 60) { // Monitor for 1 second at 60fps
        requestAnimationFrame(monitor)
      }
    }
    
    requestAnimationFrame(monitor)
  }

  return { metrics, startMonitoring }
}

export default useAnimationPerformance