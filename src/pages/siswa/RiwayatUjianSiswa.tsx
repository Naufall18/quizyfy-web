import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Trophy, XCircle, Clock, Search } from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Badge, examStatusVariant } from '../../components/ui/Badge'
import { cn } from '../../lib/cn'

interface ExamHistory extends Exam {
  score?: number
  passed?: boolean
  submitted_at?: string
}

const FILTER_OPTIONS = [
  { key: '', label: 'Semua' },
  { key: 'lulus', label: 'Lulus' },
  { key: 'tidak_lulus', label: 'Tidak Lulus' },
]

export function RiwayatUjianSiswa() {
  const [items, setItems] = useState<ExamHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    siswaApi.riwayat()
      .then((res) => {
        const d = res.data as Paginated<ExamHistory> | ExamHistory[]
        setItems(Array.isArray(d) ? d : (d as Paginated<ExamHistory>).data ?? [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((e) => {
    const matchQuery = e.titles?.toLowerCase().includes(query.toLowerCase())
    const matchStatus =
      filterStatus === '' ||
      (filterStatus === 'lulus' && e.passed === true) ||
      (filterStatus === 'tidak_lulus' && e.passed === false)
    return matchQuery && matchStatus
  })

  const lulusCount = items.filter((e) => e.passed === true).length
  const tidakLulusCount = items.filter((e) => e.passed === false).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Riwayat Ujian</h1>
          <p className="mt-1 text-muted">Semua ujian yang pernah kamu ikuti.</p>
        </div>
        {/* Mini stats */}
        <div className="flex gap-3">
          <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-2 text-center">
            <div className="text-xl font-extrabold text-success">{lulusCount}</div>
            <div className="text-xs font-semibold text-success/80">Lulus</div>
          </div>
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2 text-center">
            <div className="text-xl font-extrabold text-danger">{tidakLulusCount}</div>
            <div className="text-xs font-semibold text-danger/80">Tidak Lulus</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari riwayat ujian..."
            className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterStatus(opt.key)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
              filterStatus === opt.key
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface text-muted hover:border-primary/40 hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <History size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">
            {query || filterStatus ? 'Tidak ada hasil' : 'Belum ada riwayat ujian'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {query || filterStatus ? 'Coba ubah filter.' : 'Ujian yang sudah kamu kerjakan akan muncul di sini.'}
          </p>
          {!query && !filterStatus && (
            <Link to="/siswa/ujian" className="mt-3 text-sm font-semibold text-primary hover:underline">
              Lihat Daftar Ujian
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to={`/siswa/ujian/${e.id}/hasil`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* Ikon status */}
              <div className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                e.passed === true
                  ? 'bg-success-soft text-success'
                  : e.passed === false
                    ? 'bg-danger-soft text-danger'
                    : 'bg-primary-soft text-primary',
              )}>
                {e.passed === true
                  ? <Trophy size={20} />
                  : e.passed === false
                    ? <XCircle size={20} />
                    : <History size={20} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink truncate">{e.titles}</span>
                  <Badge variant={examStatusVariant(e.status)} size="sm">
                    {e.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {e.duration_minutes} menit
                  </span>
                  {e.submitted_at && (
                    <span>
                      {new Date(e.submitted_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              {e.score != null && (
                <div className="shrink-0 text-right">
                  <div className={cn(
                    'text-xl font-extrabold',
                    e.passed ? 'text-success' : 'text-danger',
                  )}>
                    {e.score}
                  </div>
                  <div className="text-xs text-muted">nilai</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

interface ExamHistory extends Exam {
  score?: number
  passed?: boolean
  submitted_at?: string
}

export function RiwayatUjianSiswa() {
  const [items, setItems] = useState<ExamHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    siswaApi.riwayat()
      .then((res) => {
        const d = res.data as Paginated<ExamHistory> | ExamHistory[]
        setItems(Array.isArray(d) ? d : (d as Paginated<ExamHistory>).data ?? [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((e) =>
    e.titles?.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Riwayat Ujian</h1>
          <p className="mt-1 text-muted">Semua ujian yang pernah kamu ikuti.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari riwayat ujian..."
          className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <History size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">
            {query ? 'Tidak ada hasil' : 'Belum ada riwayat ujian'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {query ? 'Coba kata kunci lain.' : 'Ujian yang sudah kamu kerjakan akan muncul di sini.'}
          </p>
          {!query && (
            <Link to="/siswa/ujian" className="mt-3 text-sm font-semibold text-primary hover:underline">
              Lihat Daftar Ujian
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Link
              key={e.id}
              to={`/siswa/ujian/${e.id}/hasil`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* Ikon status */}
              <div className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                e.passed === true
                  ? 'bg-success-soft text-success'
                  : e.passed === false
                    ? 'bg-danger-soft text-danger'
                    : 'bg-primary-soft text-primary',
              )}>
                {e.passed === true
                  ? <Trophy size={20} />
                  : e.passed === false
                    ? <XCircle size={20} />
                    : <History size={20} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink truncate">{e.titles}</span>
                  <Badge variant={examStatusVariant(e.status)} size="sm">
                    {e.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {e.duration_minutes} menit
                  </span>
                  {e.submitted_at && (
                    <span>
                      {new Date(e.submitted_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              {e.score != null && (
                <div className="shrink-0 text-right">
                  <div className={cn(
                    'text-xl font-extrabold',
                    e.passed ? 'text-success' : 'text-danger',
                  )}>
                    {e.score}
                  </div>
                  <div className="text-xs text-muted">nilai</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
