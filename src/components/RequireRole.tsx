import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, homePathFor, type Role } from '../store/authStore'

/**
 * Guard rute per peran. Belum login -> /login; login tapi peran tidak
 * sesuai -> dilempar ke dashboard perannya sendiri.
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />
  }
  return <>{children}</>
}
