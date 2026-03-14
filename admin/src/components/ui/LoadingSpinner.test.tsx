import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner variant by default', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders dots variant', () => {
    render(<LoadingSpinner variant="dots" />)
    const dots = screen.getByLabelText('Loading')
    expect(dots).toBeInTheDocument()
  })

  it('renders pulse variant', () => {
    render(<LoadingSpinner variant="pulse" />)
    const pulse = screen.getByRole('status')
    expect(pulse).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4 h-4')

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-12 h-12')
  })

  it('displays loading message when provided', () => {
    render(<LoadingSpinner message="Đang tải..." />)
    expect(screen.getByText('Đang tải...')).toBeInTheDocument()
  })

  it('renders fullscreen overlay when fullscreen prop is true', () => {
    render(<LoadingSpinner fullscreen />)
    expect(screen.getByRole('status').parentElement).toHaveClass('fixed inset-0')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    expect(screen.getByRole('status').parentElement).toHaveClass('custom-class')
  })
})
