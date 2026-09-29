import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders label and value correctly', () => {
    render(
      <StatCard
        label="Lượt xem"
        value="45,231"
      />
    )

    expect(screen.getByText('Lượt xem')).toBeInTheDocument()
    expect(screen.getByText('45,231')).toBeInTheDocument()
  })

  it('displays progress bar when progress prop is provided', () => {
    render(
      <StatCard
        label="Progress Test"
        value="100"
        progress={75}
      />
    )

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <StatCard
        label="Test"
        value="100"
        subtitle="Test subtitle"
      />
    )

    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('applies correct variant color', () => {
    const { container } = render(
      <StatCard
        label="Success"
        value="100"
        variant="success"
      />
    )

    expect(container.querySelector('.bg-success-50')).toBeInTheDocument()
  })
})
