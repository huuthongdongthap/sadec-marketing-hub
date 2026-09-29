import React, { useState, ReactNode, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface AccordionProps {
  /** Allow multiple items to be open at once */
  allowMultiple?: boolean
  /** Default open items */
  defaultValue?: string[]
  /** Callback when open items change */
  onValueChange?: (values: string[]) => void
  /** Additional className */
  className?: string
  children: ReactNode
}

export interface AccordionContextType {
  openItems: string[]
  toggleItem: (value: string) => void
  allowMultiple: boolean
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider')
  }
  return context
}

export const Accordion: React.FC<AccordionProps> = ({
  allowMultiple = false,
  defaultValue = [],
  onValueChange,
  className,
  children
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue)

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      const isOpen = prev.includes(value)
      let newOpenItems: string[]

      if (allowMultiple) {
        newOpenItems = isOpen
          ? prev.filter(item => item !== value)
          : [...prev, value]
      } else {
        newOpenItems = isOpen ? [] : [value]
      }

      onValueChange?.(newOpenItems)
      return newOpenItems
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  className,
  disabled = false
}) => {
  const { openItems, toggleItem } = useAccordion()
  const isOpen = openItems.includes(value)

  return (
    <div
      className={cn(
        'border border-gray-200 rounded-lg overflow-hidden',
        'bg-white hover:border-gray-300 transition-colors',
        disabled && 'opacity-50 bg-gray-50',
        className
      )}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            onToggle: () => !disabled && toggleItem(value),
            disabled
          })
        }
        return child
      })}
    </div>
  )
}

export interface AccordionTriggerProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
  // Injected by AccordionItem
  isOpen?: boolean
  onToggle?: () => void
  disabled?: boolean
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
  icon,
  isOpen = false,
  onToggle,
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-left',
        'hover:bg-gray-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
        disabled && 'cursor-not-allowed',
        className
      )}
      aria-expanded={isOpen}
    >
      <span className="font-medium text-gray-900 flex items-center gap-2">
        {icon && <span className="w-5 h-5 text-gray-500">{icon}</span>}
        {children}
      </span>
      <ChevronDown
        className={cn(
          'w-5 h-5 text-gray-500 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}

export interface AccordionContentProps {
  children: ReactNode
  className?: string
  // Injected by AccordionItem
  isOpen?: boolean
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
  isOpen = false
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className={cn(
        'px-4 pb-4 pt-0',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="text-gray-600">
        {children}
      </div>
    </div>
  )
}

export default Accordion
