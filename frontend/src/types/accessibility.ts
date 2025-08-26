export interface AccessibilityConfig {
  enabled: boolean
  ariaLabel?: string
  description?: string
  keyboardNavigation: boolean
  screenReaderSupport: boolean
  highContrast: boolean
}

export interface KeyboardNavigationConfig {
  enabled: boolean
  keys: {
    previous: string[]
    next: string[]
    select: string[]
    escape: string[]
  }
}

export interface ScreenReaderConfig {
  announceChanges: boolean
  provideSummary: boolean
  includeDataValues: boolean
  liveRegion: 'polite' | 'assertive' | 'off'
}

export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enabled: true,
  keyboardNavigation: true,
  screenReaderSupport: true,
  highContrast: false
}

export const DEFAULT_KEYBOARD_CONFIG: KeyboardNavigationConfig = {
  enabled: true,
  keys: {
    previous: ['ArrowLeft', 'ArrowUp'],
    next: ['ArrowRight', 'ArrowDown'],
    select: ['Enter', ' '],
    escape: ['Escape']
  }
}