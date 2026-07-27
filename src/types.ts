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

/** Satu pilihan jawaban soal pilihan ganda. */
export interface QuestionOption {
  key: string   // 'a' | 'b' | 'c' | 'd'
  text: string
}

/** Satu soal ujian. */
export interface Question {
  id: number
  question: string
  type: 'multiple' | 'essay' | 'true_false'
  options?: QuestionOption[] | null
  image_url?: string | null
  order?: number
}

/** Status sesi ujian dari API. */
export interface ExamSession {
  exam_id: number
  user_exam_id: number
  current_question?: number
  answered: number[]
  remaining_seconds: number
  status: 'ongoing' | 'finished'
}

/** Hasil ujian setelah submit. */
export interface ExamResult {
  exam_id: number
  exam_title: string
  score: number
  total_score: number
  kkm_score?: number
  correct_answers: number
  wrong_answers: number
  total_questions: number
  duration_minutes: number
  submitted_at?: string
  passed: boolean
}

/** Satu item riwayat ujian. */
export interface ExamHistory {
  id: number
  exam: Pick<Exam, 'id' | 'titles' | 'total_questions'>
  score: number
  status: 'lulus' | 'tidak_lulus'
  submitted_at: string
}

/** Bentuk respons paginate bawaan Laravel. */
export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
