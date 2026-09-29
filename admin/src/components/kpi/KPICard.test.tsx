import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders title and value correctly', () => {
    render(
      <KPICard
        title="Doanh thu"
        value="₫128,500,000"
      />
    )

    expect(screen.getByText('Doanh thu')).toBeInTheDocument()
    expect(screen.getByText('₫128,500,000')).toBeInTheDocument()
  })

  it('displays change percentage with trend icon', () => {
    render(
      <KPICard
        title="Test KPI"
        value="100"
        change={25.5}
      />
    )

    expect(screen.getByText('+25.5%')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <KPICard
        title="Loading"
        value="100"
        loading
      />
    )

    const card = document.querySelector('.card.animate-pulse')
    expect(card).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <KPICard
        title="Test"
        value="100"
        description="Test description"
      />
    )

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
