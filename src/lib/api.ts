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
