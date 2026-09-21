"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor() {
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    onModuleInit() {
        const dbDir = path.resolve(process.cwd(), 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        const dbPath = process.env.DB_PATH
            ? path.resolve(process.cwd(), process.env.DB_PATH)
            : path.resolve(dbDir, 'database.sqlite');
        const sqlite = sqlite3.verbose();
        this.db = new sqlite.Database(dbPath, async (err) => {
            if (err) {
                this.logger.error(`❌ Gagal membuka database SQLite: ${err.message}`);
            }
            else {
                this.logger.log(` Connected to SQLite database: ${dbPath}`);
                this.db.run('PRAGMA foreign_keys = ON;');
                await this.initDatabase();
            }
        });
    }
    onModuleDestroy() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    this.logger.error(`Error closing database: ${err.message}`);
                }
            });
        }
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row || null);
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async initDatabase() {
        try {
            const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                await this.exec(schemaSql);
                this.logger.log(' Database schema verified/initialized successfully.');
            }
            const defaultAppKey = process.env.DEFAULT_MAKER_KEY || 'mk_default_ukk_2026';
            let defaultMaker = await this.get('SELECT * FROM makers WHERE app_key = ?', [defaultAppKey]);
            let makerId = defaultMaker ? defaultMaker.id : null;
            if (!defaultMaker) {
                const now = new Date().toISOString();
                const hashedPassword = await bcrypt.hash('Admin123!', 10);
                const res = await this.run(`INSERT INTO makers (name, username, email, password, app_key, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    'Admin Default UKK',
                    'admin_default',
                    'admin@ukk.sch.id',
                    hashedPassword,
                    defaultAppKey,
                    '2026-08-27T00:00:00.000Z',
                    '2026-08-27T00:00:00.000Z',
                ]);
                makerId = res.lastID;
                this.logger.log(` Created default maker: ID=${makerId}, Key=${defaultAppKey}`);
                const adminPass = await bcrypt.hash('Admin123!', 10);
                const userAdmin = await this.run(`INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
           VALUES (?, ?, ?, 'admin_space', ?, ?)`, [makerId, 'admin_space1', adminPass, now, now]);
                const ownerRes = await this.run(`INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    userAdmin.lastID,
                    'Moklet Hub Coworking Space',
                    'Ahmad Bidin, S.Kom',
                    'Jl. Danau Ranau No. 1, Sawojajar, Malang',
                    '081298765432',
                    'Coworking modern dengan koneksi internet cepat, ruang meeting lengkap, dan kopi gratis.',
                    now,
                    now,
                ]);
                const ownerId = ownerRes.lastID;
                await this.run(`INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    makerId,
                    ownerId,
                    'Personal Desk - Flexi 01',
                    20000,
                    'desk',
                    1,
                    'Meja kerja individual yang tenang dan nyaman dengan colokan listrik, WiFi kencang 100Mbps, lampu meja LED, dan free refill air mineral.',
                    'desk_flexi_01.jpg',
                    now,
                    now,
                ]);
                await this.run(`INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    makerId,
                    ownerId,
                    'Meeting Room Alpha',
                    100000,
                    'meeting_room',
                    8,
                    'Ruang rapat kedap suara berkapasitas 8 orang, dilengkapi Smart TV 55 inch, soundbar Bluetooth, whiteboard kaca, AC dingin, dan conference speaker.',
                    'meeting_room_alpha.jpg',
                    now,
                    now,
                ]);
                await this.run(`INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    makerId,
                    ownerId,
                    'Private Office Suite 01',
                    150000,
                    'private_office',
                    4,
                    'Ruang kantor privat eksklusif untuk tim kecil 4 orang, meja kerja ergonomis, smart door lock, dan lemari berkas.',
                    'private_office_01.jpg',
                    now,
                    now,
                ]);
                await this.run(`INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    makerId,
                    'DISKONHEMAT20',
                    20,
                    '2026-01-01T00:00:00.000Z',
                    '2026-12-31T23:59:59.000Z',
                    now,
                    now,
                ]);
                await this.run(`INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    makerId,
                    'UKKPROMO50',
                    50,
                    '2026-08-01T00:00:00.000Z',
                    '2026-09-30T23:59:59.000Z',
                    now,
                    now,
                ]);
                const demoMembers = [
                    {
                        username: 'johndoe',
                        nama: 'John Doe',
                        instansi: 'Universitas Indonesia / Digital Studio',
                        alamat: 'Jl. Sudirman No. 123, Jakarta Selatan',
                        telp: '081234567890',
                        foto: 'member_john.jpg',
                    },
                    {
                        username: 'budiraharjo',
                        nama: 'Budi Raharjo',
                        instansi: 'PT Solusi Cloud Indonesia',
                        alamat: 'Jl. Gatot Subroto Kav. 52, Jakarta',
                        telp: '085712345678',
                        foto: 'member_budi.jpg',
                    },
                    {
                        username: 'sitiaminah',
                        nama: 'Siti Aminah',
                        instansi: 'Freelance UI/UX Designer',
                        alamat: 'Jl. Kaliurang KM 5, Yogyakarta',
                        telp: '081399887766',
                        foto: 'member_siti.jpg',
                    },
                    {
                        username: 'rianpratama',
                        nama: 'Rian Pratama',
                        instansi: 'Tech Corporate Guest',
                        alamat: 'Jl. MH Thamrin No. 9, Surabaya',
                        telp: '082155443322',
                        foto: 'member_rian.jpg',
                    },
                    {
                        username: 'mayaindah',
                        nama: 'Maya Indah',
                        instansi: 'Startup Founder Moklet',
                        alamat: 'Jl. Danau Toba G6, Malang',
                        telp: '081288990011',
                        foto: 'member_maya.jpg',
                    },
                ];
                const memberPass = await bcrypt.hash('Secret123!', 10);
                for (const dm of demoMembers) {
                    const userMember = await this.run(`INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
             VALUES (?, ?, ?, 'member', ?, ?)`, [makerId, dm.username, memberPass, now, now]);
                    await this.run(`INSERT INTO members (user_id, nama_member, instansi, alamat, telp, foto, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                        userMember.lastID,
                        dm.nama,
                        dm.instansi,
                        dm.alamat,
                        dm.telp,
                        dm.foto,
                        now,
                        now,
                    ]);
                }
                this.logger.log(' Default seed data inserted successfully.');
            }
            if (makerId) {
                const resCount = await this.get('SELECT COUNT(*) as count FROM reservasis WHERE maker_id = ?', [makerId]);
                if (resCount && resCount.count === 0) {
                    const firstMember = await this.get('SELECT id FROM members LIMIT 1');
                    const space1 = await this.get('SELECT id, harga_per_jam FROM spaces WHERE tipe = "desk" LIMIT 1');
                    const space2 = await this.get('SELECT id, harga_per_jam FROM spaces WHERE tipe = "meeting_room" LIMIT 1');
                    const diskon = await this.get('SELECT id, persentase_diskon FROM diskons LIMIT 1');
                    const now = new Date().toISOString();
                    const today = new Date().toISOString().split('T')[0];
                    if (firstMember && space1 && space2) {
                        await this.run(`INSERT INTO reservasis (
                maker_id, kode_booking, id_member, id_space, id_diskon,
                tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
                harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
                status, created_at, updated_at
              ) VALUES (?, 'UHUB-RES-9901', ?, ?, ?, ?, '09:00', '12:00', 3, ?, ?, ?, ?, 'belum_dikonfirm', ?, ?)`, [
                            makerId,
                            firstMember.id,
                            space2.id,
                            diskon?.id || null,
                            today,
                            space2.harga_per_jam,
                            space2.harga_per_jam * 3,
                            diskon ? (space2.harga_per_jam * 3 * diskon.persentase_diskon) / 100 : 0,
                            diskon ? space2.harga_per_jam * 3 * (1 - diskon.persentase_diskon / 100) : space2.harga_per_jam * 3,
                            now,
                            now,
                        ]);
                        await this.run(`INSERT INTO reservasis (
                maker_id, kode_booking, id_member, id_space, id_diskon,
                tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
                harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
                status, created_at, updated_at
              ) VALUES (?, 'UHUB-RES-7721', ?, ?, NULL, ?, '13:00', '17:00', 4, ?, ?, 0, ?, 'disetujui', ?, ?)`, [
                            makerId,
                            firstMember.id,
                            space1.id,
                            today,
                            space1.harga_per_jam,
                            space1.harga_per_jam * 4,
                            space1.harga_per_jam * 4,
                            now,
                            now,
                        ]);
                        await this.run(`INSERT INTO reservasis (
                maker_id, kode_booking, id_member, id_space, id_diskon,
                tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
                harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
                status, check_in_time, check_out_time, created_at, updated_at
              ) VALUES (?, 'UHUB-RES-5510', ?, ?, NULL, ?, '08:00', '12:00', 4, ?, ?, 0, ?, 'selesai', ?, ?, ?, ?)`, [
                            makerId,
                            firstMember.id,
                            space1.id,
                            today,
                            space1.harga_per_jam,
                            space1.harga_per_jam * 4,
                            space1.harga_per_jam * 4,
                            now,
                            now,
                            now,
                            now,
                        ]);
                        this.logger.log(' Demo reservations seeded successfully.');
                    }
                }
            }
        }
        catch (err) {
            this.logger.error(`❌ Inisialisasi Database Gagal: ${err.message}`);
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map