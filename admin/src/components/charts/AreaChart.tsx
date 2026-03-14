import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export interface SimpleAreaChartProps {
  /** Chart data */
  data: Array<Record<string, unknown>>
  /** Data key for area */
  dataKey: string
  /** Area color */
  color?: string
  /** Gradient fill */
  gradient?: boolean
  /** Chart height */
  height?: number
  /** Additional className */
  className?: string
  /** Chart title */
  title?: string
  /** Loading state */
  loading?: boolean
}

/**
 * Simple Area Chart Component
 * Displays cumulative trends with filled area
 */
export const SimpleAreaChart: React.FC<SimpleAreaChartProps> = ({
  data,
  dataKey,
  color = '#3b82f6',
  gradient = true,
  height = 300,
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          {gradient && (
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fillOpacity={1}
            fill={gradient ? `url(#gradient-${dataKey})` : color}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SimpleAreaChart
