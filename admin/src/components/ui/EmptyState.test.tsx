import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { Mail } from 'lucide-react'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="Không có dữ liệu"
        description="Không tìm thấy kết quả nào"
      />
    )

    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
    expect(screen.getByText('Không tìm thấy kết quả nào')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    render(
      <EmptyState
        title="No emails"
        icon={<Mail data-testid="custom-icon" />}
      />
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders with default inbox icon when no icon provided', () => {
    render(<EmptyState title="Empty" />)
    // Default icon renders as inbox
    const iconContainer = document.querySelector('[class*="w-16 h-16"]')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Tạo mới</button>}
      />
    )

    expect(screen.getByText('Tạo mới')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <EmptyState
        title="Empty"
        className="custom-class"
      />
    )

    expect(screen.getByLabelText('Empty state')).toHaveClass('custom-class')
  })

  it('has correct accessibility attributes', () => {
    render(<EmptyState title="Empty state title" />)
    const state = screen.getByLabelText('Empty state')
    expect(state).toHaveAttribute('role', 'status')
  })
})
