# Quizyfy Web

Frontend web untuk **Quizyfy** — platform ujian online untuk sekolah, kampus, dan instansi. Redesign dari project PKL "Intest/Examo" dengan brand, palet, dan kode baru.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 (design tokens di `src/index.css` — palet "Indigo Profesional")
- Zustand (state auth) · Axios (klien API) · React Router 7

## Peran

| Peran | Rute | Fitur utama |
|---|---|---|
| Siswa (`user`) | `/siswa` | Kerjakan ujian, riwayat nilai |
| Guru | `/guru` | Bank soal, kelola ujian, nilai siswa, langganan |
| Admin | `/admin` | Pengguna, paket, transaksi |

## Menjalankan

```bash
cp .env.example .env   # sesuaikan VITE_API_URL ke Quizyfy API (Laravel)
npm install
npm run dev
```

Backend: [Quizyfy-Backend](https://github.com/Naufall18/Quizyfy-Backend) · Mobile: [Quizyfy](https://github.com/Naufall18/Quizyfy)
