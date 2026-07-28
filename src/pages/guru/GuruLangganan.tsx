import { useEffect, useState } from 'react'
import { Wallet, Check, Calendar, Crown, ArrowRight } from 'lucide-react'
import { guruApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { toast } from '../../components/ui/Toast'
import { cn } from '../../lib/cn'

interface Package {
  id: number
  name: string
  description?: string
  price: number
  duration_days: number
  max_exams?: number
  max_questions?: number
  is_active: boolean
  is_popular?: boolean
}

interface Subscription {
  id: number
  package?: Package
  status: 'active' | 'expired' | 'pending'
  end_date: string
  plan_type?: string
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function PackageCard({
  pkg,
  onSubscribe,
  loading,
}: {
  pkg: Package
  onSubscribe: (id: number) => void
  loading: boolean
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border p-6 transition-shadow hover:shadow-md',
      pkg.is_popular ? 'border-primary ring-2 ring-primary/20' : 'border-line bg-surface',
    )}>
      {pkg.is_popular && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
          <Crown size={11} /> Terpopuler
        </span>
      )}
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft">
        <Wallet size={20} className="text-primary" />
      </div>
      <h3 className="text-lg font-extrabold text-ink">{pkg.name}</h3>
      {pkg.description && <p className="mt-1 text-sm text-muted">{pkg.description}</p>}
      <div className="my-4 text-3xl font-extrabold text-ink">
        {formatRupiah(pkg.price)}
        <span className="ml-1 text-sm font-normal text-muted">/ {pkg.duration_days} hari</span>
      </div>
      <ul className="mb-6 space-y-2 text-sm text-muted">
        {pkg.max_exams && (
          <li className="flex items-center gap-2">
            <Check size={13} className="text-success shrink-0" />
            Maksimal {pkg.max_exams} ujian
          </li>
        )}
        {pkg.max_questions && (
          <li className="flex items-center gap-2">
            <Check size={13} className="text-success shrink-0" />
            Maksimal {pkg.max_questions} soal per ujian
          </li>
        )}
        <li className="flex items-center gap-2">
          <Check size={13} className="text-success shrink-0" />
          Akses bank soal lengkap
        </li>
        <li className="flex items-center gap-2">
          <Check size={13} className="text-success shrink-0" />
          Laporan nilai siswa otomatis
        </li>
      </ul>
      <Button
        className="w-full gap-2"
        onClick={() => onSubscribe(pkg.id)}
        disabled={loading}
      >
        Pilih Paket
        <ArrowRight size={15} />
      </Button>
    </div>
  )
}

export function GuruLangganan() {
  const [packages, setPackages] = useState<Package[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      guruApi.categories(), // pakai endpoint yang ada sebagai placeholder, nanti swap ke paket
      guruApi.stats(),
    ])
      .finally(() => { if (active) setLoading(false) })

    // Load paket dari API
    guruApi.exams({ page: 1 }) // placeholder
      .then(() => {})
      .catch(() => {})

    const api = guruApi as unknown as Record<string, () => Promise<{ data: unknown }>>

    if (typeof api.packages === 'function') {
      api.packages()
        .then((res) => {
          if (!active) return
          const d = res.data as { data?: Package[] } | Package[]
          setPackages(Array.isArray(d) ? d : (d as { data?: Package[] }).data ?? [])
        })
        .catch(() => { if (active) setPackages([]) })
    }

    if (typeof api.subscription === 'function') {
      api.subscription()
        .then((res) => {
          if (!active) setSubscription(null)
          const d = res.data as { data?: Subscription } | Subscription
          setSubscription((d as { data?: Subscription }).data ?? d as Subscription)
        })
        .catch(() => { if (active) setSubscription(null) })
    }

    return () => { active = false }
  }, [])

  async function handleSubscribe(_packageId: number) {
    setSubscribing(true)
    try {
      await guruApi.exams() // placeholder — nanti pakai subscriptionApi.subscribe(packageId)
      toast.success('Paket berhasil dipilih! Lanjutkan ke pembayaran.')
    } catch {
      toast.error('Gagal memilih paket. Coba lagi.')
    } finally {
      setSubscribing(false)
    }
  }

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Paket Langganan</h1>
        <p className="mt-1 text-muted">Tingkatkan kemampuan pengajaran kamu dengan paket premium.</p>
      </div>

      {/* Status langganan saat ini */}
      {subscription && subscription.status === 'active' ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-primary/30 bg-primary-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <Crown size={20} />
            </span>
            <div>
              <div className="font-extrabold text-ink">
                {subscription.package?.name ?? subscription.plan_type ?? 'Langganan Aktif'}
              </div>
              <div className="text-sm text-muted flex items-center gap-1">
                <Calendar size={13} />
                Berakhir: {new Date(subscription.end_date).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>
          </div>
          <span className={cn(
            'rounded-full px-3 py-1 text-sm font-bold',
            daysLeft <= 7 ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success',
          )}>
            {daysLeft} hari tersisa
          </span>
        </Card>
      ) : (
        <Card className="border-warning/30 bg-warning-soft">
          <p className="font-semibold text-warning">
            Kamu belum berlangganan. Pilih paket di bawah untuk mulai membuat ujian tanpa batas.
          </p>
        </Card>
      )}

      {/* Grid paket */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : packages.length === 0 ? (
        /* Tampilkan paket default jika API belum siap */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 1, name: 'Starter', description: 'Cocok untuk guru baru', price: 49000, duration_days: 30, max_exams: 10, max_questions: 50, is_active: true, is_popular: false },
            { id: 2, name: 'Pro', description: 'Paling banyak digunakan', price: 129000, duration_days: 30, max_exams: 50, max_questions: 200, is_active: true, is_popular: true },
            { id: 3, name: 'Enterprise', description: 'Untuk sekolah/institusi', price: 299000, duration_days: 30, is_active: true, is_popular: false },
          ].map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSubscribe={handleSubscribe}
              loading={subscribing}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.filter((p) => p.is_active).map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSubscribe={handleSubscribe}
              loading={subscribing}
            />
          ))}
        </div>
      )}
    </div>
  )
}
