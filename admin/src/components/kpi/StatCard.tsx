import React from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  /** Main statistic label */
  label: string
  /** Statistic value */
  value: string | number
  /** Subtitle or additional info */
  subtitle?: string
  /** Progress bar value (0-100) */
  progress?: number
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  /** Additional className */
  className?: string
  /** Loading state */
  loading?: boolean
}

const variantColors = {
  primary: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  danger: 'bg-danger-600'
}

const variantBgColors = {
  primary: 'bg-primary-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
  danger: 'bg-danger-50'
}

/**
 * Stat Card Component
 * Displays statistics with optional progress bar
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  progress,
  variant = 'primary',
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn('card animate-pulse', className)}>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="mt-2 h-6 w-24 bg-gray-200 rounded"></div>
        {progress !== undefined && (
          <div className="mt-4 h-2 w-full bg-gray-200 rounded"></div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('card', className)}>
      <div className={cn('inline-block px-3 py-1 rounded-full text-xs font-medium', variantBgColors[variant])}>
        {label}
      </div>

      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>

      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all', variantColors[variant])}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StatCard
