import { useEffect } from 'react'

/**
 * Register Service Worker for caching
 */
export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated - refresh to get latest version')
      })
    }
  }, [])
}

export default useServiceWorker
