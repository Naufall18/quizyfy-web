import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookMarked, Sparkles } from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { ExamCard } from '../../components/ExamCard'
import { Skeleton } from '../../components/ui/Skeleton'

/* Dashboard siswa sesuai Figma: search, banner promo + stat card, grid Ujian Aktif. */
export function SiswaDashboard() {
  const [exams, setExams] = useState<Exam[]>([])
  const [totalDikerjakan, setTotalDikerjakan] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [avail, riwayat] = await Promise.allSettled([siswaApi.exams(), siswaApi.riwayat()])
        if (!active) return
        if (avail.status === 'fulfilled') {
          const p = avail.value.data as Paginated<Exam>
          setExams(p.data ?? [])
        }
        if (riwayat.status === 'fulfilled') {
          const p = riwayat.value.data as Paginated<Exam>
          setTotalDikerjakan(p.total ?? 0)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const filtered = exams.filter((e) =>
    e.titles?.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative max-w-md">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Telusuri"
          className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Banner + stat (layout Figma: banner lebar kiri, kartu stat kanan) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary to-accent p-8 text-white lg:col-span-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles size={13} /> Aplikasi Ujian Digital
          </span>
          <h2 className="mt-3 max-w-md text-2xl font-extrabold leading-snug">
            Ujian Digital yang Praktis &amp; Terpercaya
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-white/80">
            Kerjakan ujian dari mana saja — nilai langsung keluar otomatis.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-warning-soft p-6">
          <div>
            <div className="text-4xl font-extrabold text-ink">
              {totalDikerjakan ?? '—'}
            </div>
            <div className="mt-1 font-bold text-ink">Total Ujian</div>
            <div className="text-sm text-muted">Yang dikerjakan anda</div>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-warning text-white">
            <BookMarked size={22} />
          </span>
        </div>
      </div>

      {/* Ujian Aktif */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink">Ujian Aktif</h2>
          <Link to="/siswa/ujian" className="text-sm font-semibold text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
            <BookMarked size={32} className="text-muted-soft" />
            <p className="mt-3 font-semibold text-ink">Belum ada ujian aktif</p>
            <p className="mt-1 text-sm text-muted">
              Minta kode ujian dari gurumu, lalu gabung lewat menu Daftar Ujian.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((e) => <ExamCard key={e.id} exam={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
