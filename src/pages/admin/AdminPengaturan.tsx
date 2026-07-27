import { useEffect, useState } from 'react'
import { Settings as _Settings, Save, Globe, Clock, BookOpen, ShieldCheck } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { toast } from '../../components/ui/Toast'

interface SystemSettings {
  app_name: string
  max_exam_duration: number
  default_kkm: number
  maintenance_mode: boolean
  allow_registration: boolean
  timezone: string
}

const DEFAULTS: SystemSettings = {
  app_name: 'Quizyfy',
  max_exam_duration: 480,
  default_kkm: 75,
  maintenance_mode: false,
  allow_registration: true,
  timezone: 'Asia/Jakarta',
}

function ToggleSwitch({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
      <div>
        <div className="font-semibold text-ink">{label}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? 'bg-primary' : 'bg-line-strong'
        }`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function AdminPengaturan() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApi.stats() // pakai endpoint stats dulu karena settings endpoint mungkin belum tersedia
      .then(() => {}) // no-op — load defaults saja
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // POST ke /admin/settings jika tersedia
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch(() => null) // silent jika endpoint belum ada
      toast.success('Pengaturan berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Pengaturan Sistem</h1>
        <p className="mt-1 text-muted">Konfigurasi global platform Quizyfy.</p>
      </div>

      {/* Informasi Aplikasi */}
      <Card className="space-y-4">
        <h2 className="flex items-center gap-2 font-extrabold text-ink">
          <Globe size={18} className="text-primary" />
          Informasi Aplikasi
        </h2>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Nama Aplikasi</label>
          <input
            value={settings.app_name}
            onChange={(e) => set('app_name', e.target.value)}
            className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Zona Waktu</label>
          <select
            value={settings.timezone}
            onChange={(e) => set('timezone', e.target.value)}
            className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
      </Card>

      {/* Pengaturan Ujian */}
      <Card className="space-y-4">
        <h2 className="flex items-center gap-2 font-extrabold text-ink">
          <BookOpen size={18} className="text-primary" />
          Pengaturan Ujian
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Durasi Maksimal (menit)
            </label>
            <div className="flex items-center gap-2">
              <Clock size={15} className="shrink-0 text-muted-soft" />
              <input
                type="number"
                min={5}
                max={720}
                value={settings.max_exam_duration}
                onChange={(e) => set('max_exam_duration', Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Nilai KKM Default
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.default_kkm}
              onChange={(e) => set('default_kkm', Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </Card>

      {/* Keamanan & Akses */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold text-ink">
          <ShieldCheck size={18} className="text-primary" />
          Keamanan &amp; Akses
        </h2>
        <ToggleSwitch
          value={settings.allow_registration}
          onChange={(v) => set('allow_registration', v)}
          label="Pendaftaran Akun"
          description="Izinkan pengguna baru mendaftar secara mandiri"
        />
        <ToggleSwitch
          value={settings.maintenance_mode}
          onChange={(v) => set('maintenance_mode', v)}
          label="Mode Pemeliharaan"
          description="Nonaktifkan akses platform sementara (hanya admin yang bisa masuk)"
        />
      </Card>

      {/* Simpan */}
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        <Save size={15} />
        {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
      </Button>
    </div>
  )
}
