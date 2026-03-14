import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Spinner variant */
  variant?: 'spinner' | 'dots' | 'pulse'
  /** Loading message */
  message?: string
  /** Full screen overlay */
  fullscreen?: boolean
  /** Additional className */
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullscreen = false,
  className
}) => {
  const spinnerClass = cn(sizeMap[size], 'text-primary-600')

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {variant === 'spinner' && (
        <div
          className={cn(
            'animate-spin rounded-full border-4 border-current border-t-transparent',
            spinnerClass
          )}
          role="status"
          aria-label="Loading"
        />
      )}

      {variant === 'pulse' && (
        <div
          className={cn(
            'animate-pulse rounded-full bg-primary-600',
            spinnerClass
          )}
          role="status"
          aria-label="Loading"
        />
      )}

      {variant === 'dots' && (
        <div className="flex gap-1" role="status" aria-label="Loading">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full bg-primary-600 animate-bounce',
                size === 'sm' && 'w-1.5 h-1.5',
                size === 'lg' && 'w-3 h-3',
                size === 'xl' && 'w-4 h-4'
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>
      )}

      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingSpinner
