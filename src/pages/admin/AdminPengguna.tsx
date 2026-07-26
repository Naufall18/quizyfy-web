import { useEffect, useState } from 'react'
import { Search, Users, ShieldOff, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminApi } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { toast } from '../../components/ui/Toast'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'guru' | 'user'
  is_banned?: boolean
  created_at?: string
}

interface PaginatedUsers {
  data: User[]
  current_page: number
  last_page: number
  total: number
}

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-primary-soft text-primary',
  guru: 'bg-accent-soft text-accent',
  user: 'bg-success-soft text-success',
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  guru: 'Guru',
  user: 'Siswa',
}

function UserRow({
  user,
  onToggleBan,
}: {
  user: User
  onToggleBan: (id: number, ban: boolean) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      if (user.is_banned) {
        await adminApi.unbanUser(user.id)
        toast.success(`${user.name} berhasil di-unban`)
      } else {
        await adminApi.banUser(user.id)
        toast.warning(`${user.name} berhasil di-ban`)
      }
      onToggleBan(user.id, !user.is_banned)
    } catch {
      toast.error('Gagal mengubah status pengguna.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <tr className="border-b border-line transition-colors hover:bg-surface-alt">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft font-bold text-primary text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-ink">{user.name}</div>
            <div className="text-xs text-muted">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', ROLE_STYLE[user.role] ?? 'bg-surface-alt text-muted')}>
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-bold',
          user.is_banned ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success',
        )}>
          {user.is_banned ? 'Diblokir' : 'Aktif'}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-muted">
        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '—'}
      </td>
      <td className="px-5 py-4">
        {user.role !== 'admin' && (
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-1.5', user.is_banned ? 'border-success/40 text-success hover:bg-success-soft' : 'border-danger/40 text-danger hover:bg-danger-soft')}
            onClick={handleToggle}
            disabled={loading}
          >
            {user.is_banned ? <Shield size={13} /> : <ShieldOff size={13} />}
            {user.is_banned ? 'Unban' : 'Ban'}
          </Button>
        )}
      </td>
    </tr>
  )
}

export function AdminPengguna() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await adminApi.users({ page, search: query, role: roleFilter })
      const d = res.data as PaginatedUsers
      setUsers(d.data ?? [])
      setLastPage(d.last_page ?? 1)
      setTotal(d.total ?? 0)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [page, roleFilter]) // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  function handleToggleBan(id: number, banned: boolean) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_banned: banned } : u))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Manajemen Pengguna</h1>
          <p className="mt-1 text-muted">{total} pengguna terdaftar</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-48">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="h-10 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
        {['', 'user', 'guru', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1) }}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
              roleFilter === r
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-surface text-muted hover:border-primary/40 hover:text-ink',
            )}
          >
            {r === '' ? 'Semua' : ROLE_LABEL[r]}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-alt text-left">
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Pengguna</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Peran</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Bergabung</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="px-5 py-4"><Skeleton className="h-9 w-48 rounded-xl" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-24 rounded-lg" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-8 w-16 rounded-xl" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-muted">
                  <Users size={28} className="mx-auto mb-2 text-muted-soft" />
                  Tidak ada pengguna ditemukan
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <UserRow key={u.id} user={u} onToggleBan={handleToggleBan} />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <span className="text-sm text-muted">Halaman {page} dari {lastPage}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={15} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
