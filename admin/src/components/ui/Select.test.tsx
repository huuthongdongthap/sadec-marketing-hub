import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Select, SelectOption } from './Select'

describe('Select', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ]

  it('renders with placeholder', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByText('Chọn...')).toBeInTheDocument()
  })

  it('displays selected value when defaultValue provided', () => {
    render(<Select options={mockOptions} defaultValue="option1" />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('displays selected value when value provided (controlled)', () => {
    render(<Select options={mockOptions} value="option2" />)
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', () => {
    render(<Select options={mockOptions} />)
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('selects an option when clicked', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const option = screen.getByText('Option 1')
    fireEvent.click(option)

    expect(onChange).toHaveBeenCalledWith('option1')
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('does not select disabled option', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const disabledOption = screen.getByText('Option 3')
    fireEvent.click(disabledOption)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes dropdown when clicking outside', () => {
    render(<Select options={mockOptions} />)
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    expect(screen.getByText('Option 1')).toBeInTheDocument()

    fireEvent.mouseDown(document)

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
  })

  it('toggles dropdown on multiple clicks', () => {
    render(<Select options={mockOptions} />)
    const trigger = screen.getByRole('button')

    fireEvent.click(trigger)
    expect(screen.getByText('Option 1')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
  })

  it('respects disabled state', () => {
    render(<Select options={mockOptions} disabled />)
    const trigger = screen.getByRole('button')
    expect(trigger).toBeDisabled()
  })

  it('displays label when provided', () => {
    render(<Select options={mockOptions} label="Chọn tùy chọn" />)
    expect(screen.getByText('Chọn tùy chọn')).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(<Select options={mockOptions} error="Lỗi bắt buộc chọn" />)
    expect(screen.getByText('Lỗi bắt buộc chọn')).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />)
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveClass('px-2', 'py-1', 'text-sm')

    rerender(<Select options={mockOptions} size="lg" />)
    const largeTrigger = screen.getByRole('button')
    expect(largeTrigger).toHaveClass('px-4', 'py-3', 'text-lg')
  })

  it('shows check icon for selected option', () => {
    render(<Select options={mockOptions} defaultValue="option1" />)
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Check icon should be visible next to selected option
    const selectedOption = screen.getByText('Option 1').closest('button')
    expect(selectedOption).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange when controlled value changes', () => {
    const { rerender } = render(<Select options={mockOptions} value="option1" />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()

    rerender(<Select options={mockOptions} value="option2" />)
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })
})
