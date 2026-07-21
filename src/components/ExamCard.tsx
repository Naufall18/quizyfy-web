import { Link } from 'react-router-dom'
import { MonitorPlay } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '../lib/cn'
import type { Exam } from '../types'

const statusTone: Record<string, string> = {
  aktif: 'bg-success-soft text-success',
  nonaktif: 'bg-surface-alt text-muted',
  selesai: 'bg-primary-soft text-primary',
}

/** Kartu ujian sesuai Figma: thumbnail, judul + badge status, jumlah soal, tombol. */
export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="grid h-36 place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-accent-soft">
        <MonitorPlay size={44} className="text-primary" strokeWidth={1.4} />
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="font-bold leading-snug text-ink">{exam.titles}</h3>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-bold capitalize',
            statusTone[exam.status] ?? 'bg-surface-alt text-muted',
          )}
        >
          {exam.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{exam.total_questions} Pertanyaan</p>
      <Link to={`/siswa/ujian/${exam.id}`} className="mt-4">
        <Button className="w-full">Selengkapnya</Button>
      </Link>
    </div>
  )
}
