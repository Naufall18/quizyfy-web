import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, FileQuestion, BarChart2, Calendar,
  Users, Trophy, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { guruApi } from '../../lib/api'
import type { Exam } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

interface ExamResult {
  id: number
  user: { id: number; name: string; email: string }
  score: number
  total_score: number
  correct_answers: number
  wrong_answers: number
  passed: boolean
  submitted_at: string
}

function InfoPill({
  icon: Icon,
  label,
  value,
  color = 'bg-primary-soft text-primary',
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5">
      <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', color)}>
        <Icon size={14} />
      </span>
      <span className="text-xs text-muted">{label}</span>
      <span className="ml-auto text-sm font-bold text-ink">{value}</span>
    </div>
  )
}

export function GuruDetailUjian() {
  const { id } = useParams<{ id: string }>()
  const [exam, setExam] = useState<Exam | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loadingExam, setLoadingExam] = useState(true)
  const [loadingResults, setLoadingResults] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!id) return
    guruApi.examDetail(Number(id))
      .then((res) => setExam(res.data?.data ?? res.data))
      .catch(() => toast.error('Gagal memuat detail ujian.'))
      .finally(() => setLoadingExam(false))

    guruApi.exams({ page: 1 })
      .then(() => {
        // Load hasil siswa via statistics endpoint
        return guruApi.examDetail(Number(id))
      })
      .catch(() => {})

    // Load hasil siswa
    const apiAny = guruApi as unknown as Record<string, (id: number) => Promise<{ data: unknown }>>
    if (typeof apiAny.examResults === 'function') {
      apiAny.examResults(Number(id))
        .then((res) => {
          const d = res.data as { data?: ExamResult[] } | ExamResult[]
          setResults(Array.isArray(d) ? d : (d as { data?: ExamResult[] }).data ?? [])
        })
        .catch(() => setResults([]))
        .finally(() => setLoadingResults(false))
    } else {
      setLoadingResults(false)
    }
  }, [id])

  async function handleToggle() {
    if (!exam || !id) return
    setToggling(true)
    try {
      await guruApi.toggleStatus(Number(id))
      setExam((prev) => prev ? {
        ...prev,
        status: prev.status === 'aktif' ? 'nonaktif' : 'aktif',
      } : prev)
      toast.success('Status ujian berhasil diubah')
    } catch {
      toast.error('Gagal mengubah status ujian.')
    } finally {
      setToggling(false)
    }
  }

  const passRate = results.length
    ? Math.round((results.filter((r) => r.passed).length / results.length) * 100)
    : 0

  const avgScore = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0

  if (loadingExam) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!exam) return (
    <div className="grid place-items-center py-20 text-center">
      <p className="font-semibold text-ink">Ujian tidak ditemukan</p>
      <Link to="/guru/ujian" className="mt-2 text-sm text-primary hover:underline">Kembali</Link>
    </div>
  )

  const STATUS_STYLE: Record<string, string> = {
    aktif: 'bg-success-soft text-success',
    nonaktif: 'bg-surface-alt text-muted',
    selesai: 'bg-primary-soft text-primary',
  }

  const startDate = exam.start_time
    ? new Date(exam.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/guru/ujian">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-ink">{exam.titles}</h1>
          <span className={cn(
            'mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
            STATUS_STYLE[exam.status] ?? 'bg-surface-alt text-muted',
          )}>
            {exam.status}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5',
            exam.status === 'aktif'
              ? 'border-warning/40 text-warning hover:bg-warning-soft'
              : 'border-success/40 text-success hover:bg-success-soft',
          )}
          onClick={handleToggle}
          disabled={toggling}
        >
          {exam.status === 'aktif'
            ? <><ToggleRight size={15} /> Nonaktifkan</>
            : <><ToggleLeft size={15} /> Aktifkan</>}
        </Button>
        <Link to={`/guru/ujian/${id}/edit`}>
          <Button size="sm" variant="outline">Edit</Button>
        </Link>
      </div>

      {/* Info Ujian */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-4">
        <h2 className="font-extrabold text-ink">Informasi Ujian</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoPill icon={Calendar} label="Tanggal" value={startDate} color="bg-warning-soft text-warning" />
          <InfoPill icon={Clock} label="Durasi" value={`${exam.duration_minutes} menit`} color="bg-accent-soft text-accent" />
          <InfoPill icon={FileQuestion} label="Jumlah Soal" value={`${exam.total_questions} soal`} color="bg-primary-soft text-primary" />
          {exam.kkm_score != null && (
            <InfoPill icon={BarChart2} label="Nilai KKM" value={String(exam.kkm_score)} color="bg-success-soft text-success" />
          )}
        </div>
        {exam.description && (
          <p className="text-sm text-muted leading-relaxed">{exam.description}</p>
        )}
      </div>

      {/* Statistik Ringkas */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <Users size={14} />
              <span className="text-xs font-semibold">Peserta</span>
            </div>
            <div className="text-2xl font-extrabold text-ink">{results.length}</div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <Trophy size={14} />
              <span className="text-xs font-semibold">Lulus</span>
            </div>
            <div className="text-2xl font-extrabold text-success">{passRate}%</div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
              <BarChart2 size={14} />
              <span className="text-xs font-semibold">Rata-rata</span>
            </div>
            <div className="text-2xl font-extrabold text-primary">{avgScore}</div>
          </div>
        </div>
      )}

      {/* Tabel Hasil Siswa */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <button
          onClick={() => setShowResults((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 hover:bg-surface-alt transition-colors"
        >
          <span className="font-extrabold text-ink">Hasil Siswa ({results.length})</span>
          {showResults ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
        </button>

        {showResults && (
          <div className="border-t border-line">
            {loadingResults ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted">
                <Users size={28} className="mx-auto mb-2 text-muted-soft" />
                <p className="text-sm">Belum ada siswa yang mengerjakan ujian ini.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Siswa</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Nilai</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Waktu Submit</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-t border-line hover:bg-surface-alt transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-ink">{r.user.name}</div>
                        <div className="text-xs text-muted">{r.user.email}</div>
                      </td>
                      <td className="px-5 py-3 font-bold text-ink">{r.score}</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-bold',
                          r.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                        )}>
                          {r.passed ? 'Lulus' : 'Tidak Lulus'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted text-xs">
                        {new Date(r.submitted_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
