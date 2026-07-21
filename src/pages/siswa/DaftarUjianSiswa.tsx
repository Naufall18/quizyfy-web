import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Search, BookOpen } from 'lucide-react'
import axios from 'axios'
import { siswaApi } from '../../lib/api'
import type { Exam, Paginated } from '../../types'
import { ExamCard } from '../../components/ExamCard'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'

/* Daftar ujian siswa: gabung via token + grid ujian tersedia. */
export function DaftarUjianSiswa() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<Exam[]>([])
  const [query, setQuery] = useState('')
  const [token, setToken] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError('')
    setJoining(true)
    try {
      const res = await siswaApi.joinByToken(token.trim())
      const exam = res.data?.exam ?? res.data
      if (exam?.id) navigate(`/siswa/ujian/${exam.id}`)
    } catch (err) {
      setJoinError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Gagal gabung ujian. Periksa kembali kodenya.',
      )
    } finally {
      setJoining(false)
    }
  }

  const filtered = exams.filter((e) => e.titles?.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Daftar Ujian</h1>
        <p className="mt-1 text-muted">Gabung dengan kode dari guru, atau pilih ujian aktif di bawah.</p>
      </div>

      {/* Gabung via token */}
      <form
        onSubmit={onJoin}
        className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:flex-row sm:items-start"
      >
        <div className="relative flex-1">
          <KeyRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Masukkan kode ujian (mis. AB12CD)"
            className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 font-mono text-sm uppercase tracking-widest text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {joinError && <p className="mt-1.5 text-sm text-danger">{joinError}</p>}
        </div>
        <Button type="submit" disabled={joining}>
          {joining ? 'Memeriksa…' : 'Gabung Ujian'}
        </Button>
      </form>

      {/* Cari */}
      <div className="relative max-w-md">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari ujian"
          className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface py-16 text-center">
          <BookOpen size={32} className="text-muted-soft" />
          <p className="mt-3 font-semibold text-ink">Tidak ada ujian tersedia</p>
          <p className="mt-1 text-sm text-muted">Coba kata kunci lain atau gabung pakai kode ujian.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => <ExamCard key={e.id} exam={e} />)}
        </div>
      )}
    </div>
  )
}
