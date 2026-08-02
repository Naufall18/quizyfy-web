import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Users, Database, TrendingUp, Plus } from 'lucide-react'
import { guruApi } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'

interface GuruStats {
  total_exams: number
  active_exams: number
  total_students: number
  total_questions: number
}

export function GuruDashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<GuruStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    guruApi
      .stats()
      .then((res) => {
        if (active) setStats(res.data as GuruStats)
      })
      .catch(() => {
        // API belum ready — tampilkan placeholder
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
      label: 'Total Ujian Dibuat',
      value: stats?.total_exams ?? 0,
      icon: ClipboardList,
      color: 'bg-primary-soft text-primary',
    },
    {
      label: 'Ujian Aktif',
      value: stats?.active_exams ?? 0,
      icon: TrendingUp,
      color: 'bg-success-soft text-success',
    },
    {
      label: 'Siswa Mengikuti',
      value: stats?.total_students ?? 0,
      icon: Users,
      color: 'bg-accent-soft text-accent',
    },
    {
      label: 'Total Soal di Bank',
      value: stats?.total_questions ?? 0,
      icon: Database,
      color: 'bg-warning-soft text-warning',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">
            Halo, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 text-muted">
            Kelola bank soal dan ujianmu dari sini.
          </p>
        </div>
        <Link to="/guru/ujian/buat">
          <Button size="sm" className="gap-2">
            <Plus size={16} />
            Buat Ujian Baru
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))
          : statCards.map((card) => (
              <Card key={card.label} className="flex items-center gap-4">
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
            ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/guru/ujian"
          className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ClipboardList size={20} />
          </span>
          <div>
            <div className="font-bold text-ink">Daftar Ujian</div>
            <div className="text-sm text-muted">Kelola ujian yang telah dibuat</div>
          </div>
        </Link>
        <Link
          to="/guru/bank-soal"
          className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <Database size={20} />
          </span>
          <div>
            <div className="font-bold text-ink">Bank Soal</div>
            <div className="text-sm text-muted">Buat dan kelola soal ujian</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
