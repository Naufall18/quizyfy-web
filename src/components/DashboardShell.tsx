import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuthStore } from '../store/authStore'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

/**
 * Kerangka dashboard (sidebar + topbar) dipakai semua peran.
 * Menu dikirim per-peran lewat prop `sections`.
 */
export function DashboardShell({ sections }: { sections: NavSection[] }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 pt-5 pb-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
          <GraduationCap size={20} />
        </span>
        <span className="text-lg font-extrabold tracking-tight text-ink">Quizyfy</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-muted-soft">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted hover:bg-surface-alt hover:text-ink',
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-line bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Sidebar mobile (drawer) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-surface-alt lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Buka menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold leading-tight text-ink">{user?.name}</div>
              <div className="text-xs text-muted capitalize">{user?.role === 'user' ? 'Siswa' : user?.role}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
