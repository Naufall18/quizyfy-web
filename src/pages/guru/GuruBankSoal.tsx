import { useEffect, useState } from 'react'
import { Plus, Search, Database, Edit2, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { guruApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { toast } from '../../components/ui/Toast'

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

const TYPE_VARIANT: Record<string, 'primary' | 'accent' | 'success'> = {
  pg: 'primary',
  essay: 'accent',
  true_false: 'success',
}

export function GuruBankSoal() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      .catch(() => { if (active) setQuestions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = questions.filter((q) =>
    q.text.toLowerCase().includes(query.toLowerCase()),
  )

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await guruApi.deleteQuestion(deleteTarget.id)
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id))
      toast.success('Soal berhasil dihapus')
      setDeleteTarget(null)
    } catch {
      toast.error('Gagal menghapus soal.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Bank Soal</h1>
          <p className="mt-1 text-muted">
            {questions.length} soal tersedia
          </p>
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
        <EmptyState
          icon={<Database size={28} />}
          title={query ? 'Soal tidak ditemukan' : 'Bank soal masih kosong'}
          description={query ? 'Coba kata kunci lain.' : 'Mulai tambahkan soal pertamamu.'}
          action={
            !query ? (
              <Link to="/guru/bank-soal/tambah">
                <Button size="sm" className="gap-2">
                  <Plus size={14} />
                  Tambah Soal
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-soft">#{idx + 1}</span>
                  <Badge
                    variant={TYPE_VARIANT[q.type] ?? 'neutral'}
                    size="sm"
                  >
                    {TYPE_LABEL[q.type] ?? q.type}
                  </Badge>
                  {q.category && (
                    <Badge variant="neutral" size="sm">{q.category.name}</Badge>
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
                  onClick={() => setDeleteTarget(q)}
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

      {/* Confirm hapus */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Hapus soal ini?`}
        description={deleteTarget?.text
          ? `"${deleteTarget.text.slice(0, 60)}…" akan dihapus permanen.`
          : 'Soal akan dihapus permanen dan tidak bisa dikembalikan.'}
        confirmLabel="Hapus"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
