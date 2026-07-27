import { Link } from 'react-router-dom'
import { Home, ArrowLeft, BookOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { homePathFor } from '../store/authStore'

export function NotFound() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      {/* Angka 404 */}
      <div className="select-none text-[120px] font-extrabold leading-none tracking-tighter text-primary/10">
        404
      </div>

      <div className="mt-2 space-y-2">
        <h1 className="text-2xl font-extrabold text-ink">Halaman Tidak Ditemukan</h1>
        <p className="max-w-sm text-muted">
          Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau tidak pernah ada.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {user ? (
          <Link
            to={homePathFor(user.role)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-700"
          >
            <Home size={17} />
            Ke Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-700"
          >
            <Home size={17} />
            Ke Beranda
          </Link>
        )}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-surface-alt"
        >
          <ArrowLeft size={17} />
          Kembali
        </button>
      </div>

      {!user && (
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <BookOpen size={14} />
            Masuk ke akun
          </Link>
        </div>
      )}
    </div>
  )
}
