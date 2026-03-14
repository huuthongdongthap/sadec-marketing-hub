import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export interface UseDarkModeOptions {
  /** Default theme */
  defaultValue?: Theme
  /** Storage key */
  storageKey?: string
  /** Enable system preference detection */
  detectSystem?: boolean
}

/**
 * Dark mode hook with localStorage persistence
 */
export function useDarkMode(options: UseDarkModeOptions = {}) {
  const {
    defaultValue = 'light',
    storageKey = 'theme',
    detectSystem = true
  } = options

  // Get initial theme from storage or system preference
  const getInitialTheme = (): Theme => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored) return stored

      // Fall back to system preference
      if (detectSystem && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return defaultValue
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Update document class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  // Listen for system preference changes
  useEffect(() => {
    if (!detectSystem) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Only update if no stored preference
      if (!localStorage.getItem(storageKey)) {
        setTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [detectSystem, storageKey])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  }
}

export default useDarkMode
