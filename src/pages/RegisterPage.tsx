import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, GraduationCap, BookOpen, PenLine } from 'lucide-react'
import axios from 'axios'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/cn'
import { toast } from '../components/ui/Toast'
import { useAuthStore, homePathFor } from '../store/authStore'

type RegisterRole = 'user' | 'guru'

const roleOptions: { value: RegisterRole; label: string; desc: string; icon: typeof BookOpen }[] = [
  { value: 'user', label: 'Siswa', desc: 'Ikut & kerjakan ujian', icon: BookOpen },
  { value: 'guru', label: 'Guru', desc: 'Buat soal & kelola ujian', icon: PenLine },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [role, setRole] = useState<RegisterRole>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (name.trim().length < 2) return 'Nama minimal 2 karakter.'
    if (!email.includes('@')) return 'Format email tidak valid.'
    if (password.length < 6) return 'Password minimal 6 karakter.'
    if (password !== confirm) return 'Konfirmasi password tidak sama.'
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError('')

    const err = validate()
    if (err) {
      setFieldError(err)
      toast.warning(err)
      return
    }

    setLoading(true)
    try {
      const user = await register({ name, email, password, passwordConfirmation: confirm, role })
      toast.success(`Akun berhasil dibuat! Selamat datang, ${user.name.split(' ')[0]}!`)
      navigate(homePathFor(user.role), { replace: true })
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Gagal mendaftar. Coba beberapa saat lagi.'
      setFieldError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">Quizyfy</span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Buat akun</h1>
          <p className="mt-2 text-muted">Gratis untuk mulai — pilih peranmu dulu.</p>

          {/* Pilih peran */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all',
                  role === opt.value
                    ? 'border-primary bg-primary-soft ring-2 ring-primary/30'
                    : 'border-line-strong bg-surface hover:bg-surface-alt hover:border-primary/30',
                )}
              >
                <opt.icon
                  size={20}
                  className={role === opt.value ? 'text-primary' : 'text-muted'}
                />
                <div className="mt-2 text-sm font-bold text-ink">{opt.label}</div>
                <div className="mt-0.5 text-xs text-muted">{opt.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Input
              label="Nama lengkap"
              name="name"
              required
              autoComplete="name"
              placeholder="Nama sesuai identitas"
              icon={<User size={17} />}
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldError('') }}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@sekolah.sch.id"
              icon={<Mail size={17} />}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              icon={<Lock size={17} />}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldError('') }}
            />
            <Input
              label="Konfirmasi password"
              name="password_confirmation"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Ulangi password"
              icon={<Lock size={17} />}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setFieldError('') }}
              error={fieldError || undefined}
            />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Memproses…' : `Daftar sebagai ${role === 'guru' ? 'Guru' : 'Siswa'}`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center bg-primary-soft lg:flex">
        <div className="max-w-md px-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary text-white shadow-lg">
            <GraduationCap size={40} />
          </div>
          <h2 className="mt-8 text-2xl font-extrabold text-ink">Bergabung dengan Quizyfy</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Guru menyusun ujian dalam hitungan menit; siswa mengerjakan dari perangkat mana pun
            dengan nilai yang keluar otomatis.
          </p>
        </div>
      </div>
    </div>
  )
}
