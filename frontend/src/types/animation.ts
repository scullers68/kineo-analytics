export interface AnimationConfig {
  duration: number
  easing: string
  stagger?: number
  delay?: number
  enabled: boolean
}

export interface AnimationState {
  isAnimating: boolean
  progress: number
  startTime?: number
}

export type EasingFunction = (t: number) => number

export const AnimationEasing = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t)
} as const