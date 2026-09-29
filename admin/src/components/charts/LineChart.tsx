import React from 'react'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export interface SimpleLineChartProps {
  /** Chart data */
  data: Array<Record<string, unknown>>
  /** Data key for X axis */
  dataKey: string
  /** Line color */
  color?: string
  /** Chart height */
  height?: number
  /** Show grid */
  showGrid?: boolean
  /** Show tooltip */
  showTooltip?: boolean
  /** Additional className */
  className?: string
  /** Chart title */
  title?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Simple Line Chart Component
 * Displays trend data over time
 */
export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  dataKey,
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showTooltip = true,
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
        <LineChart data={data}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          )}
          <XAxis
            dataKey={dataKey}
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
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SimpleLineChart
