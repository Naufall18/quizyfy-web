import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, tokenStore } from '../lib/api'

export type Role = 'admin' | 'guru' | 'user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (data: {
    name: string
    email: string
    password: string
    passwordConfirmation: string
    role: Exclude<Role, 'admin'>
  }) => Promise<AuthUser>
  logout: () => Promise<void>
}

/** Sesi Quizyfy. Token disimpan via tokenStore (lib/api), profil di-persist di sini. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/login', { email, password })
        const { user, token } = res.data
        tokenStore.set(token)
        set({ user, isAuthenticated: true })
        return user as AuthUser
      },

      register: async ({ name, email, password, passwordConfirmation, role }) => {
        const res = await api.post('/register', {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          role,
        })
        const { user, token } = res.data
        tokenStore.set(token)
        set({ user, isAuthenticated: true })
        return user as AuthUser
      },

      logout: async () => {
        try { await api.post('/logout') } catch { /* token lokal tetap dibersihkan */ }
        tokenStore.clear()
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'quizyfy-auth' },
  ),
)

/** Rute dashboard sesuai peran user. */
export function homePathFor(role: Role): string {
  if (role === 'admin') return '/admin'
  if (role === 'guru') return '/guru'
  return '/siswa'
}
