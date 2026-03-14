import React, { useState, createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabsProps {
  /** Default active tab value */
  defaultValue: string
  /** Callback when tab changes */
  onValueChange?: (value: string) => void
  /** Tab orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Additional className */
  className?: string
  children: ReactNode
}

export interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
  orientation: 'horizontal' | 'vertical'
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className,
  children
}) => {
  const [activeTab, setActiveTabState] = useState(defaultValue)

  const setActiveTab = (value: string) => {
    setActiveTabState(value)
    onValueChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div
        className={cn(
          orientation === 'vertical' ? 'flex gap-4' : 'w-full',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  const { orientation } = useTabs()

  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 p-1 bg-gray-100 rounded-lg',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  className,
  icon
}) => {
  const { activeTab, setActiveTab, orientation } = useTabs()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      onClick={() => setActiveTab(value)}
      disabled={disabled}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50',
        disabled && 'opacity-50 cursor-not-allowed',
        orientation === 'vertical' ? 'w-full justify-start' : 'flex-row',
        className
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className
}) => {
  const { activeTab } = useTabs()

  if (activeTab !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-4 focus:outline-none', className)}
    >
      {children}
    </div>
  )
}

export default Tabs
