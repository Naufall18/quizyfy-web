import { Users, Wallet } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dashboard Admin</h1>
        <p className="mt-1 text-muted">Ringkasan platform: pengguna, langganan, dan transaksi.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Users size={24} />
          </span>
          <div>
            <div className="text-2xl font-extrabold text-ink">—</div>
            <div className="text-sm text-muted">Total pengguna</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success-soft text-success">
            <Wallet size={24} />
          </span>
          <div>
            <div className="text-2xl font-extrabold text-ink">—</div>
            <div className="text-sm text-muted">Langganan aktif</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
