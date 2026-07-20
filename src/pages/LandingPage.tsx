import { Link } from 'react-router-dom'
import {
  GraduationCap, ClipboardCheck, Timer, FileBarChart, ListChecks, PenLine,
  CheckSquare, CircleDot, CheckCircle2, Database, Zap, FileText,
  Phone, Mail, MapPin, ArrowRight, Laptop, MonitorCheck,
} from 'lucide-react'

/* Brand icons (lucide 1.x tidak lagi menyediakan ikon brand) */
const igPath = 'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.3 4 3.9 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.7a6.1 6.1 0 100 12.2 6.1 6.1 0 000-12.2zm0 10a4 4 0 110-8 4 4 0 010 8zm6.4-10.3a1.4 1.4 0 11-2.9 0 1.4 1.4 0 012.9 0z'
const fbPath = 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.09 24 18.1 24 12.07z'
const xPath = 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82L5 21.75H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z'

function BrandIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  )
}
import { Button } from '../components/ui/Button'

/* Landing mengikuti struktur Figma (frame "landing page") — palet di-swap ke indigo. */

const fiturUtama = [
  { no: '01', icon: Database, title: 'Bank Soal Lengkap', desc: 'Susun soal sesuai kebutuhan: pilihan ganda, checkbox, gambar, hingga esai — tersimpan rapi dan siap dipakai ulang.' },
  { no: '02', icon: Zap, title: 'Ujian Online Praktis', desc: 'Buat ujian dengan tampilan sederhana dan mudah digunakan. Siswa masuk cukup dengan kode ujian.' },
  { no: '03', icon: FileBarChart, title: 'Penilaian Otomatis', desc: 'Hasil ujian langsung keluar. Tampilkan jawaban benar dan salah, lengkap dengan skor akhir.' },
]

const keunggulan = [
  { icon: ClipboardCheck, title: 'Manajemen Soal yang Praktis', desc: 'Guru dapat membuat, mengatur, dan mengedit soal secara langsung — pilihan ganda maupun esai.' },
  { icon: Timer, title: 'Efisiensi Waktu & Biaya', desc: 'Tidak perlu lagi mencetak soal dan lembar jawaban, lebih hemat dan ramah lingkungan.' },
  { icon: CheckCircle2, title: 'Hasil Ujian Otomatis & Cepat', desc: 'Nilai pilihan ganda keluar seketika; esai bisa diperiksa manual dengan mudah.' },
  { icon: FileText, title: 'Laporan Lengkap', desc: 'Hasil ujian tersaji dalam bentuk rekap nilai dan analisis untuk memantau perkembangan siswa.' },
]

const tipeSoal = [
  { icon: CircleDot, title: 'Pilihan Ganda', desc: 'Siswa memilih satu jawaban benar dari beberapa opsi — praktis dan langsung dinilai otomatis.' },
  { icon: PenLine, title: 'Esai', desc: 'Siswa menjawab dengan teks, cocok menilai pemahaman dan kemampuan menulis.' },
  { icon: CheckSquare, title: 'Checkbox', desc: 'Siswa dapat memilih lebih dari satu jawaban, cocok untuk soal dengan beberapa jawaban benar.' },
]

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="text-center">
      {eyebrow && (
        <div className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      )}
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{title}</h2>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">Quizyfy</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
            <a href="#beranda" className="text-primary">Beranda</a>
            <a href="#tentang" className="transition-colors hover:text-ink">Tentang</a>
            <a href="#fitur" className="transition-colors hover:text-ink">Fitur</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/register"><Button variant="outline" size="sm">Daftar</Button></Link>
            <Link to="/login"><Button size="sm">Masuk</Button></Link>
          </div>
        </div>
      </header>

      {/* ── Hero (teks kiri, visual kanan — sesuai Figma) ── */}
      <section id="beranda" className="bg-gradient-to-b from-primary-soft to-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl">
              Siap Hadapi Ujian Lebih Mudah!
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Akses soal interaktif, latihan tanpa ribet, dan raih nilai terbaikmu
              dengan cara yang lebih menyenangkan.
            </p>
            <Link to="/register" className="mt-7 inline-block">
              <Button size="lg">
                Coba Sekarang <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          <div className="relative mx-auto grid h-64 w-full max-w-sm place-items-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative grid place-items-center rounded-3xl bg-surface p-10 shadow-lg">
              <Laptop size={96} className="text-primary" strokeWidth={1.2} />
              <span className="absolute -left-4 top-6 grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white shadow-md">
                <ListChecks size={20} />
              </span>
              <span className="absolute -right-4 bottom-8 grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-md">
                <GraduationCap size={20} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner strip ── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-sm text-muted">
          <span><strong className="text-primary">Quizyfy</strong> dipercaya oleh berbagai partner dan institusi pendidikan.</span>
          <span className="font-bold tracking-wide text-muted-soft">Hummatech</span>
          <span className="font-bold tracking-wide text-muted-soft">SMKN 1 Pasuruan</span>
          <span className="font-bold tracking-wide text-muted-soft">UPN “Veteran” Jatim</span>
        </div>
      </section>

      {/* ── Apa itu Quizyfy? (visual kiri, teks kanan — sesuai Figma) ── */}
      <section id="tentang" className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div className="order-2 mx-auto grid h-56 w-full max-w-xs place-items-center md:order-1">
          <div className="relative grid place-items-center rounded-3xl bg-primary-soft p-10">
            <GraduationCap size={80} className="text-primary" strokeWidth={1.2} />
            <span className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-xl bg-warning text-white shadow-md">
              <PenLine size={18} />
            </span>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">
            Apa itu <span className="text-primary">Quizyfy</span>?
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            <strong className="text-primary">Quizyfy</strong> adalah platform ujian online yang dirancang
            untuk memudahkan guru dan siswa dalam proses evaluasi pembelajaran. Dengan sistem yang aman,
            praktis, dan fleksibel, Quizyfy membantu menciptakan pengalaman ujian yang lebih efisien
            tanpa perlu kertas dan ribet.
          </p>
          <Link to="/register" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            Selengkapnya <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Fitur 01/02/03 (sesuai Figma) ── */}
      <section id="fitur" className="bg-primary-soft/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow="Kenapa harus Quizyfy?" title="Fitur-Fitur Quizyfy" />
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {fiturUtama.map((f) => (
              <div key={f.no} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
                  {f.no}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Keunggulan 2×2 (sesuai Figma) ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading eyebrow="Lebih baik dengan Quizyfy" title="Keunggulan Quizyfy" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {keunggulan.map((k) => (
            <div key={k.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-line bg-primary-soft text-primary">
                <k.icon size={22} />
              </span>
              <div>
                <h3 className="font-bold text-ink">{k.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{k.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Variasi Tipe Soal (sesuai Figma) ── */}
      <section className="bg-primary-soft/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading title="Variasi Tipe Soal" />
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted">
            Ujian jadi lebih variatif dengan tipe soal yang bisa disesuaikan untuk setiap kebutuhan belajar.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tipeSoal.map((t) => (
              <div key={t.title} className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-white">
                  <t.icon size={22} />
                </span>
                <h3 className="mt-4 font-bold text-ink">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Siswa (teks kiri) — sesuai Figma ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">Sebagai Siswa</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
            Belajar Lebih Mudah, Ujian Lebih Terarah
          </h2>
          <p className="mt-3 text-muted">
            Cukup masukkan kode dari guru lalu langsung mulai ujian dengan cara yang simpel dan menyenangkan.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink">
            {['Masuk ujian dengan kode', 'Kerjakan ujian secara interaktif', 'Lihat hasil secara instan'].map((x) => (
              <li key={x} className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-success" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto grid h-52 w-full max-w-xs place-items-center rounded-3xl bg-primary-soft">
          <Laptop size={80} className="text-primary" strokeWidth={1.2} />
        </div>
      </section>

      {/* ── CTA Guru (visual kiri) — sesuai Figma ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <div className="mx-auto grid h-52 w-full max-w-xs place-items-center rounded-3xl bg-accent-soft">
            <MonitorCheck size={80} className="text-accent" strokeWidth={1.2} />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Sebagai Guru</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
            Kelola Ujian Lebih Mudah, Hasil Lebih Terpantau
          </h2>
          <p className="mt-3 text-muted">
            Buat, atur, hingga pantau ujian dengan lebih praktis. Semua proses ujian jadi lebih efisien,
            aman, dan transparan.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-ink">
            {['Buat & kelola soal secara fleksibel', 'Atur jadwal ujian sesuai kebutuhan', 'Pantau hasil dan perkembangan siswa'].map((x) => (
              <li key={x} className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-success" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer 4 kolom (sesuai Figma) ── */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
                <GraduationCap size={20} />
              </span>
              <span className="text-lg font-extrabold text-ink">Quizyfy</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Quizyfy adalah platform ujian online yang memudahkan guru dan siswa dengan sistem aman,
              praktis, dan fleksibel — evaluasi tanpa kertas dan ribet.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-ink">Sosial <span className="text-primary">Media</span></h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2.5"><span className="text-primary"><BrandIcon d={igPath} /></span> Instagram</li>
              <li className="flex items-center gap-2.5"><span className="text-primary"><BrandIcon d={fbPath} /></span> Facebook</li>
              <li className="flex items-center gap-2.5"><span className="text-primary"><BrandIcon d={xPath} /></span> Twitter</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-ink">Navigasi <span className="text-primary">Cepat</span></h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><a href="#beranda" className="hover:text-primary">Beranda</a></li>
              <li><a href="#tentang" className="hover:text-primary">Tentang</a></li>
              <li><a href="#fitur" className="hover:text-primary">Fitur</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-ink">Informasi <span className="text-primary">Kontak</span></h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2.5"><Phone size={16} className="text-primary" /> 0822-4408-9648</li>
              <li className="flex items-center gap-2.5"><Mail size={16} className="text-primary" /> halo@quizyfy.id</li>
              <li className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" /> Pasuruan, Jawa Timur</li>
            </ul>
          </div>
        </div>
        <div className="bg-primary py-3 text-center text-xs font-semibold text-white">
          © 2026 Quizyfy. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
