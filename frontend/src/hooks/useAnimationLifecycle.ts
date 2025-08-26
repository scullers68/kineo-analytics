import { useState, useEffect, useCallback } from 'react'

export interface AnimationLifecycleState {
  phase: 'idle' | 'starting' | 'animating' | 'ending' | 'complete'
  progress: number
  duration: number
}

export const useAnimationLifecycle = (duration: number = 300) => {
  const [state, setState] = useState<AnimationLifecycleState>({
    phase: 'idle',
    progress: 0,
    duration
  })

  const start = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'starting' }))
    
    // Simulate animation lifecycle
    setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'animating', progress: 0.5 }))
    }, 50)
    
    setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'ending', progress: 0.9 }))
    }, duration - 50)
    
    setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'complete', progress: 1 }))
    }, duration)
  }, [duration])

  const reset = useCallback(() => {
    setState({ phase: 'idle', progress: 0, duration })
  }, [duration])

  return { state, start, reset }
}

export default useAnimationLifecycle