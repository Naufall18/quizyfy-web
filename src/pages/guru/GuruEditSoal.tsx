import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { guruApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

type QuestionType = 'pg' | 'essay' | 'true_false'
interface OptionItem { key: string; text: string }

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'pg', label: 'Pilihan Ganda' },
  { value: 'essay', label: 'Essay' },
  { value: 'true_false', label: 'Benar / Salah' },
]

export function GuruEditSoal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<QuestionType>('pg')
  const [text, setText] = useState('')
  const [options, setOptions] = useState<OptionItem[]>([
    { key: 'a', text: '' }, { key: 'b', text: '' },
    { key: 'c', text: '' }, { key: 'd', text: '' },
  ])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    guruApi.questions()
      .then((res) => {
        const list = (res.data as { data?: unknown[] })?.data ?? res.data
        const q = Array.isArray(list) ? list.find((x: unknown) => (x as { id: number }).id === Number(id)) : null
        if (q) {
          const question = q as { question: string; type: QuestionType; options?: string | OptionItem[]; correct_answer?: string; explanation?: string }
          setText(question.question ?? '')
          setType(question.type ?? 'pg')
          setExplanation(question.explanation ?? '')
          setCorrectAnswer(question.correct_answer ?? '')
          if (question.type === 'pg' && question.options) {
            const opts = typeof question.options === 'string'
              ? JSON.parse(question.options) as OptionItem[]
              : question.options
            setOptions(opts)
          }
        }
      })
      .catch(() => toast.error('Gagal memuat soal.'))
      .finally(() => setLoading(false))
  }, [id])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!text.trim()) errs.text = 'Pertanyaan wajib diisi'
    if (type === 'pg' && !correctAnswer) errs.answer = 'Pilih jawaban yang benar'
    if (type === 'true_false' && !correctAnswer) errs.answer = 'Pilih jawaban yang benar'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate() || !id) return
    setSaving(true)
    try {
      await guruApi.updateQuestion(Number(id), {
        question: text,
        type,
        options: type === 'pg' ? JSON.stringify(options.filter((o) => o.text.trim())) : null,
        correct_answer: correctAnswer || null,
        explanation: explanation || null,
      })
      toast.success('Soal berhasil diperbarui!')
      navigate('/guru/bank-soal')
    } catch {
      toast.error('Gagal menyimpan soal.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/guru/bank-soal">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-ink">Edit Soal</h1>
          <p className="text-sm text-muted">Perbarui soal di bank soal kamu</p>
        </div>
      </div>

      {/* Tipe soal */}
      <Card className="space-y-4">
        <h2 className="font-extrabold text-ink">Tipe Soal</h2>
        <div className="flex gap-3">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setCorrectAnswer('') }}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all',
                type === t.value
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line bg-surface text-muted hover:bg-surface-alt',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Pertanyaan */}
      <Card className="space-y-5">
        <h2 className="font-extrabold text-ink">Pertanyaan</h2>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Teks Pertanyaan</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => { setText(e.target.value); setErrors((p) => ({ ...p, text: '' })) }}
            className={cn(
              'w-full resize-none rounded-xl border bg-surface px-4 py-3 text-sm text-ink',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
              errors.text ? 'border-danger' : 'border-line-strong',
            )}
          />
          {errors.text && <p className="mt-1.5 text-sm text-danger">{errors.text}</p>}
        </div>

        {/* Opsi PG */}
        {type === 'pg' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-ink">Opsi Jawaban</label>
              {options.length < 6 && (
                <button
                  onClick={() => setOptions((prev) => [...prev, { key: 'abcdef'[prev.length], text: '' }])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={12} /> Tambah opsi
                </button>
              )}
            </div>
            {options.map((opt, i) => (
              <div key={opt.key} className="flex items-center gap-3">
                <button
                  onClick={() => setCorrectAnswer(opt.key)}
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition-all',
                    correctAnswer === opt.key ? 'bg-success text-white' : 'bg-surface-alt text-muted hover:bg-primary-soft hover:text-primary',
                  )}
                >
                  {opt.key.toUpperCase()}
                </button>
                <input
                  value={opt.text}
                  onChange={(e) => setOptions((prev) => prev.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                  className="h-10 flex-1 rounded-xl border border-line-strong bg-bg px-3 text-sm text-ink focus:border-primary focus:outline-none"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i).map((o, j) => ({ ...o, key: 'abcdef'[j] })))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {errors.answer && <p className="text-sm text-danger">{errors.answer}</p>}
          </div>
        )}

        {/* Benar/Salah */}
        {type === 'true_false' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Jawaban Benar</label>
            <div className="flex gap-3">
              {['benar', 'salah'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCorrectAnswer(opt)}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all',
                    correctAnswer === opt ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink hover:border-primary/40',
                  )}
                >
                  {opt === 'benar' ? '✅ Benar' : '❌ Salah'}
                </button>
              ))}
            </div>
            {errors.answer && <p className="text-sm text-danger">{errors.answer}</p>}
          </div>
        )}

        {/* Pembahasan */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Pembahasan <span className="text-muted">(opsional)</span>
          </label>
          <textarea
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Link to="/guru/bank-soal" className="flex-1">
          <Button variant="outline" className="w-full">Batal</Button>
        </Link>
        <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
          <Save size={15} />
          {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  )
}
