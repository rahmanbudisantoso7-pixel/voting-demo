# 🚀 Deploy SenatVote ke Vercel

Panduan lengkap deploy versi demo ke Vercel (gratis).

## ⚠️ Prasyarat

1. **Akun GitHub** — untuk push code
2. **Akun Vercel** — daftar di [vercel.com](https://vercel.com) (gratis, bisa login pakai GitHub)
3. **Akun Supabase** — untuk database PostgreSQL gratis di [supabase.com](https://supabase.com)

---

## 📋 Step 1: Setup Supabase (Database)

1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Isi:
   - **Name**: `senatvote`
   - **Database Password**: (buat password kuat, **simpan!**)
   - **Region**: Singapore (paling dekat dengan Indonesia)
3. Tunggu ~2 menit sampai project ready
4. Pergi ke **Settings → Database → Connection string → URI**
5. Copy connection string, contoh:
   ```
   postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   > ⚠️ Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat tadi.

---

## 📦 Step 2: Push ke GitHub

```bash
cd C:\Users\AXIOO\Downloads\voting-app
git init
git add .
git commit -m "Initial commit - SenatVote demo"
git branch -M main
git remote add origin https://github.com/[USERNAME]/senatvote.git
git push -u origin main
```

> Belum punya repo? Buat dulu di [github.com/new](https://github.com/new)

---

## 🌐 Step 3: Deploy ke Vercel

### 3a. Import Project

1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **Import** di repository `senatvote` Anda
3. Klik **Deploy** (akan gagal dulu, lanjut step 3b)

### 3b. Set Environment Variables

Di halaman project Vercel → **Settings → Environment Variables**, tambahkan:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` | dari Supabase |
| `AUTH_SECRET` | (lihat cara generate di bawah) | untuk NextAuth |
| `AUTH_URL` | `https://senatvote.vercel.app` | URL Vercel Anda |
| `DEMO_MODE` | `true` | aktifkan demo login |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | flag untuk client-side |
| `ADMIN_EMAILS` | `admin@tp.idu.ac.id,demo@tp.idu.ac.id` | email admin |

**Generate AUTH_SECRET** (jalankan di terminal lokal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy outputnya ke `AUTH_SECRET`.

### 3c. Setup Database Schema

Setelah env vars tersimpan, deploy ulang:
1. **Deployments** → klik deployment terakhir → **Redeploy**
2. Setelah build sukses, pergi ke **Settings → Environment Variables** lagi, klik 3-dot di `DATABASE_URL` → buka Supabase SQL editor, atau gunakan Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma db push
```

Atau cara paling mudah: di Supabase dashboard, buka **SQL Editor**, jalankan:
```sql
-- (Schema di-generate oleh prisma db push)
```

### 3d. Redeploy

1. **Deployments** → klik **Redeploy** pada deployment terakhir
2. Tunggu build selesai (~2-3 menit)
3. Klik **Visit** untuk buka aplikasi Anda! 🎉

---

## 🔑 Step 4: Login & Test

Buka `https://senatvote.vercel.app`, klik **Login**, pilih:

- **Login sebagai Mahasiswa** → otomatis `mahasiswa@tp.idu.ac.id`
- **Login sebagai Admin** → otomatis `admin@tp.idu.ac.id` (bisa akses `/admin`)

---

## 🐛 Troubleshooting

### Build gagal: "Prisma Client not generated"
- Pastikan `postinstall` script di `package.json` ada: `"postinstall": "prisma generate"`
- Sudah ada ✅

### Database error setelah deploy
- Pastikan `DATABASE_URL` benar (cek password, port 6543 untuk pooler)
- Jalankan `npx prisma db push` untuk sync schema

### Login loop / tidak redirect
- Pastikan `AUTH_URL` sesuai dengan domain Vercel Anda
- Clear cookies browser, coba lagi

### Upload foto tidak persist
- Foto disimpan sebagai **base64** di database (max 2MB)
- Jika gagal, cek console browser untuk error

---

## 🔄 Update Setelah Ada Perubahan

```bash
git add .
git commit -m "Update"
git push
```
Vercel akan auto-deploy dalam ~1-2 menit.

---

## 📊 Struktur Environment Variables

```env
# Wajib
DATABASE_URL=postgresql://...
AUTH_SECRET=<32-char-base64>
AUTH_URL=https://your-app.vercel.app
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
ADMIN_EMAILS=admin@tp.idu.ac.id

# Opsional (kalau mau pakai Microsoft)
AUTH_MICROSOFT_ENTRA_ID_ID=...
AUTH_MICROSOFT_ENTRA_ID_SECRET=...
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/common/v2.0
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 💡 Tips

- **Free tier Vercel**: 100 GB bandwidth/bulan, cukup untuk ~1000 user
- **Free tier Supabase**: 500 MB database, 2 GB bandwidth — lebih dari cukup
- **Custom domain**: Settings → Domains → tambahkan domain sendiri (gratis)
- **Monitoring**: Vercel dashboard → Analytics untuk lihat traffic real-time
