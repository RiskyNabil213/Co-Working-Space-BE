-- Schema Database Coworking Space Reservation System (PostgreSQL)
-- UKK RPL Paket B 2026/2027

CREATE TABLE IF NOT EXISTS makers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    app_key VARCHAR(255) UNIQUE NOT NULL,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    maker_id INTEGER NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('admin_space', 'member')),
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL,
    UNIQUE (maker_id, username)
);

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_member VARCHAR(255) NOT NULL,
    instansi VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    telp VARCHAR(50) NOT NULL,
    foto TEXT,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS space_owners (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_coworking VARCHAR(255) NOT NULL,
    nama_pemilik VARCHAR(255) NOT NULL,
    alamat TEXT DEFAULT '',
    telp VARCHAR(50) NOT NULL,
    deskripsi_fasilitas TEXT DEFAULT '',
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS spaces (
    id SERIAL PRIMARY KEY,
    maker_id INTEGER NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
    id_owner INTEGER NOT NULL REFERENCES space_owners(id) ON DELETE CASCADE,
    nama_space VARCHAR(255) NOT NULL,
    harga_per_jam NUMERIC(12, 2) NOT NULL,
    tipe VARCHAR(50) NOT NULL CHECK(tipe IN ('desk', 'meeting_room', 'private_office')),
    kapasitas INTEGER NOT NULL DEFAULT 1,
    deskripsi TEXT NOT NULL,
    foto TEXT,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS diskons (
    id SERIAL PRIMARY KEY,
    maker_id INTEGER NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
    nama_diskon VARCHAR(255) NOT NULL,
    persentase_diskon NUMERIC(5, 2) NOT NULL,
    tanggal_awal VARCHAR(100) NOT NULL,
    tanggal_akhir VARCHAR(100) NOT NULL,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS reservasis (
    id SERIAL PRIMARY KEY,
    maker_id INTEGER NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
    kode_booking VARCHAR(100) NOT NULL,
    id_member INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    id_space INTEGER NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    id_diskon INTEGER NULL REFERENCES diskons(id) ON DELETE SET NULL,
    tanggal_reservasi VARCHAR(50) NOT NULL,
    jam_mulai VARCHAR(50) NOT NULL,
    jam_selesai VARCHAR(50) NOT NULL,
    durasi_jam INTEGER NOT NULL,
    harga_per_jam NUMERIC(12, 2) NOT NULL,
    total_harga_awal NUMERIC(12, 2) NOT NULL,
    potongan_diskon NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_bayar NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'belum_dikonfirm' CHECK(status IN ('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan')),
    check_in_time VARCHAR(100) NULL,
    check_out_time VARCHAR(100) NULL,
    created_at VARCHAR(100) NOT NULL,
    updated_at VARCHAR(100) NOT NULL
);

-- Indexes for performance & quick queries
CREATE INDEX IF NOT EXISTS idx_makers_app_key ON makers(app_key);
CREATE INDEX IF NOT EXISTS idx_users_maker_username ON users(maker_id, username);
CREATE INDEX IF NOT EXISTS idx_spaces_maker ON spaces(maker_id);
CREATE INDEX IF NOT EXISTS idx_reservasis_maker ON reservasis(maker_id);
CREATE INDEX IF NOT EXISTS idx_reservasis_date_space ON reservasis(tanggal_reservasi, id_space);
