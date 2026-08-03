import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

/**
 * Menghasilkan array nomor halaman + ellipsis ('...') untuk ditampilkan.
 * Selalu tampilkan halaman pertama, terakhir, dan 2 halaman di kiri/kanan halaman aktif.
 *
 * Contoh (page=5, total=10): [1, '...', 3, 4, 5, 6, 7, '...', 10]
 */
function buildPages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const delta = 2 // jumlah halaman di kiri & kanan halaman aktif
  const left = Math.max(2, page - delta)
  const right = Math.min(totalPages - 1, page + delta)

  const pages: (number | '...')[] = [1]

  if (left > 2) pages.push('...')

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (right < totalPages - 1) pages.push('...')

  pages.push(totalPages)

  return pages
}

/**
 * Pagination reusable — dipakai untuk navigasi halaman.
 *
 * Contoh:
 * ```tsx
 * <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
 * ```
 */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  const isPrevDisabled = page <= 1
  const isNextDisabled = page >= totalPages

  /** Style dasar yang dipakai semua tombol */
  const baseBtn = cn(
    'inline-flex items-center justify-center rounded-xl border font-semibold',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  )

  /** Style tombol nomor halaman (aktif vs tidak) */
  const pageBtn = (isActive: boolean) =>
    cn(
      baseBtn,
      'h-9 w-9 text-sm',
      isActive
        ? 'border-primary bg-primary text-white shadow-sm'
        : 'border-line-strong bg-surface text-muted hover:bg-surface-alt',
    )

  /** Style tombol Prev & Next */
  const navBtn = cn(baseBtn, 'h-9 px-3 gap-1 text-sm border-line-strong bg-surface text-muted hover:bg-surface-alt')

  return (
    <nav
      aria-label="Navigasi halaman"
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      {/* Prev */}
      <button
        className={navBtn}
        onClick={() => onChange(page - 1)}
        disabled={isPrevDisabled}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={15} />
        <span>Prev</span>
      </button>

      {/* Nomor halaman & ellipsis */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            className={pageBtn(p === page)}
            onClick={() => onChange(p)}
            aria-label={`Halaman ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        className={navBtn}
        onClick={() => onChange(page + 1)}
        disabled={isNextDisabled}
        aria-label="Halaman selanjutnya"
      >
        <span>Next</span>
        <ChevronRight size={15} />
      </button>
    </nav>
  )
}
