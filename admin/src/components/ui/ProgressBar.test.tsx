import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders with basic props', () => {
    render(<ProgressBar value={50} />)

    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute('aria-valuenow', '50')
    expect(progressbar).toHaveAttribute('aria-valuemin', '0')
    expect(progressbar).toHaveAttribute('aria-valuemax', '100')
  })

  it('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar value={75} max={100} />)

    const innerBar = container.querySelector('.bg-primary-600')
    expect(innerBar).toHaveStyle('width: 75%')
  })

  it('respects max prop', () => {
    const { container } = render(<ProgressBar value={50} max={200} />)

    const innerBar = container.querySelector('.bg-primary-600')
    expect(innerBar).toHaveStyle('width: 25%')
  })

  it('clamps value to 0-100 range', () => {
    const { container: container1 } = render(<ProgressBar value={150} max={100} />)
    const innerBar1 = container1.querySelector('.bg-primary-600')
    expect(innerBar1).toHaveStyle('width: 100%')

    const { container: container2 } = render(<ProgressBar value={-10} max={100} />)
    const innerBar2 = container2.querySelector('.bg-primary-600')
    expect(innerBar2).toHaveStyle('width: 0%')
  })

  it('applies size classes', () => {
    const { container: containerSm } = render(<ProgressBar value={50} size="sm" />)
    expect(containerSm.querySelector('div[role="progressbar"]')).toHaveClass('h-1.5')

    const { container: containerMd } = render(<ProgressBar value={50} size="md" />)
    expect(containerMd.querySelector('div[role="progressbar"]')).toHaveClass('h-2.5')

    const { container: containerLg } = render(<ProgressBar value={50} size="lg" />)
    expect(containerLg.querySelector('div[role="progressbar"]')).toHaveClass('h-4')
  })

  it('applies variant colors', () => {
    const { container: containerPrimary } = render(<ProgressBar value={50} variant="primary" />)
    expect(containerPrimary.querySelector('.bg-primary-600')).toBeInTheDocument()

    const { container: containerSuccess } = render(<ProgressBar value={50} variant="success" />)
    expect(containerSuccess.querySelector('.bg-success-600')).toBeInTheDocument()

    const { container: containerWarning } = render(<ProgressBar value={50} variant="warning" />)
    expect(containerWarning.querySelector('.bg-warning-600')).toBeInTheDocument()

    const { container: containerDanger } = render(<ProgressBar value={50} variant="danger" />)
    expect(containerDanger.querySelector('.bg-danger-600')).toBeInTheDocument()

    const { container: containerInfo } = render(<ProgressBar value={50} variant="info" />)
    expect(containerInfo.querySelector('.bg-info-600')).toBeInTheDocument()
  })

  it('shows percentage label outside when showLabel and labelPosition="outside"', () => {
    render(<ProgressBar value={75} showLabel={true} labelPosition="outside" />)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('does not show label when showLabel is false', () => {
    render(<ProgressBar value={75} showLabel={false} />)

    expect(screen.queryByText('75%')).not.toBeInTheDocument()
  })

  it('shows label inside when percentage > 15 and labelPosition="inside"', () => {
    render(<ProgressBar value={75} showLabel={true} labelPosition="inside" />)

    // Label should be visible inside the bar
    const label = screen.getByText('75%')
    expect(label).toBeInTheDocument()
  })

  it('does not show inside label when percentage < 15', () => {
    render(<ProgressBar value={10} showLabel={true} labelPosition="inside" />)

    // Label might not be rendered when percentage is too small
    expect(screen.queryByText('10%')).not.toBeInTheDocument()
  })

  it('applies animated class when animated prop is true', () => {
    const { container } = render(<ProgressBar value={50} animated={true} />)

    const innerBar = container.querySelector('.after:animate-shimmer')
    expect(innerBar).toBeInTheDocument()
  })

  it('does not apply animated class when animated prop is false', () => {
    const { container } = render(<ProgressBar value={50} animated={false} />)

    const innerBar = container.querySelector('.after:animate-shimmer')
    expect(innerBar).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ProgressBar value={50} className="custom-progress" />
    )

    expect(container.firstChild).toHaveClass('custom-progress')
  })

  it('uses custom aria-label when provided', () => {
    render(<ProgressBar value={50} aria-label="Custom progress label" />)

    const progressbar = screen.getByLabelText('Custom progress label')
    expect(progressbar).toBeInTheDocument()
  })

  it('defaults to "Progress" aria-label when not provided', () => {
    render(<ProgressBar value={50} />)

    const progressbar = screen.getByLabelText('Progress')
    expect(progressbar).toBeInTheDocument()
  })
})
