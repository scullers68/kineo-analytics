export interface ColorBlindFriendlyPalette {
  primary: string[]
  secondary: string[]
  qualitative: string[]
  sequential: string[]
}

export const getColorBlindFriendlyPalette = (): ColorBlindFriendlyPalette => {
  return {
    primary: [
      '#1f77b4', // blue
      '#ff7f0e', // orange
      '#2ca02c', // green
      '#d62728', // red
      '#9467bd', // purple
      '#8c564b', // brown
    ],
    secondary: [
      '#17becf', // cyan
      '#bcbd22', // olive
      '#e377c2', // pink
      '#7f7f7f', // gray
    ],
    qualitative: [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
      '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
      '#bcbd22', '#17becf'
    ],
    sequential: [
      '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1',
      '#6baed6', '#4292c6', '#2171b5', '#08519c',
      '#08306b'
    ]
  }
}

export const simulateColorBlindness = (color: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string => {
  // Simplified color blindness simulation
  // In a real implementation, this would apply proper color transformation matrices
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  let newR = r, newG = g, newB = b
  
  switch (type) {
    case 'protanopia': // Red-blind
      newR = Math.round(0.567 * r + 0.433 * g)
      newG = Math.round(0.558 * r + 0.442 * g)
      break
    case 'deuteranopia': // Green-blind
      newR = Math.round(0.625 * r + 0.375 * g)
      newG = Math.round(0.7 * r + 0.3 * g)
      break
    case 'tritanopia': // Blue-blind
      newG = Math.round(0.95 * g + 0.05 * b)
      newB = Math.round(0.433 * g + 0.567 * b)
      break
  }
  
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
}

export const isColorBlindFriendly = (colors: string[]): boolean => {
  const palette = getColorBlindFriendlyPalette()
  return colors.every(color => palette.qualitative.includes(color))
}

export default getColorBlindFriendlyPalette