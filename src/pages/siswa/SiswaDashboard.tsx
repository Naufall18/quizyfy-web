import { BookOpenCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'

export function SiswaDashboard() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        <h1 className="text-2xl font-extrabold">Halo, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="mt-1 text-white/85">
          Siap mengerjakan ujian hari ini? Cek daftar ujian aktifmu di menu Ujian.
        </p>
      </Card>

      <Card className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-warning-soft text-warning">
          <BookOpenCheck size={24} />
        </span>
        <div>
          <div className="text-2xl font-extrabold text-ink">—</div>
          <div className="text-sm text-muted">Total ujian yang kamu kerjakan</div>
        </div>
      </Card>
    </div>
  )
}
