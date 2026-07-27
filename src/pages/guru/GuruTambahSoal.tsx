import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { guruApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

type QuestionType = 'pg' | 'essay' | 'true_false'

interface OptionItem { key: string; text: string }

interface QuestionForm {
  type: QuestionType
  text: string
  options: OptionItem[]
  correct_answer: string
  explanation: string
}

const TYPE_OPTIONS: { value: QuestionType; label: string; desc: string }[] = [
  { value: 'pg', label: 'Pilihan Ganda', desc: 'Satu jawaban benar dari beberapa opsi' },
  { value: 'essay', label: 'Essay', desc: 'Jawaban uraian bebas dari siswa' },
  { value: 'true_false', label: 'Benar / Salah', desc: 'Pilih Benar atau Salah' },
]

const INITIAL_OPTIONS: OptionItem[] = [
  { key: 'a', text: '' },
  { key: 'b', text: '' },
  { key: 'c', text: '' },
  { key: 'd', text: '' },
]

export function GuruTambahSoal() {
  const navigate = useNavigate()
  const [form, setForm] = useState<QuestionForm>({
    type: 'pg',
    text: '',
    options: INITIAL_OPTIONS,
    correct_answer: '',
    explanation: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof QuestionForm | 'options', string>>>({})

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!form.text.trim()) errs.text = 'Pertanyaan wajib diisi'
    if (form.type === 'pg') {
      const filled = form.options.filter((o) => o.text.trim())
      if (filled.length < 2) errs.options = 'Isi minimal 2 opsi jawaban'
      if (!form.correct_answer) errs.correct_answer = 'Pilih jawaban yang benar'
    }
    if (form.type === 'true_false' && !form.correct_answer) {
      errs.correct_answer = 'Pilih jawaban yang benar'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await guruApi.createQuestion({
        question: form.text,
        type: form.type,
        options: form.type === 'pg'
          ? JSON.stringify(form.options.filter((o) => o.text.trim()))
          : null,
        correct_answer: form.correct_answer || null,
        explanation: form.explanation || null,
      })
      toast.success('Soal berhasil ditambahkan ke bank soal!')
      navigate('/guru/bank-soal')
    } catch {
      toast.error('Gagal menyimpan soal. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  function updateOption(idx: number, text: string) {
    setForm((prev) => {
      const opts = [...prev.options]
      opts[idx] = { ...opts[idx], text }
      return { ...prev, options: opts }
    })
    setErrors((prev) => ({ ...prev, options: undefined }))
  }

  function addOption() {
    if (form.options.length >= 6) return
    const keys = 'abcdef'
    const key = keys[form.options.length]
    setForm((prev) => ({ ...prev, options: [...prev.options, { key, text: '' }] }))
  }

  function removeOption(idx: number) {
    if (form.options.length <= 2) return
    setForm((prev) => {
      const opts = prev.options.filter((_, i) => i !== idx)
        .map((o, i) => ({ ...o, key: 'abcdef'[i] }))
      const newAnswer = opts.some((o) => o.key === prev.correct_answer)
        ? prev.correct_answer : ''
      return { ...prev, options: opts, correct_answer: newAnswer }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/guru/bank-soal">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-ink">Tambah Soal</h1>
          <p className="text-sm text-muted">Tambahkan soal baru ke bank soal kamu</p>
        </div>
      </div>

      {/* Pilih tipe soal */}
      <Card className="space-y-4">
        <h2 className="font-extrabold text-ink">Tipe Soal</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setForm((prev) => ({
                ...prev, type: t.value,
                correct_answer: '',
                options: t.value === 'pg' ? INITIAL_OPTIONS : [],
              }))}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                form.type === t.value
                  ? 'border-primary bg-primary-soft ring-2 ring-primary/20'
                  : 'border-line bg-surface hover:border-primary/30 hover:bg-surface-alt',
              )}
            >
              <div className="font-bold text-ink text-sm">{t.label}</div>
              <div className="mt-1 text-xs text-muted">{t.desc}</div>
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
            placeholder="Tulis pertanyaan di sini..."
            value={form.text}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, text: e.target.value }))
              setErrors((prev) => ({ ...prev, text: undefined }))
            }}
            className={cn(
              'w-full resize-none rounded-xl border bg-surface px-4 py-3 text-sm text-ink',
              'placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
              errors.text ? 'border-danger' : 'border-line-strong',
            )}
          />
          {errors.text && <p className="mt-1.5 text-sm text-danger">{errors.text}</p>}
        </div>

        {/* Opsi PG */}
        {form.type === 'pg' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-ink">Opsi Jawaban</label>
              {form.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={12} /> Tambah opsi
                </button>
              )}
            </div>
            {errors.options && <p className="text-sm text-danger">{errors.options}</p>}
            {form.options.map((opt, i) => (
              <div key={opt.key} className="flex items-center gap-3">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, correct_answer: opt.key }))}
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition-all',
                    form.correct_answer === opt.key
                      ? 'bg-success text-white'
                      : 'bg-surface-alt text-muted hover:bg-primary-soft hover:text-primary',
                  )}
                  title="Jadikan jawaban benar"
                >
                  {opt.key.toUpperCase()}
                </button>
                <input
                  value={opt.text}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Opsi ${opt.key.toUpperCase()}`}
                  className="h-10 flex-1 rounded-xl border border-line-strong bg-bg px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {form.options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {errors.correct_answer && (
              <p className="text-sm text-danger">{errors.correct_answer}</p>
            )}
            <p className="text-xs text-muted">
              Klik huruf (A/B/C/D) untuk memilih jawaban yang benar. Saat ini:{' '}
              <strong>{form.correct_answer ? form.correct_answer.toUpperCase() : '—'}</strong>
            </p>
          </div>
        )}

        {/* Benar/Salah */}
        {form.type === 'true_false' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Jawaban Benar</label>
            <div className="flex gap-3">
              {['benar', 'salah'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForm((prev) => ({ ...prev, correct_answer: opt }))}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition-all',
                    form.correct_answer === opt
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-surface text-ink hover:border-primary/40',
                  )}
                >
                  {opt === 'benar' ? '✅ Benar' : '❌ Salah'}
                </button>
              ))}
            </div>
            {errors.correct_answer && (
              <p className="text-sm text-danger">{errors.correct_answer}</p>
            )}
          </div>
        )}

        {/* Pembahasan */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Pembahasan <span className="text-muted">(opsional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Jelaskan mengapa jawaban tersebut benar..."
            value={form.explanation}
            onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
            className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </Card>

      {/* Tombol simpan */}
      <div className="flex gap-3">
        <Link to="/guru/bank-soal" className="flex-1">
          <Button variant="outline" className="w-full">Batal</Button>
        </Link>
        <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
          <Save size={15} />
          {saving ? 'Menyimpan…' : 'Simpan Soal'}
        </Button>
      </div>
    </div>
  )
}
