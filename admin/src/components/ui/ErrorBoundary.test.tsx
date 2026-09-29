import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

describe('ErrorBoundary', () => {
  const mockOnError = vi.fn()

  // Component that throws an error
  const BrokenComponent = () => {
    throw new Error('Something went wrong!')
  }

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Working content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Working content')).toBeInTheDocument()
  })

  it('renders error fallback when error occurs', () => {
    // Mock console.error to avoid polluting test output
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Error occurred</div>}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('renders default error UI when no fallback provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument()
    expect(screen.getByText('Thử lại')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('calls onError callback when error is caught', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary onError={mockOnError}>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(mockOnError).toHaveBeenCalled()
    const errorCall = mockOnError.mock.calls[0][0]
    expect(errorCall.message).toBe('Something went wrong!')

    vi.restoreAllMocks()
  })

  it('reloads page when retry button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window.location, 'reload').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    const retryButton = screen.getByText('Thử lại')
    fireEvent.click(retryButton)

    expect(window.location.reload).toHaveBeenCalled()

    vi.restoreAllMocks()
  })

  it('displays error message in default UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('renders custom fallback instead of default error UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary
        fallback={
          <div role="alert" className="custom-fallback">
            Custom error message
          </div>
        }
      >
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Đã xảy ra lỗi')).not.toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('continues to render children after error is reset by retry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(window.location, 'reload').mockImplementation(() => {})

    const { rerender } = render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    )

    // Initially works
    expect(screen.getByText('Content')).toBeInTheDocument()

    // Show error
    rerender(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument()

    // After retry (simulating reload)
    rerender(
      <ErrorBoundary>
        <div>Content after reload</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Content after reload')).toBeInTheDocument()

    vi.restoreAllMocks()
  })
})
