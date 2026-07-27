import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, FileQuestion, BarChart2, Calendar,
  Play, BookOpen, AlertTriangle,
} from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { Exam } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

function InfoRow({
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
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm', color)}>
        <Icon size={15} />
      </span>
      <span className="flex-1 text-sm font-medium text-muted">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  )
}

export function DetailUjianSiswa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!id) return
    siswaApi.examDetail(Number(id))
      .then((res) => setExam(res.data?.data ?? res.data))
      .catch(() => toast.error('Gagal memuat detail ujian.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStart() {
    if (!id) return
    setStarting(true)
    try {
      await siswaApi.startExam(Number(id))
      navigate(`/siswa/ujian/${id}/kerjakan`)
    } catch {
      toast.error('Gagal memulai ujian. Coba lagi.')
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <AlertTriangle size={32} className="text-warning" />
        <p className="mt-3 font-semibold text-ink">Ujian tidak ditemukan</p>
        <Link to="/siswa/ujian" className="mt-2 text-sm text-primary hover:underline">
          Kembali ke daftar ujian
        </Link>
      </div>
    )
  }

  const startDate = exam.start_time
    ? new Date(exam.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const STATUS_STYLE: Record<string, string> = {
    aktif: 'bg-success-soft text-success',
    berlangsung: 'bg-warning-soft text-warning',
    nonaktif: 'bg-surface-alt text-muted',
    selesai: 'bg-primary-soft text-primary',
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/siswa/ujian">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <h1 className="text-xl font-extrabold text-ink">Detail Ujian</h1>
      </div>

      {/* Cover card */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        {/* Banner */}
        <div className="flex h-40 items-center justify-center bg-primary-soft">
          <BookOpen size={52} className="text-primary/40" strokeWidth={1.25} />
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-extrabold text-ink">{exam.titles}</h2>
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-bold capitalize',
              STATUS_STYLE[exam.status] ?? 'bg-surface-alt text-muted',
            )}>
              {exam.status}
            </span>
          </div>

          {exam.category && (
            <p className="mt-1 text-sm text-muted">{exam.category.name}</p>
          )}

          {/* Info rows */}
          <div className="mt-4 space-y-2">
            <InfoRow
              icon={Calendar}
              label="Tanggal"
              value={startDate}
              color="bg-warning-soft text-warning"
            />
            <InfoRow
              icon={Clock}
              label="Waktu Ujian"
              value={`${exam.duration_minutes} Menit`}
              color="bg-accent-soft text-accent"
            />
            <InfoRow
              icon={FileQuestion}
              label="Jumlah Soal"
              value={`${exam.total_questions} Soal`}
              color="bg-primary-soft text-primary"
            />
            {exam.kkm_score != null && (
              <InfoRow
                icon={BarChart2}
                label="Nilai KKM"
                value={String(exam.kkm_score)}
                color="bg-success-soft text-success"
              />
            )}
          </div>

          {/* Deskripsi */}
          {exam.description && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">Deskripsi :</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{exam.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tata tertib */}
      {exam.instructions && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-3 font-bold text-ink">Peraturan dan Tata Cara Ujian:</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{exam.instructions}</p>
        </div>
      )}

      {/* Default tata tertib jika tidak ada */}
      {!exam.instructions && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-3 font-bold text-ink">📌 Peraturan Umum:</h3>
          <ol className="space-y-1.5 text-sm leading-relaxed text-muted">
            {[
              'Peserta wajib login menggunakan akun yang telah terdaftar sebelum memulai ujian.',
              'Ujian hanya dapat diakses pada waktu yang telah ditentukan.',
              'Dilarang keras membuka tab atau aplikasi lain selama ujian berlangsung.',
              'Peserta dilarang bekerja sama atau menyalin jawaban dari peserta lain.',
              'Setiap pelanggaran akan tercatat dan berpotensi menyebabkan ujian dibatalkan.',
              'Jika koneksi internet terputus, segera hubungi guru/pengawas ujian.',
            ].map((rule, i) => (
              <li key={i}>{i + 1}. {rule}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Tombol Mulai */}
      {exam.status === 'aktif' || exam.status === 'berlangsung' ? (
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleStart}
          disabled={starting}
        >
          <Play size={17} fill="currentColor" />
          {starting ? 'Memulai Ujian…' : 'Mulai Ujian'}
        </Button>
      ) : (
        <div className="rounded-xl border border-line bg-surface-alt px-4 py-3 text-center text-sm text-muted">
          {exam.status === 'selesai'
            ? 'Ujian ini sudah selesai.'
            : 'Ujian ini belum aktif.'}
        </div>
      )}
    </div>
  )
}
