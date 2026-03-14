import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SimpleLineChart } from './LineChart'

const mockData = [
  { name: 'T1', value: 4000 },
  { name: 'T2', value: 3000 }
]

describe('SimpleLineChart', () => {
  it('renders title when provided', () => {
    render(
      <SimpleLineChart
        title="Revenue Chart"
        data={mockData}
        dataKey="name"
      />
    )

    expect(screen.getByText('Revenue Chart')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <SimpleLineChart
        data={mockData}
        dataKey="name"
        loading
      />
    )

    expect(screen.getByRole('presentation')).toHaveClass('animate-pulse')
  })

  it('renders chart when not loading', () => {
    render(
      <SimpleLineChart
        data={mockData}
        dataKey="name"
      />
    )

    expect(screen.queryByRole('presentation')).not.toHaveClass('animate-pulse')
  })
})
