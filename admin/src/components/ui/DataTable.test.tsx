import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from './DataTable'

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ]

  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'age', title: 'Age', sortable: true }
  ]

  it('renders data correctly', () => {
    render(<DataTable data={mockData} columns={columns} pagination={false} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Không có dữ liệu" />)

    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument()
  })

  it('handles sorting correctly', () => {
    render(<DataTable data={mockData} columns={columns} pagination={false} />)

    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    // Should sort ascending
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Bob Johnson')
    expect(rows[2]).toHaveTextContent('Jane Smith')
    expect(rows[3]).toHaveTextContent('John Doe')

    // Click again for descending
    fireEvent.click(nameHeader)
    const rowsDesc = screen.getAllByRole('row')
    expect(rowsDesc[1]).toHaveTextContent('John Doe')
    expect(rowsDesc[2]).toHaveTextContent('Jane Smith')
    expect(rowsDesc[3]).toHaveTextContent('Bob Johnson')
  })

  it('handles row selection', () => {
    const onSelectionChange = vi.fn()

    render(
      <DataTable
        data={mockData}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // Select first row

    expect(onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  it('handles select all', () => {
    const onSelectionChange = vi.fn()

    render(
      <DataTable
        data={mockData}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3'])
  })

  it('shows loading state', () => {
    render(<DataTable data={[]} columns={columns} loading />)

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('handles pagination', () => {
    const largeData = mockData.map((item, i) => ({
      ...item,
      id: `${i}`,
      name: `${item.name} ${i}`
    }))

    render(<DataTable data={largeData} columns={columns} pageSize={2} />)

    // Should show first page
    expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument()

    // Click next page
    const nextPageButton = screen.getByLabelText('Next page')
    fireEvent.click(nextPageButton)

    expect(screen.getByText('Trang 2 / 2')).toBeInTheDocument()
  })
})
