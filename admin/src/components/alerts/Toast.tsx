import React, { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react'

export interface Toast {
  id: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

export interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const toastIcons = {
  info: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
}

const toastColors = {
  info: 'bg-white border-blue-200 shadow-blue-100',
  success: 'bg-white border-green-200 shadow-green-100',
  warning: 'bg-white border-yellow-200 shadow-yellow-100',
  error: 'bg-white border-red-200 shadow-red-100'
}

const toastIconColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
}

/**
 * Toast Container Component
 * Renders toast notifications portal
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss
}) => {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    document.body
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { id, message, type = 'info', duration = 5000 } = toast

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  const Icon = toastIcons[type]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-slide-in-right',
        toastColors[type]
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', toastIconColors[type])} />

      <p className="text-sm text-gray-700 flex-1">{message}</p>

      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * useToast Hook
 * Manages toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = useCallback((
    message: string,
    type?: Toast['type'],
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = {
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration)
  }

  return {
    toasts,
    addToast,
    dismissToast,
    toast,
    ToastContainer: () => (
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    )
  }
}

export default ToastContainer
