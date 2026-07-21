import { createBrowserRouter } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Database, Settings,
  BookOpen, Users, History, Wallet,
} from 'lucide-react'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SiswaDashboard } from './pages/siswa/SiswaDashboard'
import { DaftarUjianSiswa } from './pages/siswa/DaftarUjianSiswa'
import { GuruDashboard } from './pages/guru/GuruDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { RequireRole } from './components/RequireRole'
import { DashboardShell, type NavSection } from './components/DashboardShell'

const siswaNav: NavSection[] = [
  {
    title: 'Menu',
    items: [
      { to: '/siswa', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/siswa/ujian', label: 'Daftar Ujian', icon: BookOpen },
    ],
  },
  {
    title: 'Sistem',
    items: [{ to: '/siswa/pengaturan', label: 'Pengaturan', icon: Settings }],
  },
]

const guruNav: NavSection[] = [
  {
    title: 'Menu',
    items: [
      { to: '/guru', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/guru/ujian', label: 'Daftar Ujian', icon: ClipboardList },
      { to: '/guru/bank-soal', label: 'Bank Soal', icon: Database },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { to: '/guru/langganan', label: 'Langganan', icon: Wallet },
      { to: '/guru/pengaturan', label: 'Pengaturan', icon: Settings },
    ],
  },
]

const adminNav: NavSection[] = [
  {
    title: 'Menu',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/pengguna', label: 'Pengguna', icon: Users },
      { to: '/admin/paket', label: 'Paket', icon: Wallet },
      { to: '/admin/transaksi', label: 'Riwayat Transaksi', icon: History },
    ],
  },
  {
    title: 'Sistem',
    items: [{ to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings }],
  },
]

/** Peta rute Quizyfy: publik + dashboard per peran (siswa/guru/admin). */
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  {
    path: '/siswa',
    element: (
      <RequireRole role="user">
        <DashboardShell sections={siswaNav} />
      </RequireRole>
    ),
    children: [
      { index: true, element: <SiswaDashboard /> },
      { path: 'ujian', element: <DaftarUjianSiswa /> },
    ],
  },
  {
    path: '/guru',
    element: (
      <RequireRole role="guru">
        <DashboardShell sections={guruNav} />
      </RequireRole>
    ),
    children: [
      { index: true, element: <GuruDashboard /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireRole role="admin">
        <DashboardShell sections={adminNav} />
      </RequireRole>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
    ],
  },
])
