import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'primary' | 'accent' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const VARIANT_STYLE: Record<BadgeVariant, string> = {
  success: 'bg-success-soft text-success',
  danger:  'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  primary: 'bg-primary-soft text-primary',
  accent:  'bg-accent-soft text-accent',
  neutral: 'bg-surface-alt text-muted',
}

const SIZE_STYLE = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
}

/**
 * Badge reusable — dipakai untuk status, label, chip.
 * Contoh: <Badge variant="success">Aktif</Badge>
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold capitalize leading-none',
        VARIANT_STYLE[variant],
        SIZE_STYLE[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/** Helper: konversi status ujian ke variant Badge */
export function examStatusVariant(status: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case 'aktif': return 'success'
    case 'berlangsung': return 'warning'
    case 'selesai': return 'primary'
    case 'nonaktif': return 'neutral'
    default: return 'neutral'
  }
}
