import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  /** Data array */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Row key accessor */
  rowKey?: keyof T | ((item: T) => string)
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Enable row selection */
  selectable?: boolean
  /** Selected row keys */
  selectedKeys?: string[]
  /** On selection change */
  onSelectionChange?: (keys: string[]) => void
  /** Enable pagination */
  pagination?: boolean
  /** Items per page */
  pageSize?: number
  /** Additional className */
  className?: string
  /** Enable CSV export */
  enableExport?: boolean
  /** Export filename */
  exportFilename?: string
  /** Custom export data transformer */
  exportTransformer?: (item: T) => Record<string, string | number>
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey = 'id',
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  pagination = true,
  pageSize = 10,
  className,
  enableExport = false,
  exportFilename = 'export',
  exportTransformer
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Get key from item
  const getKey = (item: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(item)
    }
    return String(item[rowKey])
  }

  // Export to CSV
  const exportToCsv = () => {
    // Get all data (not just paginated)
    const dataToExport = exportTransformer
      ? sortedData.map(exportTransformer)
      : sortedData.map(item => {
          const result: Record<string, string | number> = {}
          columns.forEach(col => {
            const value = item[col.key as keyof T]
            result[col.title] = typeof value === 'number' ? value : String(value ?? '')
          })
          return result
        })

    if (dataToExport.length === 0) return

    // Get headers
    const headers = Object.keys(dataToExport[0])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row =>
        headers.map(header => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '')
          const escaped = stringValue.replace(/"/g, '""')
          return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
            ? `"${escaped}"`
            : escaped
        }).join(',')
      )
    ].join('\n')

    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${exportFilename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T]
      const bValue = b[sortConfig.key as keyof T]

      if (aValue === bValue) return 0

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      return sortConfig.direction === 'asc' ? 1 : -1
    })

    return sorted
  }, [data, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, pagination, currentPage, pageSize])

  // Total pages
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      const allKeys = paginatedData.map(getKey)
      onSelectionChange(allKeys)
    } else {
      onSelectionChange([])
    }
  }

  // Handle select row
  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return

    const newSelected = selectedKeys.includes(key)
      ? selectedKeys.filter(k => k !== key)
      : [...selectedKeys, key]

    onSelectionChange(newSelected)
  }

  // Get sort icon
  const getSortIcon = (column: Column<T>) => {
    if (sortConfig?.key === column.key) {
      return sortConfig.direction === 'asc'
        ? ChevronUp
        : ChevronDown
    }
    return null
  }

  if (loading) {
    return (
      <div className={cn('border rounded-lg overflow-hidden', className)}>
        <div className="animate-pulse p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Export Button */}
      {enableExport && sortedData.length > 0 && (
        <div className="p-4 border-b bg-gray-50 flex justify-end">
          <button
            onClick={exportToCsv}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              {selectable && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedKeys.length === paginatedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => {
                const SortIcon = getSortIcon(column)
                return (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-gray-100',
                      column.headerClassName
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {SortIcon && (
                        <SortIcon className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const key = getKey(item)
                const isSelected = selectedKeys.includes(key)

                return (
                  <tr
                    key={key}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-primary-50'
                    )}
                  >
                    {selectable && (
                      <td className="w-12 p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={`${key}-${String(column.key)}`}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900',
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item, index)
                          : String(item[column.key as keyof T] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} của {sortedData.length} kết quả
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
