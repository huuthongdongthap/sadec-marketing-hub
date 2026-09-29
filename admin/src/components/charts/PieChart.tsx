import React from 'react'
import { cn } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export interface SimplePieChartProps {
  /** Chart data */
  data: Array<{ name: string; value: number }>
  /** Pie colors */
  colors?: string[]
  /** Chart height */
  height?: number
  /** Show legend */
  showLegend?: boolean
  /** Inner radius for donut chart */
  innerRadius?: number
  /** Outer radius */
  outerRadius?: number
  /** Additional className */
  className?: string
  /** Chart title */
  title?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Simple Pie Chart Component
 * Displays proportion data
 */
export const SimplePieChart: React.FC<SimplePieChartProps> = ({
  data,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = '80%',
  className,
  title,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn('card animate-pulse', className)}>
        {title && <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>}
        <div className="h-[300px] w-full bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className={cn('card', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showLegend && <Legend />}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SimplePieChart
