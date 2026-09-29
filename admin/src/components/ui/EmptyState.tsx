import React from 'react'
import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Action button */
  action?: React.ReactNode
  /** Additional className */
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      role="status"
      aria-label="Empty state"
    >
      {icon || (
        <div className="w-16 h-16 mb-4 text-gray-300">
          <Inbox className="w-full h-full" />
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
