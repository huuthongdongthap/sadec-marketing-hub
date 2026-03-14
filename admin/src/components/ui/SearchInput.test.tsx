import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  const mockOnChange = vi.fn()
  const mockOnClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder', () => {
    render(
      <SearchInput value="" onChange={mockOnChange} placeholder="Tìm kiếm..." />
    )

    const input = screen.getByPlaceholderText('Tìm kiếm...')
    expect(input).toBeInTheDocument()
  })

  it('displays search icon', () => {
    render(
      <SearchInput value="" onChange={mockOnChange} />
    )

    // Search icon should be present
    const searchIcon = document.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  it('calls onChange with debounced value', async () => {
    vi.useFakeTimers()

    render(
      <SearchInput value="" onChange={mockOnChange} debounceMs={300} />
    )

    const input = screen.getByPlaceholderText('Tìm kiếm...')

    fireEvent.change(input, { target: { value: 'test' } })

    // Should not call onChange immediately
    expect(mockOnChange).not.toHaveBeenCalled()

    // Fast-forward timers
    vi.advanceTimersByTime(300)

    expect(mockOnChange).toHaveBeenCalledWith('test')

    vi.useRealTimers()
  })

  it('shows clear button when value is present', () => {
    render(
      <SearchInput value="existing value" onChange={mockOnChange} />
    )

    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', () => {
    render(
      <SearchInput
        value="existing value"
        onChange={mockOnChange}
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('shows loading spinner when loading prop is true', () => {
    render(
      <SearchInput value="" onChange={mockOnChange} loading={true} />
    )

    // Loading spinner should be present
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('disables clear button when loading', () => {
    render(
      <SearchInput value="test" onChange={mockOnChange} loading={true} />
    )

    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    )

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })

  it('supports autoFocus', () => {
    render(
      <SearchInput value="" onChange={mockOnChange} autoFocus={true} />
    )

    const input = screen.getByPlaceholderText('Tìm kiếm...')
    expect(input).toHaveFocus()
  })
})
