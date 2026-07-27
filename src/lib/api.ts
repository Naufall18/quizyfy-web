import axios from 'axios'

/**
 * Klien HTTP terpusat untuk Quizyfy API (Laravel Sanctum, token-based).
 * Base URL dari env; token disisipkan otomatis dari localStorage.
 */
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
})

const TOKEN_KEY = 'quizyfy_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 401 -> sesi habis: bersihkan token & arahkan ke login
    if (error.response?.status === 401) {
      tokenStore.clear()
      if (!location.pathname.startsWith('/login')) location.assign('/login')
    }
    return Promise.reject(error)
  },
)

// ─── Endpoint per peran ──────────────────────────────────────
export const siswaApi = {
  exams: () => api.get('/user/exams'),               // ujian aktif yang belum dikerjakan
  riwayat: () => api.get('/user/exam'),              // daftar semua ujian
  examDetail: (id: number) => api.get(`/user/exam/${id}`),
  joinByToken: (token: string) => api.post('/user/exam/join', { token }),
  startExam: (id: number) => api.post(`/user/exams/${id}/start`),
  examStatus: (id: number) => api.get(`/user/exams/${id}/status`),
  submitAnswer: (id: number, payload: unknown) => api.post(`/user/exams/${id}/answers`, payload),
  finishExam: (id: number) => api.post(`/user/exams/${id}/finish`),
  examResult: (id: number) => api.get(`/user/exams/${id}/result`),
}

export const guruApi = {
  // Ujian
  exams: (params?: { page?: number; status?: string }) => api.get('/guru/exams', { params }),
  examDetail: (id: number) => api.get(`/guru/exams/${id}`),
  createExam: (payload: unknown) => api.post('/guru/exams', payload),
  updateExam: (id: number, payload: unknown) => api.put(`/guru/exams/${id}`, payload),
  deleteExam: (id: number) => api.delete(`/guru/exams/${id}`),
  toggleStatus: (id: number) => api.patch(`/guru/exams/${id}/toggle`),
  // Bank Soal
  questions: (params?: { page?: number; category_id?: number }) =>
    api.get('/guru/questions', { params }),
  createQuestion: (payload: unknown) => api.post('/guru/questions', payload),
  updateQuestion: (id: number, payload: unknown) => api.put(`/guru/questions/${id}`, payload),
  deleteQuestion: (id: number) => api.delete(`/guru/questions/${id}`),  // Statistik
  stats: () => api.get('/guru/stats'),
  // Kategori
  categories: () => api.get('/guru/categories'),
}

export const adminApi = {
  // Statistik platform
  stats: () => api.get('/admin/stats'),
  // Pengguna
  users: (params?: { page?: number; role?: string; search?: string }) =>
    api.get('/admin/users', { params }),
  userDetail: (id: number) => api.get(`/admin/users/${id}`),
  banUser: (id: number) => api.patch(`/admin/users/${id}/ban`),
  unbanUser: (id: number) => api.patch(`/admin/users/${id}/unban`),
  // Paket langganan
  packages: () => api.get('/admin/packages'),
  createPackage: (payload: unknown) => api.post('/admin/packages', payload),
  updatePackage: (id: number, payload: unknown) => api.put(`/admin/packages/${id}`, payload),
  // Transaksi
  transactions: (params?: { page?: number; status?: string }) =>
    api.get('/admin/transactions', { params }),
  transactionDetail: (id: number) => api.get(`/admin/transactions/${id}`),
}
