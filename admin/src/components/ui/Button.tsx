import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Button disabled */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Left icon */
  leftIcon?: ReactNode
  /** Right icon */
  rightIcon?: ReactNode
  /** Full width */
  fullWidth?: boolean
  /** Additional className */
  className?: string
  /** Children */
  children: ReactNode
}

const variantStyles = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
  secondary:
    'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus:ring-secondary-500',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  ghost:
    'text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus:ring-danger-500',
  success:
    'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus:ring-success-500'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-base rounded-lg gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2.5'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Hover lift effect
        !isDisabled && 'hover:-translate-y-0.5 active:translate-y-0',
        // Button shadow
        !isDisabled && variant !== 'ghost' && variant !== 'outline' && 'shadow-md hover:shadow-lg',
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        // Full width
        fullWidth && 'w-full',
        // Loading state
        loading && 'relative pointer-events-none',
        className
      )}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} />
        </span>
      )}

      {/* Content with visibility hidden when loading */}
      <span className={cn('flex items-center', loading && 'invisible')}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </button>
  )
}

export default Button
