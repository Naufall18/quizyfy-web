export interface Category {
  id: number
  name: string
  slug?: string
}

export interface Exam {
  id: number
  titles: string // nama field mengikuti API (jamak)
  description?: string | null
  token?: string
  category?: Category | null
  start_time?: string | null
  end_time?: string | null
  duration_minutes: number
  total_questions: number
  kkm_score?: number
  status: 'aktif' | 'nonaktif' | 'selesai' | string
  instructions?: string | null
  created_at?: string
}

/** Bentuk respons paginate bawaan Laravel. */
export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
