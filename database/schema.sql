-- Schema Database Coworking Space Reservation System
-- UKK RPL Paket B 2026/2027

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS makers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    app_key TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maker_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin_space', 'member')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (maker_id) REFERENCES makers(id) ON DELETE CASCADE,
    UNIQUE (maker_id, username)
);

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nama_member TEXT NOT NULL,
    instansi TEXT NOT NULL,
    alamat TEXT NOT NULL,
    telp TEXT NOT NULL,
    foto TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS space_owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nama_coworking TEXT NOT NULL,
    nama_pemilik TEXT NOT NULL,
    alamat TEXT DEFAULT '',
    telp TEXT NOT NULL,
    deskripsi_fasilitas TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maker_id INTEGER NOT NULL,
    id_owner INTEGER NOT NULL,
    nama_space TEXT NOT NULL,
    harga_per_jam REAL NOT NULL,
    tipe TEXT NOT NULL CHECK(tipe IN ('desk', 'meeting_room', 'private_office')),
    kapasitas INTEGER NOT NULL DEFAULT 1,
    deskripsi TEXT NOT NULL,
    foto TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (maker_id) REFERENCES makers(id) ON DELETE CASCADE,
    FOREIGN KEY (id_owner) REFERENCES space_owners(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diskons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maker_id INTEGER NOT NULL,
    nama_diskon TEXT NOT NULL,
    persentase_diskon REAL NOT NULL,
    tanggal_awal TEXT NOT NULL,
    tanggal_akhir TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (maker_id) REFERENCES makers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservasis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maker_id INTEGER NOT NULL,
    kode_booking TEXT NOT NULL,
    id_member INTEGER NOT NULL,
    id_space INTEGER NOT NULL,
    id_diskon INTEGER NULL,
    tanggal_reservasi TEXT NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    durasi_jam INTEGER NOT NULL,
    harga_per_jam REAL NOT NULL,
    total_harga_awal REAL NOT NULL,
    potongan_diskon REAL NOT NULL DEFAULT 0,
    total_bayar REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'belum_dikonfirm' CHECK(status IN ('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan')),
    check_in_time TEXT NULL,
    check_out_time TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (maker_id) REFERENCES makers(id) ON DELETE CASCADE,
    FOREIGN KEY (id_member) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (id_space) REFERENCES spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (id_diskon) REFERENCES diskons(id) ON DELETE SET NULL
);

-- Indexes for performance & quick queries
CREATE INDEX IF NOT EXISTS idx_makers_app_key ON makers(app_key);
CREATE INDEX IF NOT EXISTS idx_users_maker_username ON users(maker_id, username);
CREATE INDEX IF NOT EXISTS idx_spaces_maker ON spaces(maker_id);
CREATE INDEX IF NOT EXISTS idx_reservasis_maker ON reservasis(maker_id);
CREATE INDEX IF NOT EXISTS idx_reservasis_date_space ON reservasis(tanggal_reservasi, id_space);
