import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface SelectProps {
  /** Selected value */
  value?: string
  /** Default selected value (uncontrolled) */
  defaultValue?: string
  /** Options to select from */
  options: SelectOption[]
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Additional className */
  className?: string
  /** Label for the select */
  label?: string
  /** Error message */
  error?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

export const Select: React.FC<SelectProps> = ({
  value,
  defaultValue,
  options,
  placeholder = 'Chọn...',
  disabled = false,
  onChange,
  className,
  label,
  error,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    value ?? defaultValue
  )
  const selectRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selected value when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleSelect = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue)
    if (option?.disabled) return

    setSelectedValue(optionValue)
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(opt => opt.value === selectedValue)
  const displayValue = selectedOption?.label ?? placeholder

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between gap-2 border rounded-lg',
            'bg-white hover:bg-gray-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            sizeClasses[size],
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            error ? 'border-red-500' : 'border-gray-300'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={cn(!selectedOption && 'text-gray-400')}>
            {displayValue}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className={cn(
              'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
              'max-h-60 overflow-auto',
              'animate-in fade-in zoom-in-95 duration-100'
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left',
                  'hover:bg-gray-100 transition-colors',
                  option.value === selectedValue && 'bg-primary-50 text-primary-700',
                  option.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                )}
              >
                {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {option.value === selectedValue && (
                  <Check className="w-4 h-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Select
