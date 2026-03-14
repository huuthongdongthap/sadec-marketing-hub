import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface KPICardProps {
  /** Title of the KPI */
  title: string
  /** Current value */
  value: string | number
  /** Previous value for comparison */
  previousValue?: string | number
  /** Percentage change */
  change?: number
  /** Icon component */
  icon?: React.ReactNode
  /** Additional className */
  className?: string
  /** Loading state */
  loading?: boolean
  /** Description text */
  description?: string
}

/**
 * KPI Card Component
 * Displays key performance indicators with trend indicators
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  change,
  icon,
  className,
  loading = false,
  description
}) => {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const trendColor = isPositive ? 'text-success-600' : isNegative ? 'text-danger-600' : 'text-gray-400'

  if (loading) {
    return (
      <div className={cn('card animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="mt-4 h-8 w-32 bg-gray-200 rounded"></div>
        <div className="mt-2 h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={cn('card hover:shadow-md transition-shadow', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>

        {(change !== undefined || previousValue) && (
          <div className="mt-2 flex items-center gap-2">
            <span className={cn('flex items-center text-sm font-medium', trendColor)}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {isPositive ? '+' : ''}{change?.toFixed(1)}%
            </span>
            {previousValue && (
              <span className="text-sm text-gray-500">
                so với {previousValue}
              </span>
            )}
          </div>
        )}

        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  )
}

export default KPICard
