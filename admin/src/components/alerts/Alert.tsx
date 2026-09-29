import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export interface AlertProps {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error'
  /** Alert title */
  title?: string
  /** Alert message */
  children?: React.ReactNode
  /** Show icon */
  showIcon?: boolean
  /** Dismissible */
  dismissible?: boolean
  /** On dismiss callback */
  onDismiss?: () => void
  /** Additional className */
  className?: string
}

const variantStyles = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: AlertCircle
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertTriangle
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle
  }
}

/**
 * Alert Component
 * Displays contextual feedback messages
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  showIcon = true,
  dismissible = false,
  onDismiss,
  className
}) => {
  const style = variantStyles[variant]
  const Icon = style.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        style.bg,
        style.border,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <Icon className={cn('w-5 h-5 flex-shrink-0', style.text)} />
        )}

        <div className="flex-1">
          {title && (
            <h4 className={cn('font-semibold mb-1', style.text)}>{title}</h4>
          )}
          {children && (
            <div className={cn('text-sm', style.text)}>{children}</div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn('flex-shrink-0 hover:opacity-70', style.text)}
            aria-label="Dismiss alert"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
