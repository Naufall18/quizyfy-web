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

// ─── Admin types ──────────────────────────────────────────────

/** Data lengkap user untuk admin panel. */
export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'guru' | 'user'
  is_banned?: boolean
  created_at?: string
  email_verified_at?: string | null
  avatar?: string | null
  phone?: string | null
  total_exams_taken?: number
  total_transactions?: number
  active_subscription?: string | null
}

/** Satu item riwayat transaksi. */
export interface TransactionHistory {
  id: number
  user_id: number
  user?: Pick<AdminUser, 'id' | 'name' | 'email'>
  package_name: string
  amount: number
  duration_days: number
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  payment_method?: string | null
  transaction_date: string
  expired_at?: string | null
}

/** Statistik global dashboard admin. */
export interface DashboardStats {
  total_users: number
  total_gurus: number
  total_students: number
  total_exams: number
  total_transactions: number
  revenue_this_month: number
  active_subscriptions: number
  new_users_this_week: number
}

/** Statistik dashboard guru. */
export interface GuruDashboardStats {
  total_exams: number
  total_students: number
  total_questions: number
  avg_score: number
}

/** Satu item jawaban siswa untuk review pembahasan. */
export interface AnswerReview {
  question_id: number
  question: string
  type: 'multiple' | 'essay' | 'true_false'
  options?: QuestionOption[] | null
  correct_answer: string
  explanation?: string | null
  my_answer: string | null
  is_correct: boolean
  order?: number
}

// ─── Admin types ──────────────────────────────────────────────

/** Data lengkap user untuk admin panel. */
export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'guru' | 'user'
  is_banned?: boolean
  created_at?: string
  email_verified_at?: string | null
  avatar?: string | null
  phone?: string | null
  // Statistik
  total_exams_taken?: number
  total_transactions?: number
  active_subscription?: string | null
}

/** Satu item riwayat transaksi. */
export interface TransactionHistory {
  id: number
  user_id: number
  user?: Pick<AdminUser, 'id' | 'name' | 'email'>
  package_name: string
  amount: number
  duration_days: number
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  payment_method?: string | null
  transaction_date: string
  expired_at?: string | null
}

/** Statistik global dashboard admin. */
export interface DashboardStats {
  total_users: number
  total_gurus: number
  total_students: number
  total_exams: number
  total_transactions: number
  revenue_this_month: number
  active_subscriptions: number
  new_users_this_week: number
}

/** Statistik dashboard guru. */
export interface GuruDashboardStats {
  total_exams: number
  total_students: number
  total_questions: number
  avg_score: number
}

/** Satu item jawaban siswa untuk review pembahasan. */
export interface AnswerReview {
  question_id: number
  question: string
  type: 'multiple' | 'essay' | 'true_false'
  options?: QuestionOption[] | null
  correct_answer: string
  explanation?: string | null
  my_answer: string | null
  is_correct: boolean
  order?: number
}
