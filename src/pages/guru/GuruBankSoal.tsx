import { useEffect, useState } from 'react'
import { Plus, Search, Database, Edit2, Trash2, BookmarkPlus, X, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { guruApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

interface Question {
  id: number
  question: string
  type: 'pg' | 'essay' | 'true_false' | 'multiple'
  category?: { id: number; name: string }
  created_at?: string
}

const TYPE_LABEL: Record<string, string> = {
  pg: 'Pilihan Ganda',
  multiple: 'Pilihan Ganda',
  essay: 'Essay',
  true_false: 'Benar/Salah',
}

const TYPE_VARIANT: Record<string, 'primary' | 'accent' | 'success'> = {
  pg: 'primary',
  multiple: 'primary',
  essay: 'accent',
  true_false: 'success',
}

/** Modal untuk memilih ujian yang akan dilampiri soal */
function AttachToExamModal({
  question,
  onClose,
}: {
  question: Question
  onClose: () => void
}) {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [attaching, setAttaching] = useState<number | null>(null)
  const [attached, setAttached] = useState<Set<number>>(new Set())

  useEffect(() => {
    guruApi.exams()
      .then((res) => {
        const d = res.data as Paginated<Exam>
        setExams((d.data ?? []).filter((e) => e.status !== 'selesai'))
      })
      .catch(() => setExams([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleAttach(examId: number) {
    setAttaching(examId)
    try {
      await guruApi.attachQuestions({ exam_id: examId, question_ids: [question.id] })
      setAttached((prev) => new Set([...prev, examId]))
      toast.success('Soal berhasil ditambahkan ke ujian')
    } catch {
      toast.error('Gagal menambahkan soal ke ujian.')
    } finally {
      setAttaching(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-extrabold text-ink">Tambahkan ke Ujian</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl text-muted hover:bg-surface-alt">
            <X size={17} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-line bg-surface-alt px-4 py-3">
          <p className="text-xs font-semibold text-muted">Soal yang dipilih</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-ink">{question.question}</p>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">
            Belum ada ujian yang bisa dipilih.
            <div className="mt-2">
              <Link to="/guru/ujian/buat" onClick={onClose} className="text-primary hover:underline">
                Buat ujian baru
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {exams.map((exam) => {
              const isDone = attached.has(exam.id)
              return (
                <div
                  key={exam.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors',
                    isDone ? 'border-success/30 bg-success-soft' : 'border-line bg-surface',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{exam.titles}</p>
                    <p className="text-xs text-muted capitalize">{exam.status} · {exam.total_questions} soal</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isDone ? 'ghost' : 'outline'}
                    className={cn('shrink-0 gap-1', isDone && 'text-success')}
                    onClick={() => !isDone && handleAttach(exam.id)}
                    disabled={isDone || attaching === exam.id}
                  >
                    {isDone
                      ? <><CheckCircle2 size={13} /> Ditambahkan</>
                      : attaching === exam.id
                        ? 'Menambahkan...'
                        : <><Plus size={13} /> Pilih</>}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  )
}

export function GuruBankSoal() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [attachTarget, setAttachTarget] = useState<Question | null>(null)

  useEffect(() => {
    let active = true
    guruApi
      .questions()
      .then((res) => {
        if (active) {
          const d = res.data
          setQuestions((d.data ?? d) as Question[])
        }
      })
      .catch(() => { if (active) setQuestions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(query.toLowerCase()),
  )

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await guruApi.deleteQuestion(0, deleteTarget.id)
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id))
      toast.success('Soal berhasil dihapus')
      setDeleteTarget(null)
    } catch {
      toast.error('Gagal menghapus soal.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Bank Soal</h1>
          <p className="mt-1 text-muted">{questions.length} soal tersedia</p>
        </div>
        <Link to="/guru/bank-soal/tambah">
          <Button size="sm" className="gap-2">
            <Plus size={16} /> Tambah Soal
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari soal..."
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
        <EmptyState
          icon={<Database size={28} />}
          title={query ? 'Soal tidak ditemukan' : 'Bank soal masih kosong'}
          description={query ? 'Coba kata kunci lain.' : 'Mulai tambahkan soal pertamamu.'}
          action={
            !query ? (
              <Link to="/guru/bank-soal/tambah">
                <Button size="sm" className="gap-2">
                  <Plus size={14} /> Tambah Soal
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-soft">#{idx + 1}</span>
                  <Badge variant={TYPE_VARIANT[q.type] ?? 'neutral'} size="sm">
                    {TYPE_LABEL[q.type] ?? q.type}
                  </Badge>
                  {q.category && (
                    <Badge variant="neutral" size="sm">{q.category.name}</Badge>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink">{q.question}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {/* Tambah ke Ujian */}
                <button
                  onClick={() => setAttachTarget(q)}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  aria-label="Tambah ke ujian"
                  title="Tambah ke Ujian"
                >
                  <BookmarkPlus size={14} />
                </button>
                <Link to={`/guru/bank-soal/${q.id}/edit`}>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label="Edit soal"
                  >
                    <Edit2 size={14} />
                  </button>
                </Link>
                <button
                  onClick={() => setDeleteTarget(q)}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-danger/40 hover:text-danger"
                  aria-label="Hapus soal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Tambah ke Ujian */}
      {attachTarget && (
        <AttachToExamModal
          question={attachTarget}
          onClose={() => setAttachTarget(null)}
        />
      )}

      {/* Confirm hapus */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus soal ini?"
        description={deleteTarget?.question
          ? `"${deleteTarget.question.slice(0, 60)}…" akan dihapus permanen.`
          : 'Soal akan dihapus permanen.'}
        confirmLabel="Hapus"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
