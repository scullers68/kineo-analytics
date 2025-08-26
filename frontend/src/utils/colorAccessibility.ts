export interface HighContrastColors {
  background: string
  foreground: string
  accent: string
  border: string
  text: string
}

export const getHighContrastColors = (isDark: boolean = false): HighContrastColors => {
  if (isDark) {
    return {
      background: '#000000',
      foreground: '#ffffff',
      accent: '#ffff00',
      border: '#ffffff',
      text: '#ffffff'
    }
  }
  
  return {
    background: '#ffffff',
    foreground: '#000000',
    accent: '#0000ff',
    border: '#000000',
    text: '#000000'
  }
}

export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast calculation
  // In a real implementation, you'd convert colors to RGB and calculate luminance
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substr(0, 2), 16)
  const g1 = parseInt(hex1.substr(2, 2), 16)
  const b1 = parseInt(hex1.substr(4, 2), 16)
  
  const r2 = parseInt(hex2.substr(0, 2), 16)
  const g2 = parseInt(hex2.substr(2, 2), 16)
  const b2 = parseInt(hex2.substr(4, 2), 16)
  
  const luminance1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255
  const luminance2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255
  
  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

export const meetsWCAGAA = (color1: string, color2: string): boolean => {
  return calculateContrastRatio(color1, color2) >= 4.5
}

export const meetsWCAGAAA = (color1: string, color2: string): boolean => {
  return calculateContrastRatio(color1, color2) >= 7
}

export default getHighContrastColors