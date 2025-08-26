import { useState, useEffect, useCallback } from 'react'
import { KeyboardNavigationConfig } from '../types/accessibility'

export const useKeyboardNavigation = (config: KeyboardNavigationConfig = {
  enabled: true,
  keys: {
    previous: ['ArrowLeft', 'ArrowUp'],
    next: ['ArrowRight', 'ArrowDown'],
    select: ['Enter', ' '],
    escape: ['Escape']
  }
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [isActive, setIsActive] = useState<boolean>(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.enabled) return

    const { key } = event

    if (config.keys.previous.includes(key)) {
      event.preventDefault()
      setFocusedIndex(prev => Math.max(0, prev - 1))
    } else if (config.keys.next.includes(key)) {
      event.preventDefault()
      setFocusedIndex(prev => prev + 1)
    } else if (config.keys.select.includes(key)) {
      event.preventDefault()
      setIsActive(true)
    } else if (config.keys.escape.includes(key)) {
      event.preventDefault()
      setFocusedIndex(-1)
      setIsActive(false)
    }
  }, [config])

  useEffect(() => {
    if (!config.enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, config.enabled])

  return {
    focusedIndex,
    isActive,
    setFocusedIndex,
    setIsActive
  }
}

export default useKeyboardNavigation