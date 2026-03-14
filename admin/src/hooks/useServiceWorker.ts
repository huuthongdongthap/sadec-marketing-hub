import { useEffect } from 'react'
import { Logger } from '../utils/logger'

/**
 * Register Service Worker for caching
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          Logger.debug('Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          Logger.error('Service Worker registration failed:', error)
        })

      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        Logger.info('Service Worker updated - refresh to get latest version')
      })
    }
  }, [])
}

export default useServiceWorker
