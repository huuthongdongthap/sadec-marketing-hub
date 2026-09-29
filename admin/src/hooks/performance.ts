import { useEffect, useState, useCallback, useRef } from 'react'
import { logger } from '@/lib/logger'

/**
 * Debounce hook
 * Delays function execution
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverInit = {}
): [React.RefObject<T | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}

/**
 * Local Storage hook with cache
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  ttl: number = 3600000 // 1 hour default
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      const { value, timestamp } = parsed

      // Check if cached value is expired
      if (timestamp && Date.now() - timestamp > ttl) {
        localStorage.removeItem(key)
        return initialValue
      }

      return value
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value)
      localStorage.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now()
      }))
    } catch (error) {
      logger.error('Error saving to localStorage:', error)
    }
  }, [key])

  return [storedValue, setValue]
}

/**
 * Image lazy load hook
 */
export function useImageLazyLoad(src: string): boolean {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setHasError(true)

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return isLoaded && !hasError
}

export default { useDebounce, useIntersectionObserver, useLocalStorage, useImageLazyLoad }
