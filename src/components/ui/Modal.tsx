import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Tutup saat klik backdrop */
  closeOnBackdrop?: boolean
}

const SIZE_CLS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

/**
 * Modal reusable dengan backdrop blur.
 * Contoh:
 *   <Modal open={show} onClose={() => setShow(false)} title="Konfirmasi">
 *     <p>Yakin?</p>
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  // ESC key menutup modal
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full rounded-2xl bg-surface shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200',
          SIZE_CLS[size],
        )}
        role="dialog"
        aria-modal
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="modal-title" className="text-base font-extrabold text-ink">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Tutup"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
