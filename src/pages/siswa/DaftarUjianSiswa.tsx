import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Search, BookOpen, Plus } from 'lucide-react'
import axios from 'axios'
import { siswaApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { ExamCard } from '../../components/ExamCard'
import { Button } from '../../components/ui/Button'
import { LoadingButton } from '../../components/ui/LoadingButton'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { toast } from '../../components/ui/Toast'

/* Daftar ujian siswa: gabung via token (modal) + grid ujian tersedia. */
export function DaftarUjianSiswa() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<Exam[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal join
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [token, setToken] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    let active = true
    siswaApi.exams()
      .then((res) => {
        if (!active) return
        const p = res.data as Paginated<Exam>
        setExams(p.data ?? [])
      })
      .catch(() => active && setExams([]))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinError('')
    setJoining(true)
    try {
      const res = await siswaApi.joinByToken(token.trim().toUpperCase())
      const exam = res.data?.exam ?? res.data
      toast.success('Berhasil bergabung ujian!')
      setShowJoinModal(false)
      if (exam?.id) navigate(`/siswa/ujian/${exam.id}`)
    } catch (err) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Kode tidak ditemukan atau ujian tidak aktif.'
      setJoinError(msg)
    } finally {
      setJoining(false)
    }
  }

  const filtered = exams.filter((e) =>
    e.titles?.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Daftar Ujian</h1>
          <p className="mt-1 text-muted">Ujian aktif yang tersedia untukmu.</p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => { setShowJoinModal(true); setToken(''); setJoinError('') }}
        >
          <Plus size={15} />
          Gabung via Kode
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari ujian..."
          className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="Tidak ada ujian tersedia"
          description="Coba kata kunci lain atau gabung pakai kode ujian dari gurumu."
          action={
            <Button size="sm" className="gap-2" onClick={() => setShowJoinModal(true)}>
              <KeyRound size={14} />
              Masukkan Kode Ujian
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => <ExamCard key={e.id} exam={e} />)}
        </div>
      )}

      {/* Modal Gabung via Kode */}
      <Modal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Gabung via Kode Ujian"
        size="sm"
      >
        <form onSubmit={handleJoin} className="space-y-4">
          <p className="text-sm text-muted">
            Masukkan kode 6 karakter yang diberikan oleh gurumu untuk bergabung ke ujian.
          </p>
          <div>
            <div className="relative">
              <KeyRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input
                value={token}
                onChange={(e) => { setToken(e.target.value.toUpperCase()); setJoinError('') }}
                required
                maxLength={10}
                placeholder="Kode ujian (mis. AB12CD)"
                autoFocus
                className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 font-mono text-sm uppercase tracking-widest text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {joinError && (
              <p className="mt-1.5 text-sm text-danger">{joinError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowJoinModal(false)}
            >
              Batal
            </Button>
            <LoadingButton
              type="submit"
              loading={joining}
              loadingText="Memeriksa…"
              className="flex-1"
            >
              Gabung Ujian
            </LoadingButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
