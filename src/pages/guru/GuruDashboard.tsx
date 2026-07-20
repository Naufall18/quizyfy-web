import { ClipboardList, Users } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'

export function GuruDashboard() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        <h1 className="text-2xl font-extrabold">Halo, {user?.name?.split(' ')[0]}!</h1>
        <p className="mt-1 text-white/85">
          Kelola bank soal dan ujianmu dari sini. Buat ujian baru dalam hitungan menit.
        </p>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <ClipboardList size={24} />
          </span>
          <div>
            <div className="text-2xl font-extrabold text-ink">—</div>
            <div className="text-sm text-muted">Total ujian dibuat</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Users size={24} />
          </span>
          <div>
            <div className="text-2xl font-extrabold text-ink">—</div>
            <div className="text-sm text-muted">Siswa mengikuti ujian</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
