# Sistem RAB - PO - Nota
Stack: React+Vite+JSX+PWA+Tailwind (frontend) · Express+MySQL (backend).

## Jalankan
1. `mysql -u root -p < backend/sql/database.sql`
2. `cd backend && cp .env.example .env` (isi DB & JWT_SECRET) → `npm i && npm run dev`  (login awal: ADMIN_USER/ADMIN_PASS di .env)
3. `cd frontend && cp .env.example .env && npm i && npm run dev`

Alur: Master (Toko, Pelanggan) → RAB Harian → Buat PO per toko → Buat Nota → input realisasi & cetak → Dashboard rekonsiliasi.
Logo asli klien ada di `frontend/public/logos/` (logo-1 dipakai sebagai logo aplikasi/PWA).
# rab-po-nota
