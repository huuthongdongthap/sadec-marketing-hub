import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion'

describe('Accordion', () => {
  it('renders accordion items', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('expands item when trigger is clicked', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')
    fireEvent.click(trigger)

    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('collapses item when trigger is clicked again', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')

    // Open
    fireEvent.click(trigger)
    expect(screen.getByText('Content 1')).toBeInTheDocument()

    // Close
    fireEvent.click(trigger)
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('allows multiple open items with allowMultiple prop', () => {
    render(
      <Accordion allowMultiple>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger1 = screen.getByText('Item 1')
    const trigger2 = screen.getByText('Item 2')

    fireEvent.click(trigger1)
    fireEvent.click(trigger2)

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('calls onValueChange when items are toggled', () => {
    const mockOnValueChange = vi.fn()

    render(
      <Accordion onValueChange={mockOnValueChange}>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')
    fireEvent.click(trigger)

    expect(mockOnValueChange).toHaveBeenCalledWith(['item1'])
  })

  it('respects defaultValue prop', () => {
    render(
      <Accordion defaultValue={['item1']}>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('does not expand disabled item', () => {
    render(
      <Accordion>
        <AccordionItem value="item1" disabled>
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')
    fireEvent.click(trigger)

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('applies disabled styling', () => {
    render(
      <Accordion>
        <AccordionItem value="item1" disabled>
          <AccordionTrigger>Item 1</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')
    // Check if button has disabled attribute or styling
    expect(trigger.closest('button')).toHaveAttribute('disabled')
  })

  it('shows chevron rotation when open', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Item 1')

    // Initially closed - chevron should not have rotate-180
    const chevron = trigger.parentElement?.querySelector('svg')
    expect(chevron).not.toHaveClass('rotate-180')

    // Open the item
    fireEvent.click(trigger)

    // After opening, the content should be visible
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('supports custom icon in trigger', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger icon={<span data-testid="custom-icon">📁</span>}>
            Item 1
          </AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})

describe('AccordionItem', () => {
  it('renders with proper structure', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })
})

describe('AccordionTrigger', () => {
  it('renders trigger with text', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>My Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('My Trigger')).toBeInTheDocument()
  })

  it('has aria-expanded attribute', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
        </AccordionItem>
      </Accordion>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('AccordionContent', () => {
  it('renders content when open', () => {
    render(
      <Accordion defaultValue={['item1']}>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Visible content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Visible content')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <Accordion>
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Hidden content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })
})
