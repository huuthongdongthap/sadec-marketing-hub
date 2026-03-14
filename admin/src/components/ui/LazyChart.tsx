import React, { lazy, Suspense, type ComponentType } from 'react'
import { cn } from '@/lib/utils'

export interface LazyChartProps {
  data?: Array<Record<string, unknown>>
  height?: number
  title?: string
  loading?: boolean
}

/**
 * Lazy Chart Wrapper Component
 * Lazy load chart components with code splitting
 */
export const LazyChartWrapper: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || (
      <div className="card animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-[300px] w-full bg-gray-200 rounded"></div>
      </div>
    )}>
      {children}
    </Suspense>
  )
}

/**
 * Create lazy chart component
 * Usage: const LazyLineChart = createLazyChart(() => import('./LineChart'))
 */
export function createLazyChart<T extends LazyChartProps>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) {
  return lazy(importFn)
}

/**
 * Image with lazy loading
 */
export const LazyImage: React.FC<{
  src: string
  alt: string
  className?: string
}> = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('loading:opacity-50', className)}
      loading="lazy"
      decoding="async"
    />
  )
}

export default LazyChartWrapper
