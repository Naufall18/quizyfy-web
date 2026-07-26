import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Wallet, History, TrendingUp, ShieldCheck } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'

interface AdminStats {
  total_users: number
  active_subscriptions: number
  total_transactions: number
  revenue_this_month: number
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    adminApi
      .stats()
      .then((res) => {
        if (active) setStats(res.data as AdminStats)
      })
      .catch(() => {
        if (active) setStats(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const statCards = [
    {
      label: 'Total Pengguna',
      value: stats?.total_users ?? 0,
      icon: Users,
      color: 'bg-primary-soft text-primary',
      to: '/admin/pengguna',
    },
    {
      label: 'Langganan Aktif',
      value: stats?.active_subscriptions ?? 0,
      icon: Wallet,
      color: 'bg-success-soft text-success',
      to: '/admin/paket',
    },
    {
      label: 'Total Transaksi',
      value: stats?.total_transactions ?? 0,
      icon: History,
      color: 'bg-accent-soft text-accent',
      to: '/admin/transaksi',
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: stats ? formatRupiah(stats.revenue_this_month) : 'Rp —',
      icon: TrendingUp,
      color: 'bg-warning-soft text-warning',
      to: '/admin/transaksi',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Dashboard Admin</h1>
          <p className="mt-1 text-muted">
            Ringkasan platform: pengguna, langganan, dan transaksi.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold text-primary">
          <ShieldCheck size={15} />
          Mode Admin
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          : statCards.map((card) => (
              <Link to={card.to} key={card.label}>
                <Card className="flex cursor-pointer items-center gap-4 transition-shadow hover:shadow-md">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${card.color}`}
                  >
                    <card.icon size={22} />
                  </span>
                  <div>
                    <div className="text-2xl font-extrabold text-ink">{card.value}</div>
                    <div className="text-sm text-muted">{card.label}</div>
                  </div>
                </Card>
              </Link>
            ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-base font-extrabold text-ink">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/pengguna">
            <Button variant="outline" size="sm" className="gap-2">
              <Users size={15} />
              Kelola Pengguna
            </Button>
          </Link>
          <Link to="/admin/paket">
            <Button variant="outline" size="sm" className="gap-2">
              <Wallet size={15} />
              Kelola Paket
            </Button>
          </Link>
          <Link to="/admin/transaksi">
            <Button variant="outline" size="sm" className="gap-2">
              <History size={15} />
              Riwayat Transaksi
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
