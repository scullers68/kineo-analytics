import * as d3 from 'd3'

export interface TransitionOptions {
  duration?: number
  delay?: number
  ease?: string
}

export const createSmoothTransition = (
  selection: d3.Selection<any, any, any, any>,
  options: TransitionOptions = {}
) => {
  const {
    duration = 300,
    delay = 0,
    ease = 'cubic-in-out'
  } = options

  return selection
    .transition()
    .duration(duration)
    .delay(delay)
    .ease(d3.easeCubicInOut) // Default easing
}

export const fadeIn = (selection: d3.Selection<any, any, any, any>, duration = 300) => {
  return selection
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .style('opacity', 1)
}

export const fadeOut = (selection: d3.Selection<any, any, any, any>, duration = 300) => {
  return selection
    .transition()
    .duration(duration)
    .style('opacity', 0)
}

export const scaleIn = (selection: d3.Selection<any, any, any, any>, duration = 300) => {
  return selection
    .attr('transform', 'scale(0)')
    .transition()
    .duration(duration)
    .attr('transform', 'scale(1)')
}

export default createSmoothTransition