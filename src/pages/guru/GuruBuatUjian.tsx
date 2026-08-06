import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Save, ClipboardList, Clock, BarChart2,
  FileText, BookOpen, Database, Plus, Minus, CheckCircle2, Search,
} from 'lucide-react'
import { guruApi } from '../../lib/api'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

interface ExamForm {
  titles: string
  description: string
  duration_minutes: number | ''
  kkm_score: number | ''
  instructions: string
  status: 'aktif' | 'nonaktif'
  start_time: string
  end_time: string
}

interface Question {
  id: number
  question: string
  type: string
  category?: { id: number; name: string }
}

const INITIAL: ExamForm = {
  titles: '',
  description: '',
  duration_minutes: 60,
  kkm_score: 75,
  instructions: '',
  status: 'nonaktif',
  start_time: '',
  end_time: '',
}

type Step = 'info' | 'pengaturan' | 'preview' | 'soal'

const STEPS: { key: Step; label: string; icon: typeof ClipboardList }[] = [
  { key: 'info',       label: 'Informasi',  icon: FileText },
  { key: 'pengaturan', label: 'Pengaturan', icon: ClipboardList },
  { key: 'preview',    label: 'Pratinjau',  icon: BookOpen },
  { key: 'soal',       label: 'Pilih Soal', icon: Database },
]

const TYPE_LABEL: Record<string, string> = {
  multiple: 'Pilihan Ganda',
  pg: 'Pilihan Ganda',
  essay: 'Essay',
  true_false: 'Benar/Salah',
}

export function GuruBuatUjian() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ExamForm>(INITIAL)
  const [step, setStep] = useState<Step>('info')
  const [saving, setSaving] = useState(false)
  const [examId, setExamId] = useState<number | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ExamForm, string>>>({})

  // Bank soal state
  const [bankSoal, setBankSoal] = useState<Question[]>([])
  const [bankLoading, setBankLoading] = useState(false)
  const [bankQuery, setBankQuery] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [attaching, setAttaching] = useState(false)

  function set<K extends keyof ExamForm>(key: K, value: ExamForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateStep(): boolean {
    const errs: typeof errors = {}
    if (step === 'info') {
      if (!form.titles.trim()) errs.titles = 'Judul ujian wajib diisi'
      if (!form.description.trim()) errs.description = 'Deskripsi wajib diisi'
    }
    if (step === 'pengaturan') {
      if (!form.duration_minutes || Number(form.duration_minutes) < 5)
        errs.duration_minutes = 'Durasi minimal 5 menit'
      if (!form.kkm_score || Number(form.kkm_score) < 0 || Number(form.kkm_score) > 100)
        errs.kkm_score = 'KKM harus antara 0–100'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (!validateStep()) return
    if (step === 'info') setStep('pengaturan')
    else if (step === 'pengaturan') setStep('preview')
  }

  /** Simpan ujian → pindah ke step Pilih Soal */
  async function handleSaveAndPilihSoal() {
    if (!validateStep()) return
    setSaving(true)
    try {
      const res = await guruApi.createExam({
        titles: form.titles,
        description: form.description,
        duration_minutes: Number(form.duration_minutes),
        kkm_score: Number(form.kkm_score),
        instructions: form.instructions || null,
        status: form.status,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      })
      const id = (res.data as { exam?: { id: number }; data?: { id: number } })?.exam?.id
        ?? (res.data as { data?: { id: number } })?.data?.id
      setExamId(id ?? null)
      toast.success('Ujian berhasil dibuat! Sekarang pilih soal.')
      setStep('soal')
      loadBankSoal()
    } catch {
      toast.error('Gagal membuat ujian. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  async function loadBankSoal() {
    setBankLoading(true)
    try {
      const res = await guruApi.questions({ search: bankQuery || undefined })
      const d = res.data
      setBankSoal((d.data ?? d) as Question[])
    } catch {
      setBankSoal([])
    } finally {
      setBankLoading(false)
    }
  }

  useEffect(() => {
    if (step === 'soal') loadBankSoal()
  }, [bankQuery]) // eslint-disable-line

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAttach() {
    if (!examId || selected.size === 0) {
      toast.warning('Pilih setidaknya 1 soal.')
      return
    }
    setAttaching(true)
    try {
      await guruApi.attachQuestions({
        exam_id: examId,
        question_ids: Array.from(selected),
      })
      toast.success(`${selected.size} soal berhasil ditambahkan ke ujian.`)
      navigate('/guru/ujian')
    } catch {
      toast.error('Gagal menambahkan soal.')
    } finally {
      setAttaching(false)
    }
  }

  function skipSoal() {
    navigate('/guru/ujian')
  }

  const stepIdx = STEPS.findIndex((s) => s.key === step)
  const filteredBank = bankSoal.filter((q) =>
    q.question.toLowerCase().includes(bankQuery.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/guru/ujian">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-ink">Buat Ujian Baru</h1>
          <p className="text-sm text-muted">Isi informasi ujian langkah demi langkah</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-1.5">
            <button
              onClick={() => { if (i < stepIdx && step !== 'soal') setStep(s.key) }}
              disabled={i > stepIdx || step === 'soal'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all',
                s.key === step
                  ? 'bg-primary text-white shadow-sm'
                  : i < stepIdx
                    ? 'bg-success-soft text-success'
                    : 'bg-surface-alt text-muted cursor-not-allowed',
              )}
            >
              <s.icon size={13} />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 w-3 shrink-0 rounded-full', i < stepIdx ? 'bg-success' : 'bg-line')} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step: Informasi ── */}
      {step === 'info' && (
        <Card className="space-y-5">
          <h2 className="flex items-center gap-2 font-extrabold text-ink">
            <FileText size={18} className="text-primary" /> Informasi Ujian
          </h2>
          <Input
            label="Judul Ujian"
            placeholder="cth: Ujian Bab 1 Informatika"
            value={form.titles}
            onChange={(e) => set('titles', e.target.value)}
            error={errors.titles}
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Deskripsi singkat tentang ujian ini..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={cn(
                'w-full resize-none rounded-xl border bg-surface px-4 py-3 text-sm text-ink',
                'placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.description ? 'border-danger' : 'border-line-strong',
              )}
            />
            {errors.description && <p className="mt-1.5 text-sm text-danger">{errors.description}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Instruksi / Tata Tertib <span className="text-muted">(opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tulis instruksi atau peraturan ujian untuk siswa..."
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
              className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </Card>
      )}

      {/* ── Step: Pengaturan ── */}
      {step === 'pengaturan' && (
        <Card className="space-y-5">
          <h2 className="flex items-center gap-2 font-extrabold text-ink">
            <ClipboardList size={18} className="text-primary" /> Pengaturan Ujian
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Durasi (menit)" type="number" min={5} max={480}
              icon={<Clock size={15} />}
              value={form.duration_minutes}
              onChange={(e) => set('duration_minutes', e.target.value === '' ? '' : Number(e.target.value))}
              error={errors.duration_minutes}
            />
            <Input
              label="Nilai KKM" type="number" min={0} max={100}
              icon={<BarChart2 size={15} />}
              value={form.kkm_score}
              onChange={(e) => set('kkm_score', e.target.value === '' ? '' : Number(e.target.value))}
              error={errors.kkm_score}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Waktu Mulai" type="datetime-local" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
            <Input label="Waktu Berakhir" type="datetime-local" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Status Awal</label>
            <div className="flex gap-3">
              {(['nonaktif', 'aktif'] as const).map((s) => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all',
                    form.status === s
                      ? s === 'aktif' ? 'border-success bg-success-soft text-success' : 'border-primary bg-primary-soft text-primary'
                      : 'border-line bg-surface text-muted hover:bg-surface-alt',
                  )}
                >
                  {s === 'aktif' ? '✅ Aktif' : '⏸ Nonaktif'}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Step: Preview ── */}
      {step === 'preview' && (
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 font-extrabold text-ink">
            <BookOpen size={18} className="text-primary" /> Pratinjau Ujian
          </h2>
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {[
              { label: 'Judul',          value: form.titles },
              { label: 'Deskripsi',      value: form.description },
              { label: 'Durasi',         value: `${form.duration_minutes} menit` },
              { label: 'Nilai KKM',      value: String(form.kkm_score) },
              { label: 'Waktu Mulai',    value: form.start_time ? new Date(form.start_time).toLocaleString('id-ID') : '—' },
              { label: 'Waktu Berakhir', value: form.end_time ? new Date(form.end_time).toLocaleString('id-ID') : '—' },
              { label: 'Status',         value: form.status === 'aktif' ? '✅ Aktif' : '⏸ Nonaktif' },
            ].map((row) => (
              <div key={row.label} className="flex gap-4 px-4 py-3">
                <span className="w-32 shrink-0 text-sm font-semibold text-muted">{row.label}</span>
                <span className="text-sm text-ink">{row.value}</span>
              </div>
            ))}
          </div>
          {form.instructions && (
            <div>
              <p className="mb-1 text-sm font-semibold text-muted">Instruksi</p>
              <p className="rounded-xl border border-line bg-surface-alt px-4 py-3 text-sm text-ink whitespace-pre-line">{form.instructions}</p>
            </div>
          )}
          <div className="rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm text-primary">
            💡 Setelah menyimpan, kamu bisa langsung memilih soal dari bank soal untuk ujian ini.
          </div>
        </Card>
      )}

      {/* ── Step: Pilih Soal ── */}
      {step === 'soal' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-extrabold text-ink">
              <Database size={18} className="text-primary" /> Pilih Soal dari Bank Soal
            </h2>
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              selected.size > 0 ? 'bg-primary-soft text-primary' : 'bg-surface-alt text-muted',
            )}>
              {selected.size} dipilih
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
            <input
              value={bankQuery}
              onChange={(e) => setBankQuery(e.target.value)}
              placeholder="Cari soal..."
              className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* List soal */}
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {bankLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : filteredBank.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">
                {bankQuery ? 'Tidak ada soal yang cocok.' : 'Bank soal masih kosong.'}
                <div className="mt-2">
                  <Link to="/guru/bank-soal/tambah" className="text-primary hover:underline">
                    + Tambah soal baru
                  </Link>
                </div>
              </div>
            ) : (
              filteredBank.map((q) => {
                const isSelected = selected.has(q.id)
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => toggleSelect(q.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary-soft'
                        : 'border-line bg-surface hover:border-primary/30 hover:bg-surface-alt',
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
                      isSelected ? 'border-primary bg-primary text-white' : 'border-line-strong',
                    )}>
                      {isSelected && <CheckCircle2 size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                          {TYPE_LABEL[q.type] ?? q.type}
                        </span>
                        {q.category && (
                          <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] text-muted">
                            {q.category.name}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-ink">{q.question}</p>
                    </div>
                    <div className="shrink-0 text-muted">
                      {isSelected ? <Minus size={14} className="text-primary" /> : <Plus size={14} />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-line pt-4">
            <Button variant="ghost" onClick={skipSoal} className="text-muted">
              Lewati
            </Button>
            <div className="flex-1" />
            <Button
              onClick={handleAttach}
              disabled={attaching || selected.size === 0}
              className="gap-2"
            >
              <CheckCircle2 size={15} />
              {attaching ? 'Menambahkan...' : `Tambahkan ${selected.size} Soal`}
            </Button>
          </div>
        </Card>
      )}

      {/* ── Navigasi step ── */}
      {step !== 'soal' && (
        <div className="flex items-center gap-3">
          {step !== 'info' && (
            <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'pengaturan' : 'info')}>
              <ArrowLeft size={15} className="mr-1" /> Sebelumnya
            </Button>
          )}
          <div className="flex-1" />
          {step !== 'preview' ? (
            <Button onClick={handleNext}>Selanjutnya</Button>
          ) : (
            <Button onClick={handleSaveAndPilihSoal} disabled={saving} className="gap-2">
              <Save size={15} />
              {saving ? 'Menyimpan…' : 'Simpan & Pilih Soal'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
