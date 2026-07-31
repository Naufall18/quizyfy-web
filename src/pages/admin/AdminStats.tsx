import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Wallet, History, TrendingUp, BookOpen,
  ClipboardList, ArrowRight, Activity,
} from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Card } from '../../components/ui/Card'
import { cn } from '../../lib/cn'

interface AdminStats {
  total_users: number
  active_subscriptions: number
  total_transactions: number
  revenue_this_month: number
}

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string | number
  color: string
  to?: string
  trend?: string
}

function StatCard({ icon: Icon, label, value, color, to, trend }: StatCardProps) {
  const inner = (
    <Card className={cn('group transition-shadow hover:shadow-md', to && 'cursor-pointer')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{value}</p>
          {trend && (
            <p className="mt-1 text-xs font-semibold text-success">{trend}</p>
          )}
        </div>
        <span className={cn('grid h-11 w-11 place-items-center rounded-2xl', color)}>
          <Icon size={22} />
        </span>
      </div>
      {to && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-muted group-hover:text-primary transition-colors">
          Lihat detail <ArrowRight size={12} />
        </div>
      )}
    </Card>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats()
      .then((res) => setStats(res.data?.data ?? res.data as AdminStats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards: StatCardProps[] = [
    {
      icon: Users,
      label: 'Total Pengguna',
      value: stats?.total_users ?? '—',
      color: 'bg-primary-soft text-primary',
      to: '/admin/pengguna',
    },
    {
      icon: Wallet,
      label: 'Langganan Aktif',
      value: stats?.active_subscriptions ?? '—',
      color: 'bg-success-soft text-success',
      to: '/admin/paket',
    },
    {
      icon: History,
      label: 'Total Transaksi',
      value: stats?.total_transactions ?? '—',
      color: 'bg-accent-soft text-accent',
      to: '/admin/transaksi',
    },
    {
      icon: TrendingUp,
      label: 'Pendapatan Bulan Ini',
      value: stats ? formatRupiah(stats.revenue_this_month) : '—',
      color: 'bg-warning-soft text-warning',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Statistik Platform</h1>
          <p className="mt-1 text-muted">Ringkasan real-time platform Quizyfy.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-sm font-bold text-success">
          <Activity size={14} />
          Live Data
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-base font-extrabold text-ink">Kelola Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/admin/pengguna', icon: Users, label: 'Manajemen Pengguna', desc: 'Kelola akun guru & siswa', color: 'bg-primary-soft text-primary' },
            { to: '/admin/paket', icon: Wallet, label: 'Paket Langganan', desc: 'Buat & edit paket premium', color: 'bg-success-soft text-success' },
            { to: '/admin/transaksi', icon: History, label: 'Riwayat Transaksi', desc: 'Monitor pembayaran masuk', color: 'bg-accent-soft text-accent' },
            { to: '/admin/pengaturan', icon: ClipboardList, label: 'Pengaturan Sistem', desc: 'Konfigurasi global platform', color: 'bg-warning-soft text-warning' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors', item.color)}>
                <item.icon size={20} />
              </span>
              <div>
                <div className="font-bold text-ink">{item.label}</div>
                <div className="text-sm text-muted">{item.desc}</div>
              </div>
              <ArrowRight size={16} className="ml-auto text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>

      {/* Info platform */}
      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-extrabold text-ink">
          <BookOpen size={18} className="text-primary" />
          Tentang Platform
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          {[
            { label: 'Versi Platform', value: 'Quizyfy v1.0' },
            { label: 'Stack Teknologi', value: 'React 19 + Laravel 12' },
            { label: 'Mode', value: 'Produksi' },
          ].map((r) => (
            <div key={r.label} className="rounded-xl bg-surface-alt px-4 py-3">
              <div className="text-xs font-semibold text-muted">{r.label}</div>
              <div className="mt-0.5 font-bold text-ink">{r.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
