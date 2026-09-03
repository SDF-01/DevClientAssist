import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, variant?: Toast['variant']) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: Toast['variant'] = 'info') => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, message, variant }])
      window.setTimeout(() => dismissToast(id), 4000)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'min-w-[280px] rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-medium shadow-lift backdrop-blur-sm',
              toast.variant === 'success' && 'border-japa-sage/30 bg-surface-elevated text-japa-charcoal',
              toast.variant === 'error' && 'border-status-rejected/30 bg-surface-elevated text-status-rejected',
              toast.variant === 'info' && 'border-border bg-accent-primary text-japa-warm-white',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
