import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>
  }

  it('renders when open', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('does not call onClose on backdrop click when closeOnBackdrop is false', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdrop={false} />)

    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders with description', () => {
    render(
      <Modal
        {...defaultProps}
        description="This is a test description"
      />
    )

    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(
      <Modal
        {...defaultProps}
        footer={<button>Save Changes</button>}
      />
    )

    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm')

    rerender(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg')

    rerender(<Modal {...defaultProps} size="xl" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-xl')

    rerender(<Modal {...defaultProps} size="full" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-[95vw]')
  })
})
