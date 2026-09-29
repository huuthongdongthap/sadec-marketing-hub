import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTimeoutCleanup } from '@/hooks/useDebounce'

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode
  /** Child element */
  children: React.ReactNode
  /** Position */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Delay before showing */
  delay?: number
  /** Additional className */
  className?: string
  /** Disable tooltip */
  disabled?: boolean
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useTimeoutCleanup()
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  if (!content) return children

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2',
            'text-sm font-medium text-white',
            'bg-gray-900 rounded-md shadow-lg',
            'whitespace-nowrap',
            'animate-fade-in',
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}

          {/* Arrow */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              position === 'top' && 'left-1/2 -translate-x-1/2 bottom-0 -translate-y-1/2',
              position === 'bottom' && 'left-1/2 -translate-x-1/2 top-0 -translate-y-1/2',
              position === 'left' && 'top-1/2 -translate-y-1/2 right-0 -translate-x-1/2',
              position === 'right' && 'top-1/2 -translate-y-1/2 left-0 -translate-x-1/2'
            )}
          />
        </div>
      )}
    </div>
  )
}

export default Tooltip
