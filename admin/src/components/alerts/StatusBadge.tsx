import React from 'react'
import { cn } from '@/lib/utils'

export interface StatusBadgeProps {
  /** Status variant */
  variant?: 'active' | 'inactive' | 'pending' | 'warning' | 'error'
  /** Badge label */
  label?: string
  /** Show dot indicator */
  showDot?: boolean
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
}

const variantStyles = {
  active: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50',
    label: 'Hoạt động'
  },
  inactive: {
    dot: 'bg-gray-400',
    text: 'text-gray-700',
    bg: 'bg-gray-50',
    label: 'Không hoạt động'
  },
  pending: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    label: 'Chờ xử lý'
  },
  warning: {
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    label: 'Cảnh báo'
  },
  error: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    label: 'Lỗi'
  }
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
}

/**
 * Status Badge Component
 * Displays status indicators
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'inactive',
  label,
  showDot = true,
  size = 'md',
  className
}) => {
  const style = variantStyles[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        style.bg,
        style.text,
        sizeStyles[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('w-2 h-2 rounded-full', style.dot)} />
      )}
      {label || style.label}
    </span>
  )
}

export default StatusBadge
