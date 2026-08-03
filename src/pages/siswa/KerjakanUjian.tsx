import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, AlertTriangle, Grid3X3 } from 'lucide-react'
import { siswaApi } from '../../lib/api'
import type { Question, ExamSession } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

/** Format detik → HH:MM:SS */
function formatTimer(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function KerjakanUjian() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [, setSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load soal dan session
  useEffect(() => {
    if (!id) return
    Promise.all([
      siswaApi.examDetail(Number(id)),
      siswaApi.examStatus(Number(id)),
    ])
      .then(([examRes, statusRes]) => {
        const examData = examRes.data?.data ?? examRes.data
        const sessionData: ExamSession = statusRes.data?.data ?? statusRes.data
        // Soal dari examDetail atau endpoint terpisah
        const qs: Question[] = examData?.questions ?? []
        setQuestions(qs)
        setSession(sessionData)
        setTimer(sessionData.remaining_seconds ?? (examData?.duration_minutes ?? 60) * 60)
        // Restore jawaban yang sudah ada
        if (sessionData.answered) {
          const restored: Record<number, string> = {}
          sessionData.answered.forEach((qId: number) => {
            restored[qId] = '__answered__'
          })
          setAnswers(restored)
        }
      })
      .catch(() => toast.error('Gagal memuat soal ujian.'))
      .finally(() => setLoading(false))
  }, [id])

  // Timer countdown
  useEffect(() => {
    if (timer <= 0 || loading) return
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleAutoFinish()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading]) // eslint-disable-line

  const handleAutoFinish = useCallback(async () => {
    if (!id) return
    toast.warning('Waktu habis! Ujian diselesaikan otomatis.')
    try {
      await siswaApi.finishExam(Number(id))
      navigate(`/siswa/ujian/${id}/hasil`)
    } catch {
      navigate(`/siswa/ujian/${id}/hasil`)
    }
  }, [id, navigate])

  async function handleAnswerSelect(questionId: number, answer: string) {
    if (!id) return
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    try {
      await siswaApi.submitAnswer(Number(id), {
        question_id: questionId,
        answer,
      })
    } catch {
      // Silent — jawaban tetap tersimpan di state lokal
    }
  }

  async function handleFinish() {
    if (!id || submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      await siswaApi.finishExam(Number(id))
      navigate(`/siswa/ujian/${id}/hasil`)
    } catch {
      toast.error('Gagal mengumpulkan ujian. Coba lagi.')
      setSubmitting(false)
    }
  }

  const currentQ = questions[currentIdx]
  const answeredCount = Object.keys(answers).length
  const timerDanger = timer <= 60
  const timerWarning = timer <= 300 && timer > 60

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!currentQ) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <AlertTriangle size={32} className="text-warning" />
        <p className="mt-3 font-semibold text-ink">Soal tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Banner warning waktu — muncul saat <=5 menit */}
      {timerWarning && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
          <AlertTriangle size={16} className="shrink-0" />
          Waktu tersisa kurang dari 5 menit! Segera selesaikan ujianmu.
        </div>
      )}

      {/* Banner danger waktu — muncul saat <=60 detik */}
      {timerDanger && (
        <div className="flex animate-pulse items-center gap-3 rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
          <AlertTriangle size={16} className="shrink-0 animate-bounce" />
          Waktu hampir habis! Kurang dari 1 menit.
        </div>
      )}

      {/* Header: Soal No + Timer + Lihat Nomor */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
          <span className="text-sm font-semibold text-ink">Soal No.</span>
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-xs font-bold text-white">
            {currentIdx + 1}
          </span>
          <span className={cn(
            'ml-auto text-sm font-bold tabular-nums',
            timerDanger ? 'text-danger animate-pulse' : timerWarning ? 'text-warning' : 'text-ink',
          )}>
            {formatTimer(timer)}
          </span>
        </div>
        <button
          onClick={() => setShowGrid((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-alt"
          aria-label="Lihat nomor soal"
        >
          <Grid3X3 size={18} />
        </button>
      </div>

      {/* Soal */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="mb-4 text-sm leading-relaxed text-ink whitespace-pre-line">
          {currentIdx + 1}. {currentQ.question}
        </p>

        {/* Opsi pilihan ganda */}
        {currentQ.type === 'multiple' && currentQ.options && (
          <div className="space-y-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswerSelect(currentQ.id, opt.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                  answers[currentQ.id] === opt.key
                    ? 'border-primary bg-primary-soft font-semibold text-primary'
                    : 'border-line bg-surface text-ink hover:border-primary/40 hover:bg-surface-alt',
                )}
              >
                <span className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold',
                  answers[currentQ.id] === opt.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-alt text-muted',
                )}>
                  {opt.key.toUpperCase()}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* Essay */}
        {currentQ.type === 'essay' && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-muted">Jawaban anda</p>
            <textarea
              value={answers[currentQ.id] ?? ''}
              onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
              rows={5}
              placeholder="Tulis jawaban kamu di sini..."
              className="w-full resize-none rounded-xl border border-line-strong bg-bg p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Benar/Salah */}
        {currentQ.type === 'true_false' && (
          <div className="flex gap-3">
            {['Benar', 'Salah'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswerSelect(currentQ.id, opt.toLowerCase())}
                className={cn(
                  'flex-1 rounded-xl border py-3 text-sm font-semibold transition-all',
                  answers[currentQ.id] === opt.toLowerCase()
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-surface text-ink hover:border-primary/40',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigasi soal */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="gap-1"
        >
          <ChevronLeft size={16} />
          Sebelumnya
        </Button>

        <span className="flex-1 text-center text-sm text-muted">
          {currentIdx + 1} / {questions.length}
        </span>

        {currentIdx < questions.length - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="gap-1"
          >
            Selanjutnya
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1 bg-success hover:bg-success/90"
            onClick={() => setConfirmFinish(true)}
          >
            Selesai
          </Button>
        )}
      </div>

      {/* Grid nomor soal */}
      {showGrid && (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-ink">Nomor Soal ({answeredCount}/{questions.length} dijawab)</span>
            <button onClick={() => setShowGrid(false)} className="text-xs text-muted hover:text-ink">Tutup</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => { setCurrentIdx(i); setShowGrid(false) }}
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-xl text-sm font-bold transition-all',
                  i === currentIdx
                    ? 'bg-primary text-white'
                    : answers[q.id]
                      ? 'bg-success-soft text-success'
                      : 'border border-line-strong bg-surface text-muted hover:bg-surface-alt',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-success-soft" /> Dijawab
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-line-strong" /> Belum
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-primary" /> Aktif
            </span>
          </div>
        </div>
      )}

      {/* Modal konfirmasi selesai */}
      {confirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-2xl">
            <AlertTriangle size={40} className="mx-auto text-warning" />
            <h3 className="mt-3 text-lg font-extrabold text-ink">Yakin ingin selesai ujian?</h3>
            <p className="mt-1 text-sm text-muted">
              {answeredCount < questions.length
                ? `Masih ada ${questions.length - answeredCount} soal belum dijawab.`
                : 'Semua soal sudah dijawab.'}
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmFinish(false)} disabled={submitting}>
                Batal
              </Button>
              <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleFinish} disabled={submitting}>
                {submitting ? 'Mengumpulkan…' : 'Yakin'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
