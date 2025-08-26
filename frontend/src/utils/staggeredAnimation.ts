import { AnimationConfig } from '../types/animation'

export interface StaggeredAnimationOptions {
  items: any[]
  baseDelay?: number
  staggerDelay?: number
  duration?: number
}

export const createStaggeredAnimation = (options: StaggeredAnimationOptions) => {
  const {
    items,
    baseDelay = 0,
    staggerDelay = 100,
    duration = 300
  } = options

  return items.map((item, index) => ({
    ...item,
    animationDelay: baseDelay + (index * staggerDelay),
    animationDuration: duration
  }))
}

export const calculateStaggeredTiming = (index: number, staggerDelay = 100, baseDelay = 0) => {
  return baseDelay + (index * staggerDelay)
}

export default createStaggeredAnimation