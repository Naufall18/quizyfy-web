import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/cn'

// ─── Types ────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

// ─── Atom store sederhana (tanpa zustand/context) ─────────────
type Listener = (toasts: ToastMessage[]) => void
const listeners = new Set<Listener>()
let toasts: ToastMessage[] = []

function notify() {
  listeners.forEach((fn) => fn([...toasts]))
}

export const toast = {
  show(message: string, variant: ToastVariant = 'info', duration = 3500) {
    const id = crypto.randomUUID()
    toasts = [...toasts, { id, message, variant, duration }]
    notify()
    setTimeout(() => toast.dismiss(id), duration)
  },
  success: (msg: string, dur?: number) => toast.show(msg, 'success', dur),
  error:   (msg: string, dur?: number) => toast.show(msg, 'error', dur),
  warning: (msg: string, dur?: number) => toast.show(msg, 'warning', dur),
  info:    (msg: string, dur?: number) => toast.show(msg, 'info', dur),
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  },
}

// ─── Icon per varian ──────────────────────────────────────────
const ICON: Record<ToastVariant, React.ComponentType<{ size?: number; className?: string }>> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const STYLE: Record<ToastVariant, string> = {
  success: 'bg-success text-white',
  error:   'bg-danger text-white',
  warning: 'bg-warning text-white',
  info:    'bg-primary text-white',
}

// ─── Item ─────────────────────────────────────────────────────
function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: string) => void
}) {
  const Icon = ICON[t.variant]
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg',
        STYLE[t.variant],
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
      <button
        onClick={() => onDismiss(t.id)}
        aria-label="Tutup notifikasi"
        className="mt-0.5 shrink-0 opacity-75 transition-opacity hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// ─── Container ────────────────────────────────────────────────
/**
 * Letakkan <Toaster /> sekali di root app (App.tsx / main.tsx).
 * Gunakan `toast.success(...)`, `toast.error(...)`, dll dari mana saja.
 */
export function Toaster() {
  const [items, setItems] = useState<ToastMessage[]>([])

  const onDismiss = useCallback((id: string) => toast.dismiss(id), [])

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  if (!items.length) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-2"
    >
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
