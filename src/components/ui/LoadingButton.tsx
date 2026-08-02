import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const BASE = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed'

const VARIANT = {
  primary: 'bg-primary text-white hover:bg-primary-700 shadow-sm shadow-primary/20',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-alt',
  danger:  'bg-danger text-white hover:bg-danger/90',
}

const SIZE = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-11 px-6 text-base',
}

/**
 * LoadingButton — tombol dengan spinner saat loading.
 * Contoh:
 *   <LoadingButton loading={saving} loadingText="Menyimpan…">
 *     Simpan
 *   </LoadingButton>
 */
export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(BASE, VARIANT[variant], SIZE[size], className)}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
