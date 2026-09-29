import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('does not show tooltip by default', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    )

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()
  })

  it('shows tooltip on mouse enter', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    await act(async () => {
      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('hides tooltip on mouse leave', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    // Show tooltip
    await act(async () => {
      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()

    // Hide tooltip
    await act(async () => {
      fireEvent.mouseLeave(trigger)
    })

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('respects delay prop', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    fireEvent.mouseEnter(trigger)

    // Should not show immediately
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    // After delay
    await act(async () => {
      await vi.advanceTimersByTime(500)
    })

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('does not show tooltip when disabled', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" disabled={true} delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    await act(async () => {
      fireEvent.mouseEnter(trigger)
    })

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders without content (returns only children)', () => {
    render(
      <Tooltip content={null}>
        <button>Only button</button>
      </Tooltip>
    )

    expect(screen.getByText('Only button')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('supports position prop', async () => {
    vi.useFakeTimers()

    const { container } = render(
      <Tooltip content="Tooltip content" position="bottom" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    await act(async () => {
      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTime(0)
    })

    const tooltip = container.querySelector('[role="tooltip"]')
    expect(tooltip).toHaveClass('top-full')

    vi.useRealTimers()
  })

  it('supports custom className', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" className="custom-tooltip" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')

    await act(async () => {
      fireEvent.mouseEnter(trigger)
      await vi.advanceTimersByTime(0)
    })

    const tooltip = screen.getByText('Tooltip content')
    expect(tooltip).toHaveClass('custom-tooltip')

    vi.useRealTimers()
  })

  it('shows tooltip on focus', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')

    await act(async () => {
      fireEvent.focus(trigger)
      await vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('Tooltip content')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('hides tooltip on blur', async () => {
    vi.useFakeTimers()

    render(
      <Tooltip content="Tooltip content" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')

    // Show on focus
    await act(async () => {
      fireEvent.focus(trigger)
      await vi.advanceTimersByTime(0)
    })

    // Hide on blur
    await act(async () => {
      fireEvent.blur(trigger)
    })

    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument()

    vi.useRealTimers()
  })
})
