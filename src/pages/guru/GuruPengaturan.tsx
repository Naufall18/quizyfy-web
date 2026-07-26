import { useState } from 'react'
import { User, Mail, Lock, Save, Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { toast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export function GuruPengaturan() {
  const user = useAuthStore((s) => s.user)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nama tidak boleh kosong'); return }
    setSaving(true)
    try {
      await api.put('/user/profile', { name, email })
      toast.success('Profil berhasil diperbarui')
    } catch {
      toast.error('Gagal menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { toast.warning('Password baru minimal 8 karakter'); return }
    if (newPassword !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return }
    setSavingPw(true)
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      toast.success('Password berhasil diubah')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      toast.error('Password saat ini salah atau terjadi error.')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Pengaturan Akun</h1>
        <p className="mt-1 text-muted">Perbarui informasi profil dan keamanan akunmu.</p>
      </div>

      {/* Avatar + info */}
      <Card className="flex items-center gap-5">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-3xl font-extrabold text-primary">
          {user?.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="text-lg font-extrabold text-ink">{user?.name}</div>
          <div className="text-sm text-muted">{user?.email}</div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
            <BookOpen size={11} />
            Guru
          </span>
        </div>
      </Card>

      {/* Form profil */}
      <Card>
        <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
          <User size={18} className="text-primary" />
          Informasi Profil
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Nama Lengkap</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button type="submit" size="sm" className="gap-2" disabled={saving}>
            <Save size={15} />
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </Card>

      {/* Ganti password */}
      <Card>
        <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-ink">
          <Lock size={18} className="text-primary" />
          Ganti Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Password Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 pr-11 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">Minimal 8 karakter</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 pr-11 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" size="sm" variant="outline" className="gap-2" disabled={savingPw}>
            <Lock size={15} />
            {savingPw ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
