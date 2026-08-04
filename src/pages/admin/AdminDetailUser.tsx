import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, Shield, ShieldOff,
  Calendar, CreditCard, BookOpen, TrendingUp,
} from 'lucide-react'
import { adminApi } from '../../lib/api'
import type { AdminUser, TransactionHistory } from '../../types'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

const STATUS_STYLE: Record<string, string> = {
  success: 'bg-success-soft text-success',
  pending: 'bg-warning-soft text-warning',
  failed: 'bg-danger-soft text-danger',
  cancelled: 'bg-surface-alt text-muted',
}

const STATUS_LABEL: Record<string, string> = {
  success: 'Berhasil',
  pending: 'Menunggu',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-line last:border-0">
      <span className="w-36 shrink-0 text-sm font-semibold text-muted">{label}</span>
      <span className="text-sm text-ink">{value ?? '—'}</span>
    </div>
  )
}

export function AdminDetailUser() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      adminApi.userDetail(Number(id)),
      adminApi.transactions({ page: 1 }),
    ])
      .then(([userRes, txRes]) => {
        const u = userRes.data?.data ?? userRes.data
        setUser(u)
        // Filter transaksi milik user ini jika API return semua
        const allTx = txRes.data?.data ?? txRes.data?.transactions ?? []
        setTransactions(
          Array.isArray(allTx)
            ? allTx.filter((t: TransactionHistory) => t.user_id === Number(id))
            : []
        )
      })
      .catch(() => toast.error('Gagal memuat data pengguna.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggleBan() {
    if (!user) return
    setToggling(true)
    try {
      if (user.is_banned) {
        await adminApi.unbanUser(user.id)
        setUser((u) => u ? { ...u, is_banned: false } : u)
        toast.success(`${user.name} berhasil di-unban`)
      } else {
        await adminApi.banUser(user.id)
        setUser((u) => u ? { ...u, is_banned: true } : u)
        toast.warning(`${user.name} berhasil di-ban`)
      }
    } catch {
      toast.error('Gagal mengubah status pengguna.')
    } finally {
      setToggling(false)
    }
  }

  const ROLE_LABEL: Record<string, string> = { admin: 'Admin', guru: 'Guru', user: 'Siswa' }
  const ROLE_STYLE: Record<string, string> = {
    admin: 'bg-primary-soft text-primary',
    guru: 'bg-accent-soft text-accent',
    user: 'bg-success-soft text-success',
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="font-semibold text-ink">Pengguna tidak ditemukan</p>
        <Link to="/admin/pengguna" className="mt-2 text-sm text-primary hover:underline">
          Kembali ke daftar pengguna
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/admin/pengguna">
          <button className="grid h-9 w-9 place-items-center rounded-xl border border-line text-muted transition-colors hover:bg-surface-alt">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-ink">Detail Pengguna</h1>
          <p className="text-sm text-muted">ID: #{user.id}</p>
        </div>
        {user.role !== 'admin' && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-1.5',
              user.is_banned
                ? 'border-success/40 text-success hover:bg-success-soft'
                : 'border-danger/40 text-danger hover:bg-danger-soft',
            )}
            onClick={handleToggleBan}
            disabled={toggling}
          >
            {user.is_banned ? <Shield size={14} /> : <ShieldOff size={14} />}
            {user.is_banned ? 'Unban' : 'Ban'}
          </Button>
        )}
      </div>

      {/* Info pengguna */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-2xl font-extrabold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink">{user.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', ROLE_STYLE[user.role] ?? 'bg-surface-alt text-muted')}>
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-bold',
                user.is_banned ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
              )}>
                {user.is_banned ? 'Diblokir' : 'Aktif'}
              </span>
              {user.active_subscription && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                  {user.active_subscription}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-line">
          <InfoRow label={<span className="flex items-center gap-1.5"><Mail size={13} /> Email</span> as unknown as string} value={user.email} />
          <InfoRow label={<span className="flex items-center gap-1.5"><Phone size={13} /> Telepon</span> as unknown as string} value={user.phone} />
          <InfoRow label={<span className="flex items-center gap-1.5"><Calendar size={13} /> Bergabung</span> as unknown as string} value={user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
          <InfoRow label={<span className="flex items-center gap-1.5"><User size={13} /> Email Verified</span> as unknown as string} value={user.email_verified_at ? '✅ Terverifikasi' : '❌ Belum diverifikasi'} />
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <BookOpen size={18} className="mx-auto mb-1 text-primary" />
          <div className="text-2xl font-extrabold text-ink">{user.total_exams_taken ?? 0}</div>
          <div className="text-xs font-semibold text-muted">Ujian Dikerjakan</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <CreditCard size={18} className="mx-auto mb-1 text-warning" />
          <div className="text-2xl font-extrabold text-ink">{user.total_transactions ?? transactions.length}</div>
          <div className="text-xs font-semibold text-muted">Total Transaksi</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center col-span-2 sm:col-span-1">
          <TrendingUp size={18} className="mx-auto mb-1 text-success" />
          <div className="text-lg font-extrabold text-ink truncate">{user.active_subscription ?? 'Gratis'}</div>
          <div className="text-xs font-semibold text-muted">Paket Aktif</div>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-extrabold text-ink">Riwayat Transaksi</h3>
          <span className="text-sm text-muted">{transactions.length} transaksi</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard size={28} className="mx-auto mb-2 text-muted-soft" />
            <p className="text-sm text-muted">Belum ada riwayat transaksi</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt text-left">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Paket</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Jumlah</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-line hover:bg-surface-alt transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">{tx.package_name}</div>
                    <div className="text-xs text-muted">{tx.duration_days} hari · {tx.payment_method ?? 'N/A'}</div>
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-ink">
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', STATUS_STYLE[tx.status] ?? 'bg-surface-alt text-muted')}>
                      {STATUS_LABEL[tx.status] ?? tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">
                    {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
