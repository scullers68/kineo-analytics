/**
 * Branding Engine for Chart Export System - Task-0025
 * 
 * System for applying customer-specific branding elements (logos, colors, typography)
 * to chart exports while maintaining accessibility and visual consistency.
 */

import type {
  CustomerBranding,
  LogoApplicationConfig,
  ColorSchemeApplicationConfig,
  ColorContrastValidation
} from '../../types/export'

export class BrandingEngine {
  private static brandingCache = new Map<string, any>()

  /**
   * Apply customer logo to chart export
   */
  static async applyLogo(config: LogoApplicationConfig): Promise<HTMLElement> {
    const { logoData, position, size, chartDimensions, opacity = 1.0 } = config

    // Create logo container
    const logoContainer = document.createElement('div')
    logoContainer.className = 'export-logo-container'
    logoContainer.style.position = 'absolute'
    logoContainer.style.zIndex = '1000'
    logoContainer.style.opacity = opacity.toString()
    logoContainer.style.pointerEvents = 'none'

    // Create logo image
    const logoImg = document.createElement('img')
    logoImg.src = logoData
    logoImg.style.width = `${size.width}px`
    logoImg.style.height = `${size.height}px`
    logoImg.style.objectFit = 'contain'

    // Position logo based on configuration
    const positions = this.calculateLogoPosition(position, size, chartDimensions)
    logoContainer.style.top = `${positions.top}px`
    logoContainer.style.left = `${positions.left}px`

    logoContainer.appendChild(logoImg)
    return logoContainer
  }

  /**
   * Apply customer color scheme to chart elements
   */
  static applyColorScheme(config: ColorSchemeApplicationConfig): void {
    const { colors, chartElement, applyToBackground, applyToDataSeries, preserveAccessibility } = config

    // Apply background color if requested
    if (applyToBackground && colors.background) {
      this.applyBackgroundColor(chartElement, colors.background)
    }

    // Apply data series colors if requested
    if (applyToDataSeries) {
      this.applyDataSeriesColors(chartElement, colors)
    }

    // Validate accessibility if required
    if (preserveAccessibility) {
      this.validateAndAdjustColors(chartElement, colors)
    }
  }

  /**
   * Validate color contrast for accessibility compliance
   */
  static validateColorContrast(config: ColorContrastValidation): boolean {
    const { primaryColor, backgroundColor, minimumRatio } = config
    
    const primaryRGB = this.hexToRgb(primaryColor)
    const backgroundRGB = this.hexToRgb(backgroundColor)
    
    if (!primaryRGB || !backgroundRGB) {
      return false
    }

    const contrastRatio = this.calculateContrastRatio(primaryRGB, backgroundRGB)
    return contrastRatio >= minimumRatio
  }

  /**
   * Embed branding elements into export
   */
  static async embedInExport(brandingElement: {
    type: 'logo' | 'watermark' | 'colorScheme'
    data: any
    position: any
  }): Promise<void> {
    // Cache branding element for reuse
    const cacheKey = `${brandingElement.type}-${JSON.stringify(brandingElement.position)}`
    this.brandingCache.set(cacheKey, brandingElement.data)
  }

  /**
   * Apply typography branding to text elements
   */
  static applyTypography(element: Element, typography: CustomerBranding['typography']): void {
    const textElements = element.querySelectorAll('text, tspan, .chart-text')
    
    textElements.forEach((textElement) => {
      const htmlElement = textElement as HTMLElement
      htmlElement.style.fontFamily = typography.fontFamily
      
      // Only apply font size if it's not already specifically set
      if (!htmlElement.style.fontSize) {
        htmlElement.style.fontSize = `${typography.fontSize}px`
      }
    })
  }

  /**
   * Create branded export wrapper
   */
  static createBrandedWrapper(
    chartElement: Element,
    branding: CustomerBranding,
    dimensions: { width: number; height: number }
  ): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'branded-export-wrapper'
    wrapper.style.position = 'relative'
    wrapper.style.width = `${dimensions.width}px`
    wrapper.style.height = `${dimensions.height}px`
    wrapper.style.backgroundColor = branding.colors.background

    // Clone chart element to avoid modifying original
    const clonedChart = chartElement.cloneNode(true) as HTMLElement
    wrapper.appendChild(clonedChart)

    return wrapper
  }

  // Private helper methods

  private static calculateLogoPosition(
    position: string,
    logoSize: { width: number; height: number },
    chartDimensions: { width: number; height: number }
  ): { top: number; left: number } {
    const padding = 10 // Padding from edges
    
    switch (position) {
      case 'top-left':
        return { top: padding, left: padding }
      
      case 'top-right':
        return { 
          top: padding, 
          left: chartDimensions.width - logoSize.width - padding 
        }
      
      case 'bottom-left':
        return { 
          top: chartDimensions.height - logoSize.height - padding, 
          left: padding 
        }
      
      case 'bottom-right':
        return { 
          top: chartDimensions.height - logoSize.height - padding,
          left: chartDimensions.width - logoSize.width - padding 
        }
      
      case 'center':
        return { 
          top: (chartDimensions.height - logoSize.height) / 2,
          left: (chartDimensions.width - logoSize.width) / 2 
        }
      
      default:
        return { top: padding, left: padding }
    }
  }

  private static applyBackgroundColor(element: Element, backgroundColor: string): void {
    // Apply to the main container
    const container = element.closest('.chart-container, .bar-chart-container, .line-chart-container')
    if (container) {
      (container as HTMLElement).style.backgroundColor = backgroundColor
    }

    // Apply to SVG background if present
    const svg = element.querySelector('svg')
    if (svg) {
      svg.style.backgroundColor = backgroundColor
    }
  }

  private static applyDataSeriesColors(element: Element, colors: CustomerBranding['colors']): void {
    // Apply primary color to data series
    const dataElements = element.querySelectorAll('.bar, .line, .area, .slice, [fill]')
    const colorPalette = [colors.primary, colors.secondary]
    
    dataElements.forEach((dataElement, index) => {
      const htmlElement = dataElement as HTMLElement | SVGElement
      const color = colorPalette[index % colorPalette.length]
      
      if (htmlElement instanceof SVGElement) {
        // For SVG elements
        if (dataElement.hasAttribute('fill')) {
          dataElement.setAttribute('fill', color)
        }
        if (dataElement.hasAttribute('stroke')) {
          dataElement.setAttribute('stroke', color)
        }
      } else {
        // For HTML elements
        htmlElement.style.backgroundColor = color
        htmlElement.style.borderColor = color
      }
    })
  }

  private static validateAndAdjustColors(element: Element, colors: CustomerBranding['colors']): void {
    // Check contrast ratios and adjust if necessary
    const primaryContrast = this.validateColorContrast({
      primaryColor: colors.primary,
      backgroundColor: colors.background,
      minimumRatio: 4.5 // WCAG AA standard
    })

    const secondaryContrast = this.validateColorContrast({
      primaryColor: colors.secondary,
      backgroundColor: colors.background,
      minimumRatio: 4.5
    })

    // If contrast is insufficient, darken or lighten colors
    if (!primaryContrast) {
      const adjustedPrimary = this.adjustColorContrast(colors.primary, colors.background)
      this.updateElementColors(element, colors.primary, adjustedPrimary)
    }

    if (!secondaryContrast) {
      const adjustedSecondary = this.adjustColorContrast(colors.secondary, colors.background)
      this.updateElementColors(element, colors.secondary, adjustedSecondary)
    }
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private static calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(channel => {
      const c = channel / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private static calculateContrastRatio(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ): number {
    const lum1 = this.calculateLuminance(color1)
    const lum2 = this.calculateLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  private static adjustColorContrast(color: string, background: string): string {
    // Simple adjustment - in production would use more sophisticated algorithm
    const colorRGB = this.hexToRgb(color)
    const backgroundRGB = this.hexToRgb(background)
    
    if (!colorRGB || !backgroundRGB) return color

    const backgroundLuminance = this.calculateLuminance(backgroundRGB)
    
    // If background is light, darken the color; if dark, lighten it
    const adjustment = backgroundLuminance > 0.5 ? -40 : 40
    
    const adjustedColor = {
      r: Math.max(0, Math.min(255, colorRGB.r + adjustment)),
      g: Math.max(0, Math.min(255, colorRGB.g + adjustment)),
      b: Math.max(0, Math.min(255, colorRGB.b + adjustment))
    }

    return `#${adjustedColor.r.toString(16).padStart(2, '0')}${adjustedColor.g.toString(16).padStart(2, '0')}${adjustedColor.b.toString(16).padStart(2, '0')}`
  }

  private static updateElementColors(element: Element, oldColor: string, newColor: string): void {
    const elementsWithColor = element.querySelectorAll(`[fill="${oldColor}"], [stroke="${oldColor}"]`)
    
    elementsWithColor.forEach((el) => {
      if (el.getAttribute('fill') === oldColor) {
        el.setAttribute('fill', newColor)
      }
      if (el.getAttribute('stroke') === oldColor) {
        el.setAttribute('stroke', newColor)
      }
    })

    // Also update CSS styles
    const styledElements = element.querySelectorAll('*')
    styledElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.style.backgroundColor === oldColor) {
        htmlEl.style.backgroundColor = newColor
      }
      if (htmlEl.style.borderColor === oldColor) {
        htmlEl.style.borderColor = newColor
      }
      if (htmlEl.style.color === oldColor) {
        htmlEl.style.color = newColor
      }
    })
  }

  /**
   * Clear branding cache
   */
  static clearCache(): void {
    this.brandingCache.clear()
  }

  /**
   * Get cached branding element
   */
  static getCachedBranding(key: string): any {
    return this.brandingCache.get(key)
  }
}