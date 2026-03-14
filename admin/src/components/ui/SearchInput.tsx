import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useTimeoutCleanup, useDebouncedCallback } from '@/hooks/useDebounce'

export interface SearchInputProps {
  /** Current value */
  value: string
  /** On change handler */
  onChange: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in ms */
  debounceMs?: number
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
  /** On clear handler */
  onClear?: () => void
  /** Auto focus */
  autoFocus?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  loading = false,
  className,
  onClear,
  autoFocus = false
}) => {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useTimeoutCleanup()

  // Sync with controlled value
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Use debounced callback
  const debouncedOnChange = useDebouncedCallback(onChange, debounceMs)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }, [debouncedOnChange])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
    onClear?.()
  }, [onChange, onClear])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full pl-10 pr-10 py-2',
          'border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200',
          loading && 'opacity-75'
        )}
      />

      {(localValue || loading) && (
        <button
          onClick={handleClear}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Clear search"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <X className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}
    </div>
  )
}

export default SearchInput
