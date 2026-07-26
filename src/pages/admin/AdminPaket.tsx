import { useEffect, useState } from 'react'
import { Wallet, Plus, Edit2, Check, X } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
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
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function PackageCard({ pkg, onEdit }: { pkg: Package; onEdit: (p: Package) => void }) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border p-6 transition-shadow hover:shadow-md',
      pkg.is_active ? 'border-primary/30 bg-surface' : 'border-line bg-surface-alt opacity-60',
    )}>
      {pkg.is_active && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
          <Check size={11} />
          Aktif
        </span>
      )}
      {!pkg.is_active && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-bold text-muted">
          <X size={11} />
          Nonaktif
        </span>
      )}

      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft">
        <Wallet size={22} className="text-primary" />
      </div>

      <h3 className="text-lg font-extrabold text-ink">{pkg.name}</h3>
      {pkg.description && <p className="mt-1 text-sm text-muted">{pkg.description}</p>}

      <div className="my-5 text-3xl font-extrabold text-ink">
        {formatRupiah(pkg.price)}
        <span className="ml-1 text-sm font-normal text-muted">/ {pkg.duration_days} hari</span>
      </div>

      <ul className="mb-6 space-y-2 text-sm text-muted">
        {pkg.max_exams && (
          <li className="flex items-center gap-2">
            <Check size={13} className="text-success" />
            Maks. {pkg.max_exams} ujian
          </li>
        )}
        {pkg.max_questions && (
          <li className="flex items-center gap-2">
            <Check size={13} className="text-success" />
            Maks. {pkg.max_questions} soal per ujian
          </li>
        )}
      </ul>

      <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEdit(pkg)}>
        <Edit2 size={13} />
        Edit Paket
      </Button>
    </div>
  )
}

export function AdminPaket() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Package | null>(null)

  useEffect(() => {
    let active = true
    adminApi
      .packages()
      .then((res) => { if (active) setPackages((res.data as { data?: Package[] }).data ?? res.data as Package[]) })
      .catch(() => { if (active) setPackages([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function handleSave() {
    if (!editTarget) return
    try {
      await adminApi.updatePackage(editTarget.id, editTarget)
      setPackages((prev) => prev.map((p) => p.id === editTarget.id ? editTarget : p))
      toast.success('Paket berhasil diperbarui')
      setEditTarget(null)
    } catch {
      toast.error('Gagal menyimpan paket.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Paket Langganan</h1>
          <p className="mt-1 text-muted">Kelola paket yang tersedia untuk guru.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus size={16} />
          Buat Paket Baru
        </Button>
      </div>

      {/* Grid paket */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : packages.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <Wallet size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">Belum ada paket</p>
          <p className="mt-1 text-sm text-muted">Buat paket pertama untuk guru.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} onEdit={setEditTarget} />
          ))}
        </div>
      )}

      {/* Edit modal sederhana */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-extrabold text-ink">Edit Paket: {editTarget.name}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink">Harga (Rp)</label>
                <input
                  type="number"
                  value={editTarget.price}
                  onChange={(e) => setEditTarget({ ...editTarget, price: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink">Durasi (hari)</label>
                <input
                  type="number"
                  value={editTarget.duration_days}
                  onChange={(e) => setEditTarget({ ...editTarget, duration_days: Number(e.target.value) })}
                  className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editTarget.is_active}
                  onChange={(e) => setEditTarget({ ...editTarget, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-ink">Paket aktif</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>Batal</Button>
              <Button size="sm" onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
