import { useEffect } from 'react'
import { logger } from '../lib/logger'

/**
 * Register Service Worker for caching
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.debug('Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          logger.error('Service Worker registration failed:', error)
        })

      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('Service Worker updated - refresh to get latest version')
      })
    }
  }, [])
}

export default useServiceWorker
