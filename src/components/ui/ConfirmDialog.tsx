import { AlertTriangle, Trash2, type LucideIcon } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { cn } from '../../lib/cn'

type ConfirmVariant = 'danger' | 'warning' | 'default'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  loading?: boolean
}

const VARIANT_CONFIG: Record<ConfirmVariant, {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  confirmCls: string
}> = {
  danger: {
    icon: Trash2,
    iconColor: 'text-danger',
    iconBg: 'bg-danger-soft',
    confirmCls: 'bg-danger hover:bg-danger/90 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    iconBg: 'bg-warning-soft',
    confirmCls: 'bg-warning hover:bg-warning/90 text-white',
  },
  default: {
    icon: AlertTriangle,
    iconColor: 'text-primary',
    iconBg: 'bg-primary-soft',
    confirmCls: 'bg-primary hover:bg-primary/90 text-white',
  },
}

/**
 * ConfirmDialog — modal konfirmasi aksi destruktif.
 * Contoh:
 *   <ConfirmDialog
 *     open={show}
 *     onClose={() => setShow(false)}
 *     onConfirm={handleDelete}
 *     title="Hapus Soal?"
 *     description="Soal ini akan dihapus permanen."
 *     variant="danger"
 *   />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const cfg = VARIANT_CONFIG[variant]
  const Icon = cfg.icon

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={cn(
          'mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full',
          cfg.iconBg,
        )}>
          <Icon size={24} className={cfg.iconColor} />
        </div>
        <h3 className="text-base font-extrabold text-ink">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50',
              cfg.confirmCls,
            )}
          >
            {loading ? 'Memproses…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
