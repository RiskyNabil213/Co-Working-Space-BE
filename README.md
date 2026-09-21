# Coworking Space Backend RESTful API (Smart Space Booking)
### Ujian Kompetensi Keahlian (UKK) RPL 2026/2027 — Paket B

Backend RESTful API lengkap untuk sistem pemesanan ruangan dan meja kerja (*Smart Coworking Space Reservation System*) yang dibangun sesuai dengan standar **Soal Ujian Praktik Kejuruan RPL Paket B**.

---

## 🌟 Fitur Utama Backend

1. **Multi-Tenancy App Maker (`x-maker-key`)**:
   - Isolasi data independen untuk setiap siswa/pengembang frontend via header `x-maker-key` atau `x-app-key`.
   - Default App Maker (`mk_default_ukk_2026`) sudah di-seed secara otomatis untuk pengujian langsung oleh Penguji/Guru.
2. **Autentikasi & Otorisasi Multi-Role JWT**:
   - Role `member`: Pendaftaran pelanggan, login, cek ketersediaan, reservasi real-time, klaim diskon, riwayat sewa bulanan, cetak E-Ticket digital.
   - Role `admin_space`: Pendaftaran pengelola, login, update profil lokasi, CRUD member, CRUD space, CRUD promo diskon, konfirmasi status reservasi, check-in, check-out, rekapitulasi estimasi & realisasi pendapatan bulanan.
3. **Pengecekan Ketersediaan Real-Time (Conflict Collision Detection)**:
   - Validasi jadwal sewa space untuk mencegah bentrokan pemesanan pada rentang jam dan tanggal yang sama.
4. **Penerbitan E-Ticket & QR Code Payload**:
   - Mengembalikan detail tiket lengkap dengan rincian biaya, kalkulasi diskon, data member, space, dan string verifikasi QR Code.
5. **Laporan & Rekapitulasi Pendapatan**:
   - Menghitung total transaksi, total jam terpakai, pendapatan kotor, total potongan promo, dan pendapatan bersih per jenis space (`desk`, `meeting_room`, `private_office`).
6. **Upload Berkas & Media**:
   - Upload gambar umum (`/uploads/general/`), foto space (`/uploads/spaces/`), dan foto profil member (`/uploads/members/`).
7. **Dokumentasi Interaktif & Postman Collection**:
   - Swagger UI interaktif di endpoint `http://localhost:3000/docs`.
   - File ekspor Postman Collection v2.1: `coworking_space_api.postman_collection.json`.

---

## 📁 Struktur Direktori

```
c:\UKK coworking\
├── package.json                              # Konfigurasi dependensi npm
├── .env                                      # Konfigurasi environment aktif
├── .env.example                              # Template konfigurasi environment
├── README.md                                 # Petunjuk teknis dan penggunaan
├── coworking_space_api.postman_collection.json # File Postman Collection 50 endpoint
├── database/
│   ├── schema.sql                            # Skema SQL DDL tabel relasional
│   └── database.sqlite                       # File basis data SQLite (auto-generate)
├── uploads/                                  # Folder penyimpanan file upload
│   ├── spaces/                               # Foto ruangan/meja coworking
│   ├── members/                              # Foto profil member
│   └── general/                              # Gambar & banner umum
└── src/
    ├── server.js                             # Entry point server
    ├── app.js                                # Konfigurasi Express, middleware & routes
    ├── config/
    │   ├── database.js                       # Koneksi SQLite, auto-migration & seeder
    │   └── swagger.js                        # Spesifikasi OpenAPI 3.0
    ├── middleware/
    │   ├── auth.js                           # Middleware JWT Multi-Role & Maker
    │   ├── multiTenancy.js                   # Middleware isolasi tenant x-maker-key
    │   ├── responseFormatter.js              # Standarisasi format JSON Response
    │   └── upload.js                         # Middleware Multer upload gambar
    ├── controllers/                          # Controller logika bisnis API
    │   ├── root.controller.js
    │   ├── maker.controller.js
    │   ├── auth.controller.js
    │   ├── space.controller.js
    │   ├── diskon.controller.js
    │   ├── reservasi.controller.js
    │   ├── admin.controller.js
    │   └── upload.controller.js
    └── routes/                               # Routing modular endpoint Express
        ├── root.routes.js
        ├── maker.routes.js
        ├── auth.routes.js
        ├── space.routes.js
        ├── diskon.routes.js
        ├── reservasi.routes.js
        ├── admin.routes.js
        └── upload.routes.js
```

---

## 🚀 Cara Menjalankan Server

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal:
```bash
npm install
```

### 2. Jalankan Server
Untuk mode development (dengan auto-reload file):
```bash
npm run dev
```

Atau untuk mode production:
```bash
npm start
```

Server akan aktif di:
- **Base URL**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/docs`
- **Swagger JSON**: `http://localhost:3000/docs-json`

---

## 🔑 Kredensial Default (Seeder Awal)

Untuk keperluan pengujian cepat oleh penguji/guru, akun default sudah tersedia tanpa perlu mendaftar dari awal:

### 1. Multi-Tenancy Key
- **Header**: `x-maker-key: mk_default_ukk_2026`

### 2. Akun Admin Space (Pengelola)
- **Username**: `admin_space1`
- **Password**: `Admin123!`
- **Role**: `admin_space`

### 3. Akun Member (Pengunjung)
- **Username**: `johndoe`
- **Password**: `Secret123!`
- **Role**: `member`

### 4. Akun App Maker (Siswa)
- **Username**: `admin_default`
- **Email**: `admin@ukk.sch.id`
- **Password**: `Admin123!`
- **App Key**: `mk_default_ukk_2026`

---

## 📑 Format Baku Response JSON

Sesuai standar Soal UKK Paket B:

### Format Response Sukses (200 / 201)
```json
{
  "status": true,
  "statusCode": 200,
  "message": "Berhasil memproses permintaan",
  "data": { ... },
  "timestamp": "2026-08-27T08:34:46.977Z"
}
```

### Format Response Error (400 / 401 / 403 / 404 / 500)
```json
{
  "status": false,
  "statusCode": 400,
  "message": "Keterangan pesan error",
  "error": "Bad Request",
  "timestamp": "2026-08-27T08:34:46.977Z"
}
```

---

## 🌐 Ringkasan Daftar 50 Endpoint API

| No | Method | Endpoint | Role / Hak Akses | Deskripsi Singkat |
|---|---|---|---|---|
| 1 | GET | `/` | Publik | Status API & petunjuk penggunaan |
| 2 | GET | `/health` | Publik | Health check server |
| 3 | POST | `/api/maker/register` | Publik | Registrasi akun siswa (App Maker) & generate `app_key` unik |
| 4 | POST | `/api/maker/login` | Publik | Login siswa pengembang frontend |
| 5 | GET | `/api/maker/me` | App Maker (Bearer) | Lihat profil & App Key siswa login |
| 6 | GET | `/api/maker/stats` | App Maker / Key | Statistik keseluruhan data siswa |
| 7 | GET | `/api/maker/list` | Penguji/Guru | Daftar semua siswa / App Maker terdaftar |
| 8 | POST | `/api/auth/register/member` | Publik (`x-maker-key`) | Registrasi akun member / pelanggan baru |
| 9 | POST | `/api/auth/register/admin-space` | Publik (`x-maker-key`) | Registrasi pengelola lokasi / admin coworking space |
| 10 | POST | `/api/auth/login` | Publik (`x-maker-key`) | Login akun user (mengembalikan token JWT) |
| 11 | GET | `/api/auth/profile` | Bearer User | Cek profil & hak akses user yang sedang login |
| 12 | GET | `/api/spaces/types` | Publik / User | Daftar tipe space (Personal Desk, Meeting Room, Private Office) |
| 13 | GET | `/api/spaces/availability` | Publik / User | Cek ketersediaan space berdasarkan tanggal & jam sewa |
| 14 | GET | `/api/spaces` | Publik / User | Lihat katalog space (filter `?tipe` & `?search`) |
| 15 | GET | `/api/spaces/{id}` | Publik / User | Lihat detail space berdasarkan ID |
| 16 | GET | `/api/diskon/active` | Publik / User | Daftar promo / diskon yang sedang aktif |
| 17 | POST | `/api/diskon/check` | Publik / User | Periksa validitas & hitung potongan kode promo |
| 18 | GET | `/api/diskon/{id}` | Publik / User | Lihat detail diskon berdasarkan ID |
| 19 | POST | `/api/reservasi` | Member (Bearer) | Buat pemesanan space baru (+ hitung promo otomatis) |
| 20 | GET | `/api/reservasi/my` | Member (Bearer) | Lihat status semua pemesanan milik sendiri |
| 21 | GET | `/api/reservasi/my/history` | Member (Bearer) | Lihat histori pemesanan per bulan & tahun |
| 22 | GET | `/api/reservasi/{id}/e-ticket` | Member / Admin (Bearer) | Cetak E-Ticket / bukti nota digital reservasi |
| 23 | GET | `/api/reservasi/{id}` | Member / Admin (Bearer) | Lihat detail reservasi berdasarkan ID |
| 24 | PATCH | `/api/reservasi/{id}/cancel` | Member (Bearer) | Batalkan pemesanan space |
| 25 | GET | `/api/admin/profile` | Admin Space (Bearer) | Lihat data profil lokasi coworking space |
| 26 | PUT | `/api/admin/profile` | Admin Space (Bearer) | Update data profil lokasi coworking space |
| 27 | GET | `/api/admin/members` | Admin Space (Bearer) | Daftar semua member / pelanggan (`?search=`) |
| 28 | POST | `/api/admin/members` | Admin Space (Bearer) | Tambah data member baru oleh Admin |
| 29 | GET | `/api/admin/members/{id}` | Admin Space (Bearer) | Detail data member berdasarkan ID |
| 30 | PUT | `/api/admin/members/{id}` | Admin Space (Bearer) | Update data member / pelanggan |
| 31 | DELETE | `/api/admin/members/{id}` | Admin Space (Bearer) | Hapus data member / pelanggan |
| 32 | GET | `/api/admin/spaces` | Admin Space (Bearer) | Daftar semua ruangan & meja milik admin |
| 33 | POST | `/api/admin/spaces` | Admin Space (Bearer) | Tambah ruangan/meja space baru |
| 34 | GET | `/api/admin/spaces/{id}` | Admin Space (Bearer) | Detail data space berdasarkan ID |
| 35 | PUT | `/api/admin/spaces/{id}` | Admin Space (Bearer) | Update data ruangan & fasilitas space |
| 36 | DELETE | `/api/admin/spaces/{id}` | Admin Space (Bearer) | Hapus data ruangan / meja space |
| 37 | GET | `/api/admin/diskon` | Admin Space (Bearer) | Daftar semua kode promo / diskon event |
| 38 | POST | `/api/admin/diskon` | Admin Space (Bearer) | Tambah kode promo / diskon baru |
| 39 | GET | `/api/admin/diskon/{id}` | Admin Space (Bearer) | Detail data diskon berdasarkan ID |
| 40 | PUT | `/api/admin/diskon/{id}` | Admin Space (Bearer) | Update data kode promo & periode diskon |
| 41 | DELETE | `/api/admin/diskon/{id}` | Admin Space (Bearer) | Hapus kode promo / diskon |
| 42 | GET | `/api/admin/reservasi` | Admin Space (Bearer) | Seluruh reservasi (`?month`, `?year`, `?status`, `?id_space`) |
| 43 | PATCH | `/api/admin/reservasi/{id}/status` | Admin Space (Bearer) | Konfirmasi & ubah status reservasi |
| 44 | POST | `/api/admin/reservasi/{id}/check-in` | Admin Space (Bearer) | Check-in tamu (status menjadi `aktif`) |
| 45 | POST | `/api/admin/reservasi/{id}/check-out` | Admin Space (Bearer) | Check-out tamu (status menjadi `selesai`) |
| 46 | GET | `/api/admin/reports/monthly` | Admin Space (Bearer) | Rekapitulasi estimasi & realisasi pendapatan per bulan |
| 47 | GET | `/api/admin/reports/income` | Admin Space (Bearer) | Alias ringkas pendapatan bulanan |
| 48 | POST | `/api/upload/image` | User / Admin | Upload berkas gambar umum (Multipart Form-Data) |
| 49 | POST | `/api/upload/spaces` | Admin Space | Upload foto ruangan / meja space |
| 50 | POST | `/api/upload/members` | User / Admin | Upload foto profil member |

---

## 🧪 Pengujian Menggunakan Postman

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas.
3. Pilih file `coworking_space_api.postman_collection.json` dari folder root proyek.
4. Koleksi akan otomatis memiliki variabel `baseUrl`, `makerKey`, `memberToken`, dan `adminToken`.
5. Anda dapat langsung menjalankan request login untuk mendapatkan token dan mencoba seluruh endpoint!
