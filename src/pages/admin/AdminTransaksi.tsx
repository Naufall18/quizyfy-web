import { useEffect, useState } from 'react'
import { History, Search, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'

interface Transaction {
  id: number
  user?: { name: string; email: string }
  package?: { name: string }
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'expired'
  created_at?: string
}

interface PaginatedTx {
  data: Transaction[]
  current_page: number
  last_page: number
  total: number
}

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  failed: 'bg-danger-soft text-danger',
  expired: 'bg-surface-alt text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  paid: 'Lunas',
  pending: 'Menunggu',
  failed: 'Gagal',
  expired: 'Kedaluwarsa',
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

export function AdminTransaksi() {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    adminApi
      .transactions({ page, status: statusFilter })
      .then((res) => {
        if (!active) return
        const d = res.data as PaginatedTx
        setTxs(d.data ?? [])
        setLastPage(d.last_page ?? 1)
        setTotal(d.total ?? 0)
      })
      .catch(() => { if (active) setTxs([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page, statusFilter])

  const filtered = query
    ? txs.filter((t) =>
        t.user?.name.toLowerCase().includes(query.toLowerCase()) ||
        t.user?.email.toLowerCase().includes(query.toLowerCase()),
      )
    : txs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Riwayat Transaksi</h1>
          <p className="mt-1 text-muted">{total} transaksi total</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-2">
          <TrendingUp size={16} className="text-success" />
          <span className="text-sm font-bold text-success">Lihat di Dashboard</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama pengguna..."
            className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {['', 'paid', 'pending', 'failed', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
              statusFilter === s
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface text-muted hover:border-primary/40 hover:text-ink',
            )}
          >
            {s === '' ? 'Semua' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-alt text-left">
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">ID</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Pengguna</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Paket</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Jumlah</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-line">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-24 rounded-lg" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-muted">
                  <History size={28} className="mx-auto mb-2 text-muted-soft" />
                  Tidak ada transaksi
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-line transition-colors hover:bg-surface-alt">
                  <td className="px-5 py-4 font-mono text-xs text-muted">#{t.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-ink">{t.user?.name ?? '—'}</div>
                    <div className="text-xs text-muted">{t.user?.email}</div>
                  </td>
                  <td className="px-5 py-4 text-muted">{t.package?.name ?? '—'}</td>
                  <td className="px-5 py-4 font-bold text-ink">{formatRupiah(t.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', STATUS_STYLE[t.status] ?? 'bg-surface-alt text-muted')}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <span className="text-sm text-muted">Halaman {page} dari {lastPage}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={15} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
