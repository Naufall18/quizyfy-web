import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Clock, BarChart2 } from 'lucide-react'
import { guruApi } from '../../lib/api'
import type { Exam } from '../../types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

export function GuruEditUjian() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [titles, setTitles] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number>(60)
  const [kkmScore, setKkmScore] = useState<number>(75)
  const [instructions, setInstructions] = useState('')
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('nonaktif')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    guruApi.examDetail(Number(id))
      .then((res) => {
        const exam: Exam = res.data?.data ?? res.data
        setTitles(exam.titles ?? '')
        setDescription(exam.description ?? '')
        setDurationMinutes(exam.duration_minutes ?? 60)
        setKkmScore(exam.kkm_score ?? 75)
        setInstructions(exam.instructions ?? '')
        setStatus((exam.status === 'aktif' ? 'aktif' : 'nonaktif') as 'aktif' | 'nonaktif')
        setStartTime(exam.start_time ? exam.start_time.slice(0, 16) : '')
        setEndTime(exam.end_time ? exam.end_time.slice(0, 16) : '')
      })
      .catch(() => toast.error('Gagal memuat data ujian.'))
      .finally(() => setLoading(false))
  }, [id])

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!titles.trim()) errs.titles = 'Judul wajib diisi'
    if (durationMinutes < 5) errs.duration = 'Durasi minimal 5 menit'
    if (kkmScore < 0 || kkmScore > 100) errs.kkm = 'KKM harus 0–100'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate() || !id) return
    setSaving(true)
    try {
      await guruApi.updateExam(Number(id), {
        titles,
        description,
        duration_minutes: durationMinutes,
        kkm_score: kkmScore,
        instructions: instructions || null,
        status,
        start_time: startTime || null,
        end_time: endTime || null,
      })
      toast.success('Ujian berhasil diperbarui!')
      navigate(`/guru/ujian/${id}`)
    } catch {
      toast.error('Gagal menyimpan ujian.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/guru/ujian/${id}`}>
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-ink">Edit Ujian</h1>
          <p className="text-sm text-muted">Perbarui informasi dan pengaturan ujian</p>
        </div>
      </div>

      {/* Form Informasi */}
      <Card className="space-y-5">
        <h2 className="font-extrabold text-ink">Informasi Ujian</h2>
        <Input
          label="Judul Ujian"
          value={titles}
          onChange={(e) => { setTitles(e.target.value); setErrors((p) => ({ ...p, titles: '' })) }}
          error={errors.titles}
        />
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Deskripsi</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Instruksi / Tata Tertib <span className="text-muted">(opsional)</span>
          </label>
          <textarea
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </Card>

      {/* Form Pengaturan */}
      <Card className="space-y-5">
        <h2 className="font-extrabold text-ink">Pengaturan Ujian</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Durasi (menit)"
            type="number"
            min={5}
            icon={<Clock size={15} />}
            value={durationMinutes}
            onChange={(e) => { setDurationMinutes(Number(e.target.value)); setErrors((p) => ({ ...p, duration: '' })) }}
            error={errors.duration}
          />
          <Input
            label="Nilai KKM"
            type="number"
            min={0}
            max={100}
            icon={<BarChart2 size={15} />}
            value={kkmScore}
            onChange={(e) => { setKkmScore(Number(e.target.value)); setErrors((p) => ({ ...p, kkm: '' })) }}
            error={errors.kkm}
          />
          <Input
            label="Waktu Mulai"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Waktu Berakhir"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
          <div className="flex gap-3">
            {(['nonaktif', 'aktif'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold capitalize transition-all',
                  status === s
                    ? s === 'aktif'
                      ? 'border-success bg-success-soft text-success'
                      : 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-surface text-muted hover:bg-surface-alt',
                )}
              >
                {s === 'aktif' ? '✅ Aktif' : '⏸ Nonaktif'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/guru/ujian/${id}`} className="flex-1">
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
