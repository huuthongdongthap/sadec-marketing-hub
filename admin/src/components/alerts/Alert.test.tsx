import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

const mockOnDismiss = vi.fn()

describe('Alert', () => {
  it('renders children correctly', () => {
    render(
      <Alert variant="info">
        Test alert message
      </Alert>
    )

    expect(screen.getByText('Test alert message')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Alert
        variant="info"
        title="Alert Title"
      >
        Message
      </Alert>
    )

    expect(screen.getByText('Alert Title')).toBeInTheDocument()
  })

  it('renders dismiss button when dismissible', () => {
    const onDismiss = vi.fn()
    render(
      <Alert
        variant="info"
        dismissible
        onDismiss={onDismiss}
      >
        Message
      </Alert>
    )

    const dismissButton = screen.getByLabelText('Dismiss alert')
    expect(dismissButton).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    render(
      <Alert
        variant="info"
        dismissible
        onDismiss={mockOnDismiss}
      >
        Message
      </Alert>
    )

    const dismissButton = screen.getByLabelText('Dismiss alert')
    dismissButton.click()

    expect(mockOnDismiss).toHaveBeenCalled()
  })
})
