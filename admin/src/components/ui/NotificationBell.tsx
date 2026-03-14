/**
 * Notification Bell Component
 * Real-time notifications with badge count
 */
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Tooltip } from './Tooltip'

export interface NotificationBellProps {
  /** Notifications */
  notifications: Notification[]
  /** On notification click */
  onNotificationClick?: (notification: Notification) => void
  /** On mark all as read */
  onMarkAllRead?: () => void
  /** On clear all */
  onClearAll?: () => void
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: Date
  icon?: React.ReactNode
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length
  const hasNotifications = notifications.length > 0

  const getTypeStyles = (type: Notification['type']) => {
    const styles = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    }
    return styles[type]
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins}p trước`
    if (diffHours < 24) return `${diffHours}g trước`
    return `${diffDays}n trước`
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <Tooltip content="Thông báo" position="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative p-2 rounded-lg',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors duration-200'
          )}
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1',
                'min-w-[20px] h-5 px-1',
                'flex items-center justify-center',
                'text-xs font-bold text-white',
                'bg-red-500 rounded-full',
                'animate-scale-in'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            className={cn(
              'absolute right-0 mt-2 w-80 sm:w-96',
              'bg-white dark:bg-gray-800 rounded-xl shadow-lg',
              'border border-gray-200 dark:border-gray-700',
              'z-50 max-h-[60vh] flex flex-col',
              'animate-slide-in-down'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Thông báo
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                {hasNotifications && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {hasNotifications ? (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        onClick={() => {
                          onNotificationClick?.(notification)
                          setIsOpen(false)
                        }}
                        className={cn(
                          'w-full px-4 py-3 text-left',
                          'hover:bg-gray-50 dark:hover:bg-gray-700',
                          'transition-colors duration-150',
                          !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              'flex-shrink-0 w-2 h-2 mt-2 rounded-full',
                              getTypeStyles(notification.type)
                            )}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  !notification.read && 'text-gray-900 dark:text-gray-100',
                                  notification.read && 'text-gray-600 dark:text-gray-400'
                                )}
                              >
                                {notification.title}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="mt-1 text-xs text-gray-400">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Không có thông báo nào
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {hasNotifications && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
