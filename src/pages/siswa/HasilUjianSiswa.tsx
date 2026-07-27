import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, BarChart2, Clock, Trophy, ArrowLeft } from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { ExamResult } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl p-4', color)}>
      <Icon size={20} className="shrink-0" />
      <div>
        <div className="text-xl font-extrabold">{value}</div>
        <div className="text-xs font-medium opacity-75">{label}</div>
      </div>
    </div>
  )
}

export function HasilUjianSiswa() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    siswaApi.examResult(Number(id))
      .then((res) => setResult(res.data?.data ?? res.data))
      .catch(() => toast.error('Gagal memuat hasil ujian.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <p className="font-semibold text-ink">Hasil ujian tidak ditemukan</p>
        <Link to="/siswa/ujian" className="mt-2 text-sm text-primary hover:underline">
          Kembali ke daftar ujian
        </Link>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.total_score) * 100)
  const passed = result.passed

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/siswa/ujian">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <h1 className="text-xl font-extrabold text-ink">Detail Nilai</h1>
      </div>

      {/* Kartu skor utama */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-ink">{result.exam_title}</h2>

        {/* Persentase nilai */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-muted">Presentase Nilai</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-extrabold text-ink">{result.score}</span>
            <span className="mb-1.5 text-lg text-muted">/{result.total_score}</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                passed ? 'bg-success' : 'bg-danger',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Badge lulus/tidak */}
          <div className="mt-3 flex items-center gap-2">
            {passed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
                <Trophy size={13} />
                Lulus
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-sm font-bold text-danger">
                <XCircle size={13} />
                Tidak Lulus
              </span>
            )}
            {result.kkm_score != null && (
              <span className="text-sm text-muted">KKM: {result.kkm_score}</span>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Nama</span>
            <span className="font-medium text-ink">—</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tanggal Ujian</span>
            <span className="font-medium text-ink">
              {result.submitted_at
                ? new Date(result.submitted_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Durasi Pengerjaan</span>
            <span className="font-medium text-ink">{result.duration_minutes} menit</span>
          </div>
        </div>
      </div>

      {/* Statistik soal */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Jumlah Soal Benar"
          value={result.correct_answers}
          color="bg-success-soft text-success"
        />
        <StatCard
          icon={XCircle}
          label="Jumlah Soal Salah"
          value={result.wrong_answers}
          color="bg-danger-soft text-danger"
        />
        <StatCard
          icon={BarChart2}
          label="Total Soal"
          value={result.total_questions}
          color="bg-primary-soft text-primary"
        />
        <StatCard
          icon={Clock}
          label="Durasi (menit)"
          value={result.duration_minutes}
          color="bg-accent-soft text-accent"
        />
      </div>

      {/* Aksi */}
      <div className="flex gap-3">
        <Link to="/siswa/ujian" className="flex-1">
          <Button variant="outline" className="w-full">
            Kembali ke Daftar Ujian
          </Button>
        </Link>
        <Link to="/siswa" className="flex-1">
          <Button className="w-full">
            Ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
