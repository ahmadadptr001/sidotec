# 📬 SIDOTEC - Sistem Informasi Dokumentasi Surat Masuk & Keluar

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-development-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Deskripsi Project

**SIDOTEC** adalah aplikasi web modern untuk mengelola dan mendokumentasikan surat masuk dan surat keluar di **Politeknik Indotec Kendari**. Sistem ini menyediakan fitur lengkap untuk:

- ✅ Mengelola data surat (create, read, update, delete)
- ✅ Melakukan disposisi (routing) surat ke penerima
- ✅ Melacak status dan deadline disposisi
- ✅ Mengelola user dan role berbasis akses
- ✅ Menganalisis data dengan dashboard analytics
- ✅ Backup dan restore database (format JSON)
- ✅ Agenda surat masuk dan keluar

---

## 🛠️ Tech Stack

### Frontend

```
- Next.js 16.2.4        - React framework dengan SSR
- React 19.2.4          - UI library
- TypeScript 5          - Type safety
- TailwindCSS 4         - Styling
- React Hook Form 7.73  - Form management
- Zod 4.3.6             - Schema validation
- Axios 1.15.2          - HTTP client
- Chart.js 4.5.1        - Data visualization
- Lucide React 1.8.0    - Icons
- SweetAlert2 11.26.24  - Alerts & modals
```

### Backend

```
- Next.js API Routes    - Serverless backend
- Supabase 2.104.0      - PostgreSQL database & storage
- Node.js 18+
```

### DevTools

```
- ESLint 9              - Code linting
- PostCSS 4             - CSS processing
```

---

## 📁 Struktur Project

```
sidotec/
├── README.md                          # Dokumentasi project
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── eslint.config.mjs                  # ESLint configuration
│
├── app/                               # Next.js App Router
│   ├── page.tsx                       # Home page (auth check)
│   ├── layout.tsx                     # Root layout dengan UserProvider
│   ├── globals.css                    # Global styles
│   │
│   ├── autentikasi/
│   │   └── masuk/
│   │       └── page.tsx               # Login page
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                 # Dashboard layout (sidebar & nav)
│   │   ├── page.tsx                   # Dashboard overview dengan charts
│   │   │
│   │   ├── surat-masuk/
│   │   │   ├── page.tsx               # List incoming letters
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx      # Edit letter
│   │   │       └── disposisi/         # Disposition management
│   │   │
│   │   ├── surat-keluar/              # Similar structure for outgoing
│   │   │   ├── page.tsx
│   │   │   └── [id]/...
│   │   │
│   │   ├── surat/
│   │   │   └── tambah/page.tsx        # Add new letter form
│   │   │
│   │   ├── agenda/                    # Calendar views
│   │   │   ├── surat-masuk/
│   │   │   └── surat-keluar/
│   │   │
│   │   ├── backup/
│   │   │   └── page.tsx               # Download database backup (JSON)
│   │   │
│   │   ├── restore/
│   │   │   └── page.tsx               # Restore database dari JSON
│   │   │
│   │   └── setup/                     # Admin configuration
│   │       ├── akun/page.tsx          # User management
│   │       ├── hapus/page.tsx         # Delete data
│   │       ├── instansi/page.tsx      # Organization setup
│   │       └── role/page.tsx          # Role management
│   │
│   └── api/                           # Backend API Routes
│       ├── autentikasi/
│       │   ├── masuk/route.ts         # POST - Login
│       │   ├── daftar/route.ts        # POST - Register user
│       │   ├── hapus/[id]/route.ts    # GET - Delete user
│       │   ├── session/route.ts       # GET - Check session
│       │   └── removeSession/route.ts # GET - Logout
│       │
│       ├── surat/
│       │   ├── route.ts               # GET - List letters
│       │   ├── [id]/route.ts          # GET - Get letter by ID
│       │   ├── tambah/route.ts        # POST - Create letter
│       │   ├── edit/route.ts          # POST - Update letter
│       │   ├── hapus/[id]/route.ts    # GET - Delete letter
│       │   ├── rentang/route.ts       # GET - Get by date range
│       │   └── disposisi/
│       │       ├── route.ts           # GET - List dispositions
│       │       ├── [id]/route.ts      # GET - Get disposition
│       │       ├── id-surat/[id]/route.ts  # GET - By letter ID
│       │       ├── tambah/route.ts    # POST - Create disposition
│       │       └── edit/route.ts      # POST - Update disposition
│       │
│       ├── user/
│       │   ├── route.ts               # GET - List users
│       │   └── perbarui/route.ts      # POST - Update user
│       │
│       ├── backup/
│       │   └── route.ts               # GET - Download JSON backup
│       │
│       └── restore/
│           └── route.ts               # POST - Restore dari JSON backup
│
├── components/                        # Reusable React components
│   └── ui/
│       ├── Breadcrumbs.tsx            # Breadcrumb navigation
│       └── DetailSurat.tsx            # Letter detail panel
│
├── context/                           # React Context API
│   └── UserProvider.tsx               # Global user state management
│
├── services/                          # API service layer (Axios)
│   ├── user.ts                        # User auth & CRUD
│   ├── surat.ts                       # Letter CRUD & disposition
│   ├── instansi.ts                    # Organization functions
│   └── backup.ts                      # Backup & restore functions
│
├── config/                            # Configuration files
│   └── supabase.js                    # Supabase client setup
│
├── data/                              # Static data
│   └── role.ts                        # Role definitions
│
├── public/                            # Static assets
│   └── images/
│       └── bg.jpg                     # Login background
│
└── node_modules/                      # Dependencies
```

---

## 🗄️ Database Schema

### Table: `pengguna` (Users)

```sql
- id: UUID (Primary Key)
- username: VARCHAR (Unique)
- password: VARCHAR (⚠️ Currently plain text - needs hashing)
- email: VARCHAR (Unique)
- nama_lengkap: VARCHAR
- unit: VARCHAR
- jabatan: VARCHAR
- role: VARCHAR ('superadmin', 'admin', 'pimpinan', 'staff')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `surat` (Letters)

```sql
- id: SERIAL (Primary Key)
- nomor_agenda: VARCHAR
- nomor_surat: VARCHAR
- jenis: VARCHAR ('masuk', 'keluar')
- asal_surat: VARCHAR
- ringkasan: TEXT
- tujuan_surat: VARCHAR (Nullable)
- kode_klasifikasi: VARCHAR
- indeks_berkas: VARCHAR
- kategori: VARCHAR ('SDM', 'Keuangan', 'Umum', 'Akademik', 'Internal')
- tanggal: DATE
- keterangan: TEXT (Nullable)
- file: VARCHAR (URL to Supabase Storage)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `disposisi` (Letter Disposition/Routing)

```sql
- id: SERIAL (Primary Key)
- surat_id: SERIAL (Foreign Key -> surat.id)
- tujuan: VARCHAR
- sifat: VARCHAR
- deadline: DATE
- isi: TEXT
- catatan: TEXT (Nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Table: `instansi` (Organization)

```sql
- id: SERIAL (Primary Key)
- nama_instansi: VARCHAR
- status: VARCHAR
- alamat: TEXT
- website: VARCHAR
- email: VARCHAR
- nomor_telpon: VARCHAR
- akreditasi: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Storage Bucket: `surat`

- Stores PDF, JPG, PNG files
- Public URLs for download/preview
- Max 5MB per file

---

## 🔌 API Endpoints

### 🔐 Authentication (`/api/autentikasi/`)

| Method | Endpoint                         | Description                            | Auth |
| ------ | -------------------------------- | -------------------------------------- | ---- |
| POST   | `/api/autentikasi/masuk`         | Login dengan username/email & password | ❌   |
| POST   | `/api/autentikasi/daftar`        | Register user baru                     | ❌   |
| GET    | `/api/autentikasi/session`       | Cek session status                     | ❌   |
| GET    | `/api/autentikasi/removeSession` | Logout (hapus cookie)                  | ✅   |
| GET    | `/api/autentikasi/hapus/{id}`    | Hapus user by ID                       | ✅   |

### 📮 Letters (`/api/surat/`)

| Method | Endpoint                | Description               | Params                            |
| ------ | ----------------------- | ------------------------- | --------------------------------- |
| GET    | `/api/surat`            | Get letters dengan filter | `jenis=masuk\|keluar`, `limit=10` |
| GET    | `/api/surat/{id}`       | Get letter by ID          | -                                 |
| POST   | `/api/surat/tambah`     | Create letter (multipart) | Form data dengan file             |
| POST   | `/api/surat/edit`       | Update letter             | `id` query param                  |
| GET    | `/api/surat/hapus/{id}` | Delete letter             | -                                 |
| GET    | `/api/surat/rentang`    | Get letters by date range | `start_date`, `end_date`          |

### 🔄 Disposition (`/api/surat/disposisi/`)

| Method | Endpoint                             | Description                   | Params           |
| ------ | ------------------------------------ | ----------------------------- | ---------------- |
| GET    | `/api/surat/disposisi`               | Get semua dispositions        | -                |
| GET    | `/api/surat/disposisi/{id}`          | Get disposition by ID         | -                |
| GET    | `/api/surat/disposisi/id-surat/{id}` | Get dispositions untuk letter | -                |
| POST   | `/api/surat/disposisi/tambah`        | Create disposition            | Body: JSON       |
| POST   | `/api/surat/disposisi/edit`          | Update disposition            | `id` query param |

### 👤 Users (`/api/user/`)

| Method | Endpoint             | Description      | Auth |
| ------ | -------------------- | ---------------- | ---- |
| GET    | `/api/user`          | Get semua users  | ✅   |
| POST   | `/api/user/perbarui` | Update user data | ✅   |

### 🏢 Organization (`/api/instansi/`)

| Method | Endpoint               | Description            | Auth                 |
| ------ | ---------------------- | ---------------------- | -------------------- |
| GET    | `/api/instansi`        | Get organization data  | ✅                   |
| POST   | `/api/instansi/simpan` | Save organization data | `id` query param, ✅ |

### 💾 Backup & Restore (`/api/backup/`, `/api/restore/`)

| Method | Endpoint       | Description                     | Auth |
| ------ | -------------- | ------------------------------- | ---- |
| GET    | `/api/backup`  | Download database backup (JSON) | ✅   |
| POST   | `/api/restore` | Restore database dari JSON      | ✅   |

**Backup Format:**

```json
{
  "metadata": { "system": "SIDOTEC", "version": "0.1.0", "backup_date": "..." },
  "tables": { "pengguna": [], "surat": [], "disposisi": [], "instansi": [] },
  "statistics": { "total_pengguna": 0, "total_surat": 0, ... }
}
```

**Default Login After Restore:**

- Username: `admin`
- Password: `admin123`

---

## 📊 Request/Response Format

### Success Response

```json
{
  "status": 200,
  "data": {
    "id": 1,
    "nomor_surat": "001/SURAT/2026",
    "ringkasan": "...",
    ...
  }
}
```

### Error Response

```json
{
  "status": 401 | 500,
  "reason": "Pesan error yang spesifik"
}
```

---

## 🔐 Authentication & Authorization

### Roles & Permissions

| Role            | Deskripsi            | Akses                               |
| --------------- | -------------------- | ----------------------------------- |
| **Super Admin** | Administrator sistem | Full access semua fitur             |
| **Admin**       | Administrator data   | Manage users, letters, dispositions |
| **Pimpinan**    | Leadership/Approval  | View & approve dispositions         |
| **Staff**       | Data entry           | Create & view letters               |

### Session Management

```
- Method: HTTP-only cookies
- Name: "auth"
- Expiry: 24 jam
- Contains: User data JSON
- Validation: Checked on protected routes
```

---

## 🚀 Getting Started

### Prerequisites

```bash
- Node.js 18+
- npm atau yarn
- Akun Supabase (PostgreSQL database)
```

### Installation

1. **Clone repository**

```bash
git clone <repository-url>
cd sidotec
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Salin `.env.example` menjadi `.env` di root directory, lalu isi nilainya:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Kunci untuk menandatangani cookie sesi. WAJIB diisi — tanpa ini seluruh
# proses login akan gagal. Minimal 32 karakter, buat dengan:
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
AUTH_SECRET=your_random_secret
```

> Mengganti `AUTH_SECRET` membuat semua sesi yang sedang berjalan tidak berlaku
> (pengguna harus login ulang). Jangan pernah commit berkas `.env`.

4. **Run development server**

```bash
npm run dev
```

5. **Open di browser**

```
http://localhost:3000
```

---

## 📝 Development Scripts

```bash
# Start development server dengan hot reload
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Run ESLint untuk check kode
npm run lint
```

---

## 📋 Form Validation

Semua form menggunakan **React Hook Form** + **Zod** untuk validasi:

### Letter Form Schema

```typescript
{
  nomor_agenda: string (required)
  nomor_surat: string (required)
  jenis: "masuk" | "keluar" (required)
  asal_surat: string (required)
  ringkasan: string (required)
  kode_klasifikasi: string (required)
  indeks_berkas: string (required)
  tanggal: date (required)
  kategori: "SDM" | "Keuangan" | "Umum" | "Akademik" | "Internal" (required)
  file: File (required, max 5MB, PDF/JPG/PNG only)
  keterangan: string (optional)
  tujuan_surat: string (optional)
}
```

---

## 🎨 Key Components

### DetailSurat.tsx

Panel side untuk menampilkan detail surat dengan:

- Ringkasan/Perihal
- Nomor & asal surat
- Tanggal & kategori
- File preview (image/PDF)
- Print & download buttons

### Breadcrumbs.tsx

Navigation breadcrumb untuk memudahkan navigasi hierarki page.

### UserProvider

Global state management untuk:

- Current user data
- Organization (instansi) data
- Setter functions

---

## ⚠️ Known Issues & Security Concerns

### 🔴 CRITICAL

- ⚠️ Passwords stored plain text (tidak di-hash)
- ⚠️ Minimal input validation pada backend
- ⚠️ Tidak ada CSRF protection

### 🟠 HIGH

- ⚠️ No comprehensive error handling
- ⚠️ Missing SQL injection prevention
- ⚠️ Session cookie stores entire user object

### 🟡 MEDIUM

- ⚠️ No logging system
- ⚠️ No audit trail
- ⚠️ Missing rate limiting

---

## 🔧 Recommended Improvements

### Phase 1 - CRITICAL (Immediate)

- [ ] Implement password hashing (bcrypt)
- [ ] Add input validation & sanitization
- [ ] Implement CSRF token protection
- [ ] Fix TypeScript `any` types

### Phase 2 - HIGH (Week 1-2)

- [ ] Add comprehensive error handling
- [ ] Implement logging system
- [ ] Add test suite (Jest + React Testing)
- [ ] Fix session management

### Phase 3 - MEDIUM (Week 3-4)

- [ ] Email notifications
- [ ] Advanced search & filters
- [ ] Performance optimization
- [ ] Database indexing

### Phase 4 - NICE-TO-HAVE

- [ ] Real-time updates (WebSockets)
- [ ] Document versioning
- [ ] Full-text search / OCR
- [ ] Two-factor authentication

---

## 📊 Project Statistics

| Metric                    | Value   |
| ------------------------- | ------- |
| Routes (Frontend Pages)   | 20+     |
| API Endpoints             | 30+     |
| Database Tables           | 4       |
| Reusable Components       | 2+      |
| Service Modules           | 4       |
| Lines of Code (Estimated) | 3000+   |
| TypeScript Coverage       | Partial |
| Test Coverage             | 0%      |

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/nama-fitur`
2. Commit changes: `git commit -m 'Add fitur'`
3. Push to branch: `git push origin feature/nama-fitur`
4. Open Pull Request

---

## 📞 Support & Contact

Untuk pertanyaan atau issue, silakan:

- Buka issue di repository
- Hubungi tim development
- Check dokumentasi di `/docs` folder

---

## 📄 License

MIT License - Lihat file LICENSE untuk detail

---

## 🙏 Acknowledgments

- Supabase untuk database & storage solution
- Next.js untuk framework yang powerful
- React community untuk ecosystem yang excellent
- Politeknik Indotec Kendari sebagai client

---

**Last Updated**: April 25, 2026
**Version**: 0.1.0 (Development)
**Status**: 🟡 In Development
