import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle, XCircle, BarChart2, Clock, Trophy, ArrowLeft, ChevronDown, ChevronUp, BookOpen,
} from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { ExamResult } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

/** Satu item jawaban per soal dalam pembahasan */
interface AnswerReview {
  question_id: number
  question: string
  type: string
  options?: { key: string; text: string }[] | null
  correct_answer: string
  explanation?: string | null
  my_answer: string | null
  is_correct: boolean
  order?: number
}

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

/** Accordion satu soal pembahasan */
function SoalAccordion({ item, index }: { item: AnswerReview; index: number }) {
  const [open, setOpen] = useState(false)

  const optionLabel = (opt: { key: string; text: string }) => {
    const isMyAnswer = item.my_answer?.toLowerCase() === opt.key.toLowerCase()
    const isCorrect = item.correct_answer?.toLowerCase() === opt.key.toLowerCase()
    return (
      <div
        key={opt.key}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm',
          isCorrect
            ? 'border-success/40 bg-success-soft font-semibold text-success'
            : isMyAnswer && !item.is_correct
            ? 'border-danger/40 bg-danger-soft text-danger'
            : 'border-line bg-surface text-ink',
        )}
      >
        <span className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold',
          isCorrect ? 'bg-success text-white' : isMyAnswer && !item.is_correct ? 'bg-danger text-white' : 'bg-surface-alt text-muted',
        )}>
          {opt.key.toUpperCase()}
        </span>
        <span className="flex-1">{opt.text}</span>
        {isCorrect && <CheckCircle size={14} className="shrink-0" />}
        {isMyAnswer && !item.is_correct && <XCircle size={14} className="shrink-0" />}
      </div>
    )
  }

  return (
    <div className={cn(
      'overflow-hidden rounded-2xl border transition-colors',
      item.is_correct ? 'border-success/30' : 'border-danger/30',
    )}>
      {/* Header accordion */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-alt"
      >
        <span className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold',
          item.is_correct ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
        )}>
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-semibold text-ink line-clamp-2">{item.question}</span>
        <span className="ml-2 shrink-0">
          {item.is_correct
            ? <CheckCircle size={16} className="text-success" />
            : <XCircle size={16} className="text-danger" />}
        </span>
        {open ? <ChevronUp size={16} className="shrink-0 text-muted" /> : <ChevronDown size={16} className="shrink-0 text-muted" />}
      </button>

      {/* Body accordion */}
      {open && (
        <div className="space-y-4 border-t border-line px-5 py-4">
          {/* Jawaban siswa vs kunci */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-alt px-4 py-3 text-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Jawaban Kamu</p>
              <p className={cn('font-semibold', item.is_correct ? 'text-success' : 'text-danger')}>
                {item.my_answer
                  ? item.options?.find(o => o.key.toLowerCase() === item.my_answer?.toLowerCase())?.text ?? item.my_answer
                  : <span className="italic text-muted">Tidak dijawab</span>}
              </p>
            </div>
            <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-success/70">Kunci Jawaban</p>
              <p className="font-semibold text-success">
                {item.options?.find(o => o.key.toLowerCase() === item.correct_answer?.toLowerCase())?.text ?? item.correct_answer}
              </p>
            </div>
          </div>

          {/* Opsi pilihan ganda */}
          {item.type === 'multiple' && item.options && (
            <div className="space-y-2">
              {item.options.map(optionLabel)}
            </div>
          )}

          {/* Penjelasan */}
          {item.explanation && (
            <div className="rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary/70">Penjelasan</p>
              <p className="leading-relaxed text-ink">{item.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function HasilUjianSiswa() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [reviews, setReviews] = useState<AnswerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showPembahasan, setShowPembahasan] = useState(false)

  useEffect(() => {
    if (!id) return
    siswaApi.examResult(Number(id))
      .then((res) => {
        const d = res.data?.data ?? res.data
        setResult(d)
        // Jika backend sudah return array answers_review, pakai langsung
        if (Array.isArray(d?.answers_review)) {
          setReviews(d.answers_review)
        }
      })
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
              className={cn('h-full rounded-full transition-all', passed ? 'bg-success' : 'bg-danger')}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Badge lulus/tidak */}
          <div className="mt-3 flex items-center gap-2">
            {passed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
                <Trophy size={13} /> Lulus
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-sm font-bold text-danger">
                <XCircle size={13} /> Tidak Lulus
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
        <StatCard icon={CheckCircle} label="Soal Benar" value={result.correct_answers} color="bg-success-soft text-success" />
        <StatCard icon={XCircle} label="Soal Salah" value={result.wrong_answers} color="bg-danger-soft text-danger" />
        <StatCard icon={BarChart2} label="Total Soal" value={result.total_questions} color="bg-primary-soft text-primary" />
        <StatCard icon={Clock} label="Durasi (menit)" value={result.duration_minutes} color="bg-accent-soft text-accent" />
      </div>

      {/* Section Pembahasan */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <button
          onClick={() => setShowPembahasan((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-surface-alt"
        >
          <span className="flex items-center gap-2 font-extrabold text-ink">
            <BookOpen size={16} className="text-primary" />
            Pembahasan Soal
            {reviews.length > 0 && (
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                {reviews.length} soal
              </span>
            )}
          </span>
          {showPembahasan ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
        </button>

        {showPembahasan && (
          <div className="border-t border-line px-5 py-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Pembahasan belum tersedia untuk ujian ini.
              </p>
            ) : (
              reviews
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item, i) => (
                  <SoalAccordion key={item.question_id} item={item} index={i} />
                ))
            )}
          </div>
        )}
      </div>

      {/* Aksi */}
      <div className="flex gap-3">
        <Link to="/siswa/ujian" className="flex-1">
          <Button variant="outline" className="w-full">Kembali ke Daftar Ujian</Button>
        </Link>
        <Link to="/siswa" className="flex-1">
          <Button className="w-full">Ke Dashboard</Button>
        </Link>
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
