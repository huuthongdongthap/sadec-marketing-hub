import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Show percentage label */
  showLabel?: boolean
  /** Label position */
  labelPosition?: 'inside' | 'outside' | 'none'
  /** Striped animation */
  animated?: boolean
  /** Additional className */
  className?: string
  /** aria-label for accessibility */
  'aria-label'?: string
}

const variantColors = {
  primary: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600',
  info: 'bg-info-600'
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelPosition = 'outside',
  animated = false,
  className,
  'aria-label': ariaLabel
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || 'Progress'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantColors[variant],
            animated && 'relative overflow-hidden',
            animated && 'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full after:animate-shimmer'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabel && labelPosition === 'outside' && (
        <p className="mt-1 text-sm text-gray-600 text-right">
          {percentage.toFixed(0)}%
        </p>
      )}

      {showLabel && labelPosition === 'inside' && percentage > 15 && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar
