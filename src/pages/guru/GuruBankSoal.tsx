import { useEffect, useState } from 'react'
import { Plus, Search, Database, Edit2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { guruApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'

interface Question {
  id: number
  text: string
  type: 'pg' | 'essay' | 'true_false'
  category?: { id: number; name: string }
  created_at?: string
}

const TYPE_LABEL: Record<string, string> = {
  pg: 'Pilihan Ganda',
  essay: 'Essay',
  true_false: 'Benar/Salah',
}
const TYPE_STYLE: Record<string, string> = {
  pg: 'bg-primary-soft text-primary',
  essay: 'bg-accent-soft text-accent',
  true_false: 'bg-success-soft text-success',
}

export function GuruBankSoal() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    guruApi
      .questions()
      .then((res) => {
        if (active) {
          const d = res.data
          setQuestions((d.data ?? d) as Question[])
        }
      })
      .catch(() => {
        if (active) setQuestions([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = questions.filter((q) =>
    q.text.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Bank Soal</h1>
          <p className="mt-1 text-muted">Semua soal yang telah kamu buat.</p>
        </div>
        <Link to="/guru/bank-soal/tambah">
          <Button size="sm" className="gap-2">
            <Plus size={16} />
            Tambah Soal
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari soal..."
          className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <Database size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">Bank soal masih kosong</p>
          <p className="mt-1 text-sm text-muted">Mulai tambahkan soal pertamamu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-soft">#{idx + 1}</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold',
                      TYPE_STYLE[q.type] ?? 'bg-surface-alt text-muted',
                    )}
                  >
                    {TYPE_LABEL[q.type] ?? q.type}
                  </span>
                  {q.category && (
                    <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-muted">
                      {q.category.name}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-ink">{q.text}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link to={`/guru/bank-soal/${q.id}/edit`}>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label="Edit soal"
                  >
                    <Edit2 size={14} />
                  </button>
                </Link>
                <button
                  className="grid h-8 w-8 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-danger/40 hover:text-danger"
                  aria-label="Hapus soal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
