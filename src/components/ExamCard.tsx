import { Link } from 'react-router-dom'
import { MonitorPlay, Clock, FileQuestion } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge, examStatusVariant } from './ui/Badge'
import type { Exam } from '../types'

/** Kartu ujian sesuai Figma: thumbnail, judul + badge status, jumlah soal + durasi, tombol. */
export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="grid h-36 place-items-center rounded-xl bg-gradient-to-br from-primary-soft to-accent-soft">
        <MonitorPlay size={44} className="text-primary" strokeWidth={1.4} />
      </div>

      {/* Judul + badge */}
      <div className="mt-4 flex items-start justify-between gap-2">
        <h3 className="font-bold leading-snug text-ink line-clamp-2">{exam.titles}</h3>
        <Badge variant={examStatusVariant(exam.status)} size="sm" className="shrink-0">
          {exam.status}
        </Badge>
      </div>

      {/* Meta info */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <FileQuestion size={12} />
          {exam.total_questions} Soal
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {exam.duration_minutes} Menit
        </span>
      </div>

      <Link to={`/siswa/ujian/${exam.id}`} className="mt-4">
        <Button className="w-full">Selengkapnya</Button>
      </Link>
    </div>
  )
}
