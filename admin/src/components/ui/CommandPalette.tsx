/**
 * Command Palette Component
 * Quick command search with keyboard shortcut (Ctrl/Cmd + K)
 */
import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Search, Command } from 'lucide-react'

export interface CommandPaletteProps {
  /** Open state */
  open: boolean
  /** On open change */
  onOpenChange: (open: boolean) => void
  /** Available commands */
  commands: CommandItem[]
  /** On command select */
  onSelect?: (command: CommandItem) => void
}

export interface CommandItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  category?: string
  action: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  commands,
  onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredCommands[selectedIndex]
      if (selected) {
        selected.action()
        onSelect?.(selected)
        onOpenChange(false)
        setSearchQuery('')
      }
    } else if (e.key === 'Escape') {
      onOpenChange(false)
      setSearchQuery('')
    }
  }, [filteredCommands, selectedIndex, onSelect, onOpenChange])

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open, onOpenChange])

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Command Palette */}
      <div
        className={cn(
          'relative w-full max-w-xl mx-4',
          'bg-white dark:bg-gray-800 rounded-xl shadow-2xl',
          'border border-gray-200 dark:border-gray-700',
          'overflow-hidden'
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Gõ lệnh hoặc tìm kiếm..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div
          className="max-h-96 overflow-y-auto py-2"
          onKeyDown={handleKeyDown}
        >
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Command className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Không tìm thấy lệnh nào</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action()
                  onSelect?.(cmd)
                  onOpenChange(false)
                  setSearchQuery('')
                }}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors duration-150',
                  index === selectedIndex && 'bg-gray-100 dark:bg-gray-700'
                )}
              >
                {cmd.icon && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {cmd.icon}
                  </span>
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {cmd.label}
                  </div>
                  {cmd.category && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {cmd.category}
                    </div>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
