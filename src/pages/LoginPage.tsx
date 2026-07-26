import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import axios from 'axios'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from '../components/ui/Toast'
import { useAuthStore, homePathFor } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError('')

    // Validasi client-side sederhana
    if (!email.includes('@')) {
      setFieldError('Format email tidak valid.')
      return
    }
    if (password.length < 6) {
      setFieldError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Selamat datang kembali, ${user.name.split(' ')[0]}!`)
      navigate(homePathFor(user.role), { replace: true })
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Gagal masuk. Periksa email & password lalu coba lagi.'
      setFieldError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">Quizyfy</span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Selamat datang!</h1>
          <p className="mt-2 text-muted">Masuk untuk melanjutkan ke akunmu.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@sekolah.sch.id"
              icon={<Mail size={17} />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldError('')
              }}
            />
            <div>
              <Input
                label="Password"
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<Lock size={17} />}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFieldError('')
                }}
                error={fieldError || undefined}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPw ? 'Sembunyikan' : 'Tampilkan'} password
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      {/* Panel ilustrasi */}
      <div className="hidden items-center justify-center bg-primary-soft lg:flex">
        <div className="max-w-md px-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary text-white shadow-lg">
            <GraduationCap size={40} />
          </div>
          <h2 className="mt-8 text-2xl font-extrabold text-ink">
            Satu platform untuk semua kebutuhan ujian
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Bank soal, ujian ber-timer, penilaian otomatis, dan laporan nilai —
            untuk guru, siswa, dan admin.
          </p>
        </div>
      </div>
    </div>
  )
}
