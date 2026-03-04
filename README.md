# BK-poli

## Arsitektur Baru (Scaffold)

Monorepo baru ditambahkan:
- `apps/web`: Next.js 16 App Router
- `db`: Prisma + PostgreSQL

### Role
- `SUPER_ADMIN`
- `ADMIN`
- `DOKTER`
- `PASIEN`

### Quick start
1. Copy `.env.example` menjadi `.env`.
2. Copy `db/.env.example` menjadi `db/.env` (opsional jika ingin env DB terpisah dari root).
3. Install dependency: `pnpm install`
4. Generate Prisma client: `pnpm db:generate`
5. Jalankan migrasi: `pnpm db:migrate`
6. Seed super admin: `pnpm db:seed`
7. Jalankan app: `pnpm dev`

### Catatan DB
- Konfigurasi DB ada di `db/.env`
- Jika `migrate` terkendala privilege lokal, gunakan `pnpm db:push`
- Prisma Studio: `pnpm db:studio`

## Persiapan Deploy Vercel

Repo ini sudah disiapkan untuk deploy dari root monorepo menggunakan `vercel.json`:
- install: `pnpm install --frozen-lockfile`
- build: `pnpm vercel-build` (otomatis `prisma generate` lalu `next build`)

### 1. Buat database PostgreSQL production
Gunakan provider PostgreSQL yang public (Neon, Supabase, Railway, RDS, dll), lalu ambil connection string `DATABASE_URL`.

### 2. Set Environment Variables di Vercel (Project Settings -> Environment Variables)
Wajib:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`

Opsional (jika ingin seed super admin dari env yang sama):
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_USERNAME`
- `SUPER_ADMIN_PASSWORD`

### 3. Deploy dari root repo
- Import repository ke Vercel
- Root Directory: `.` (root project ini)
- Framework Preset: Next.js
- Build Command: otomatis dari `vercel.json`

### 4. Jalankan migrasi production (sekali tiap perubahan schema)
Jangan jalankan `prisma migrate dev` di production.
Gunakan salah satu cara berikut:
1. Dari local/CI: `pnpm db:migrate:deploy`
2. Lalu (opsional) seed awal: `pnpm db:seed`

### 5. Verifikasi setelah deploy
1. Buka halaman publik.
2. Uji login dengan akun super admin.
3. Cek endpoint auth: `/api/auth/session` harus respon normal.
