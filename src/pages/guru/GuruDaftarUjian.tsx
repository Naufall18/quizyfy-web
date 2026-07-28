import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ClipboardList, Clock, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { guruApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
const STATUS_STYLE: Record<string, string> = {
  aktif: 'bg-success-soft text-success',
  nonaktif: 'bg-surface-alt text-muted',
  selesai: 'bg-primary-soft text-primary',
}

function ExamRow({ exam }: { exam: Exam }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-ink">{exam.titles}</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
              STATUS_STYLE[exam.status] ?? 'bg-surface-alt text-muted',
            )}
          >
            {exam.status}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ClipboardList size={12} />
            {exam.total_questions} soal
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {exam.duration_minutes} menit
          </span>
          {exam.category && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {exam.category.name}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to={`/guru/ujian/${exam.id}`}>
          <Button variant="outline" size="sm">
            Detail
          </Button>
        </Link>        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => guruApi.toggleStatus(exam.id).catch(() => null)}
        >
          {exam.status === 'aktif' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          {exam.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        </Button>
      </div>
    </div>
  )
}

export function GuruDaftarUjian() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('semua')

  useEffect(() => {
    let active = true
    setLoading(true)
    guruApi
      .exams()
      .then((res) => {
        if (active) {
          const p = res.data as Paginated<Exam>
          setExams(p.data ?? [])
        }
      })
      .catch(() => {
        if (active) setExams([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = exams.filter((e) => {
    const matchQuery = e.titles.toLowerCase().includes(query.toLowerCase())
    const matchStatus = filterStatus === 'semua' || e.status === filterStatus
    return matchQuery && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Daftar Ujian</h1>
          <p className="mt-1 text-muted">Semua ujian yang telah kamu buat.</p>
        </div>
        <Link to="/guru/ujian/buat">
          <Button size="sm" className="gap-2">
            <Plus size={16} />
            Buat Ujian Baru
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ujian..."
            className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {['semua', 'aktif', 'nonaktif', 'selesai'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition-colors',
              filterStatus === s
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface text-muted hover:border-primary/40 hover:text-ink',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <ClipboardList size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">Belum ada ujian</p>
          <p className="mt-1 text-sm text-muted">Buat ujian pertamamu sekarang.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <ExamRow key={e.id} exam={e} />
          ))}
        </div>
      )}
    </div>
  )
}
