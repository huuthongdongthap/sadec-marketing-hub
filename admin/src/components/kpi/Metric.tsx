import React from 'react'
import { cn } from '@/lib/utils'

export interface MetricProps {
  /** Metric label */
  label: string
  /** Metric value */
  value: string | number
  /** Unit suffix */
  unit?: string
  /** Sparkline data points */
  sparkline?: number[]
  /** Additional className */
  className?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Metric Component
 * Displays a metric value with optional sparkline visualization
 */
export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  sparkline,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn('card animate-pulse', className)}>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
        <div className="mt-2 h-6 w-24 bg-gray-200 rounded"></div>
        {sparkline && (
          <div className="mt-4 h-8 w-full bg-gray-200 rounded"></div>
        )}
      </div>
    )
  }

  // Generate sparkline path
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null

    const width = 100
    const height = 32
    const max = Math.max(...sparkline)
    const min = Math.min(...sparkline)
    const range = max - min || 1

    const points = sparkline.map((val, i) => {
      const x = (i / (sparkline.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    }).join(' ')

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary-600"
          points={points}
        />
      </svg>
    )
  }

  return (
    <div className={cn('card', className)}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
      </p>

      {sparkline && (
        <div className="mt-3">
          {renderSparkline()}
        </div>
      )}
    </div>
  )
}

export default Metric
