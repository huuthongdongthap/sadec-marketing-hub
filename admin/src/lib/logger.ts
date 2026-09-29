/**
 * Logger utility for Sa Đéc Marketing Hub
 *
 * Provides environment-aware logging with consistent formatting.
 * In production, only errors are logged. In development, all logs are shown.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
}

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Creates a logger instance
 * @param prefix - Optional prefix for log messages (e.g., component name)
 */
export function createLogger(prefix?: string): Logger {
  const formatMessage = (message: string): string => {
    if (!prefix) return message
    return `[${prefix}] ${message}`
  }

  return {
    /**
     * Debug logging - only shown in development
     */
    debug: (message: string, ...args: unknown[]) => {
      if (isDevelopment) {
        console.debug(formatMessage(message), ...args)
      }
    },

    /**
     * Info logging - only shown in development
     */
    info: (message: string, ...args: unknown[]) => {
      if (isDevelopment) {
        console.info(formatMessage(message), ...args)
      }
    },

    /**
     * Warning logging - always shown
     */
    warn: (message: string, ...args: unknown[]) => {
      console.warn(formatMessage(message), ...args)
    },

    /**
     * Error logging - always shown
     */
    error: (message: string, ...args: unknown[]) => {
      console.error(formatMessage(message), ...args)
    }
  }
}

/**
 * Default logger instance for general use
 */
export const logger = createLogger()

/**
 * Error handler utility that logs errors and optionally sends to monitoring service
 */
export function handleError(
  error: Error,
  context: {
    component?: string
    action?: string
    metadata?: Record<string, unknown>
  } = {}
): void {
  const log = createLogger(context.component)

  log.error(
    `Error${context.action ? ` during ${context.action}` : ''}: ${error.message}`,
    {
      name: error.name,
      stack: error.stack,
      ...context.metadata
    }
  )
}

export default logger
