# SenatVote - E-Voting Ketua Senat Kampus

Sistem pemilihan Ketua Senat Kampus yang aman, transparan, modern, dan production-ready menggunakan **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**, **Prisma**, **PostgreSQL (Supabase)**, dan **Microsoft Entra ID**.

## ✨ Fitur Utama

- 🔐 **Login Microsoft Entra ID** — Validasi domain kampus `@tp.idu.ac.id`
- 🗳️ **Voting Aman** — 1 akun 1 suara, konfirmasi modal, tidak dapat diubah
- 🔒 **Privasi Pemilih** — Identitas tidak terhubung dengan pilihan
- 📊 **Hasil Realtime** — Grafik batang & pie chart auto-update
- 👨‍💼 **Dashboard Admin** — Kelola kandidat, pengaturan, dan export
- 📜 **Audit Log** — Catatan lengkap aktivitas sistem
- 🌙 **Dark Mode** & **Mobile Responsive**
- ⏱️ **Rate Limiting**, **CSRF protection**, **Server-side validation**

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Shadcn UI |
| Backend | Next.js API Routes, NextAuth v5 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Microsoft Entra ID (NextAuth) |
| Realtime | Server-Sent Events (SSE) + Supabase |
| Charts | Recharts |
| Export | jsPDF, ExcelJS |

## 📦 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment

Salin `.env.example` ke `.env` lalu isi:

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_MICROSOFT_ENTRA_ID_ID="..."
AUTH_MICROSOFT_ENTRA_ID_SECRET="..."
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
ADMIN_EMAILS="admin@tp.idu.ac.id"
```

### 3. Setup database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Setup Microsoft Entra ID

1. Buka [Azure Portal](https://portal.azure.com) → **App registrations**
2. Buat app baru, set redirect URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
3. Copy **Client ID** & **Client Secret** ke `.env`
4. Pastikan `User.Read` scope diizinkan

### 5. Run

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing
│   │   ├── login/                # Login Microsoft
│   │   ├── hasil/                # Hasil realtime
│   │   ├── voting/               # Halaman voting
│   │   │   └── success/          # Setelah voting
│   │   └── admin/                # Admin only
│   │       ├── page.tsx          # Dashboard
│   │       ├── candidates/       # CRUD kandidat
│   │       ├── settings/         # Pengaturan voting
│   │       └── audit/            # Audit log
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth
│       ├── candidates/           # GET kandidat
│       ├── vote/                 # POST vote
│       ├── results/              # GET + SSE stream
│       ├── settings/             # GET settings
│       ├── admin/                # Admin endpoints
│       └── export/               # PDF & Excel
├── components/                   # UI components
├── lib/                          # utils, prisma, auth, audit
├── auth.ts                       # NextAuth config
└── middleware.ts                 # Route protection
```

## 🔒 Security

- **Domain validation** — Hanya `@tp.idu.ac.id`
- **Middleware** — Proteksi route admin & voting
- **Rate limiting** — 5 votes/menit per user
- **Atomic transactions** — Cegah double voting
- **Zod validation** — Server-side input validation
- **CSRF protection** — NextAuth built-in
- **Audit logging** — Semua aktivitas tercatat

## 🚀 Production Checklist

- [ ] Setup Supabase project
- [ ] Konfigurasi Microsoft Entra ID
- [ ] Set strong `AUTH_SECRET`
- [ ] Setup database dengan `prisma db push`
- [ ] Jalankan `npm run build`
- [ ] Deploy ke Vercel/production server

## 📝 License

MIT
