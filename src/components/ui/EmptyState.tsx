import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * EmptyState — tampilkan saat data kosong.
 * Contoh:
 *   <EmptyState
 *     icon={<BookOpen size={32} />}
 *     title="Belum ada ujian"
 *     description="Buat ujian pertamamu sekarang."
 *     action={<Button>Buat Ujian</Button>}
 *   />
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center',
      className,
    )}>
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-surface-alt text-muted-soft">
          {icon}
        </div>
      )}
      <p className="text-base font-bold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  )
}
