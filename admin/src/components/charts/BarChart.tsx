import React from 'react'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type BarChartProps
} from 'recharts'

export interface SimpleBarChartProps {
  /** Chart data */
  data: Array<Record<string, unknown>>
  /** Data keys for bars */
  dataKeys: string[]
  /** Bar colors */
  colors?: string[]
  /** Chart height */
  height?: number
  /** Show grid */
  showGrid?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Additional className */
  className?: string
  /** Chart title */
  title?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Simple Bar Chart Component
 * Displays comparative data across categories
 */
export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  dataKeys,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
  title,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn('card animate-pulse', className)}>
        {title && <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>}
        <div className="h-[300px] w-full bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className={cn('card', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          {showLegend && <Legend />}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SimpleBarChart
