/**
 * Skeleton Loading Components
 * Placeholder UI for loading states
 */
import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  animation?: 'pulse' | 'shine' | 'none'
  style?: React.CSSProperties
}

/**
 * Basic Skeleton Box
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animation = 'pulse'
}) => {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded',
        animation === 'pulse' && 'animate-pulse',
        animation === 'shine' && 'animate-shimmer',
        className
      )}
    />
  )
}

/**
 * Skeleton Text Line
 */
export const SkeletonText: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Skeleton
      className={cn('h-4 w-full', className)}
    />
  )
}

/**
 * Skeleton Title (wider and taller)
 */
export const SkeletonTitle: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Skeleton
      className={cn('h-6 w-32 mb-4', className)}
    />
  )
}

/**
 * Skeleton Avatar (circular)
 */
export const SkeletonAvatar: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Skeleton
      className={cn('rounded-full w-10 h-10', className)}
    />
  )
}

/**
 * Skeleton Card with title and content
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4',
        className
      )}
    >
      <SkeletonTitle className="mb-3" />
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  )
}

/**
 * Skeleton Table Row
 */
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton KPI Card
 */
export const SkeletonKPI: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

/**
 * Skeleton Chart
 */
export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 200 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <SkeletonTitle className="mb-4" />
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
    </div>
  )
}

export default {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonKPI,
  SkeletonChart
}
