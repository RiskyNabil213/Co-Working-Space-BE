import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  async onModuleInit() {
    await this.initPostgres();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log(' PostgreSQL connection pool closed.');
    }
  }

  private async initPostgres() {
    let poolConfig: PoolConfig;

    if (process.env.DATABASE_URL) {
      const isRemote =
        process.env.DATABASE_URL.includes('supabase') ||
        process.env.DATABASE_URL.includes('neon') ||
        process.env.DATABASE_URL.includes('railway') ||
        process.env.DATABASE_URL.includes('aiven') ||
        process.env.DB_SSL === 'true';

      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      };
    } else {
      const host = process.env.DB_HOST || 'localhost';
      const port = Number(process.env.DB_PORT) || 5432;
      const user = process.env.DB_USER || 'postgres';
      const password = process.env.DB_PASSWORD || 'postgres';
      const database = process.env.DB_NAME || 'coworking_space';
      const useSsl = process.env.DB_SSL === 'true';

      // First check if target database exists; if not, try to create it automatically
      try {
        const rootPool = new Pool({
          host,
          port,
          user,
          password,
          database: 'postgres',
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
          connectionTimeoutMillis: 5000,
        });

        const checkDb = await rootPool.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [database],
        );
        if (checkDb.rowCount === 0) {
          this.logger.log(` Database '${database}' belum ada, membuat database otomatis...`);
          await rootPool.query(`CREATE DATABASE "${database}"`);
          this.logger.log(` Database '${database}' berhasil dibuat.`);
        }
        await rootPool.end();
      } catch (rootErr) {
        this.logger.debug(`Root postgres probe note: ${rootErr.message}`);
      }

      poolConfig = {
        host,
        port,
        user,
        password,
        database,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };
    }

    this.pool = new Pool(poolConfig);

    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log(` Connected successfully to PostgreSQL database.`);
      await this.initPostgresDatabase();
    } catch (connErr) {
      this.logger.error(`❌ Gagal terhubung ke PostgreSQL database: ${connErr.message}`);
      this.logger.warn(`💡 Pastikan service PostgreSQL aktif dan konfigurasi DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME di file .env sudah sesuai.`);
    }
  }

  /**
   * Transforms generic SQL with '?' placeholders into PostgreSQL-compatible '$1, $2, ...'
   * and normalizes SQLite date functions like strftime(...) to standard ANSI SQL.
   */
  private transformSql(sql: string, isInsertRun = false): string {
    let transformed = sql;

    // Replace SQLite strftime patterns if any
    transformed = transformed.replace(/strftime\s*\(\s*['"]%Y-%m['"]\s*,\s*([^)]+)\)/gi, 'SUBSTR($1, 1, 7)');
    transformed = transformed.replace(/strftime\s*\(\s*['"]%Y['"]\s*,\s*([^)]+)\)/gi, 'SUBSTR($1, 1, 4)');
    transformed = transformed.replace(/strftime\s*\(\s*['"]%m['"]\s*,\s*([^)]+)\)/gi, 'SUBSTR($1, 6, 2)');
    transformed = transformed.replace(/strftime\s*\(\s*['"]%d['"]\s*,\s*([^)]+)\)/gi, 'CAST(SUBSTR($1, 9, 2) AS INTEGER)');

    // Convert '?' to '$1', '$2', ...
    let paramIndex = 1;
    transformed = transformed.replace(/\?/g, () => `$${paramIndex++}`);

    // If it's an INSERT statement in run() and doesn't have RETURNING, append RETURNING id
    if (isInsertRun) {
      const trimmed = transformed.trim();
      if (/^INSERT\s+INTO/i.test(trimmed) && !/RETURNING/i.test(trimmed)) {
        transformed = `${trimmed} RETURNING id`;
      }
    }

    return transformed;
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!this.pool) return null;
    const pgSql = this.transformSql(sql);
    const res = await this.pool.query(pgSql, params);
    return (res.rows[0] as T) || null;
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) return [];
    const pgSql = this.transformSql(sql);
    const res = await this.pool.query(pgSql, params);
    return (res.rows as T[]) || [];
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    if (!this.pool) return { lastID: 0, changes: 0 };
    const pgSql = this.transformSql(sql, true);
    const res = await this.pool.query(pgSql, params);
    const lastID = res.rows && res.rows[0]?.id ? Number(res.rows[0].id) : 0;
    const changes = res.rowCount || 0;
    return { lastID, changes };
  }

  async exec(sql: string): Promise<void> {
    if (!this.pool) return;
    await this.pool.query(sql);
  }

  private async initPostgresDatabase() {
    try {
      const schemaPath = path.resolve(process.cwd(), 'database/schema_postgres.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await this.exec(schemaSql);
        this.logger.log(' PostgreSQL schema verified/initialized successfully.');
      }

      await this.seedDefaultData();
    } catch (err) {
      this.logger.error(`❌ Inisialisasi PostgreSQL Database Gagal: ${err.message}`);
    }
  }

  private async seedDefaultData() {
    try {
      const defaultAppKey = process.env.DEFAULT_MAKER_KEY || 'mk_default_ukk_2026';
      const now = new Date().toISOString();
      let defaultMaker = await this.get('SELECT * FROM makers WHERE app_key = ?', [defaultAppKey]);
      let makerId = defaultMaker ? defaultMaker.id : null;

      if (!defaultMaker) {
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        const res = await this.run(
          `INSERT INTO makers (name, username, email, password, app_key, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            'Admin Default UKK',
            'admin_default',
            'admin@ukk.sch.id',
            hashedPassword,
            defaultAppKey,
            '2026-08-27T00:00:00.000Z',
            '2026-08-27T00:00:00.000Z',
          ],
        );
        makerId = res.lastID;
        this.logger.log(` Created default maker: ID=${makerId}, Key=${defaultAppKey}`);
      }

      if (!makerId) return;

      // Ensure Admin Space User and Owner exist
      let userAdmin = await this.get("SELECT * FROM users WHERE maker_id = ? AND role = 'admin_space' LIMIT 1", [makerId]);
      let adminUserId = userAdmin ? userAdmin.id : null;
      if (!userAdmin) {
        const adminPass = await bcrypt.hash('Admin123!', 10);
        const resAdmin = await this.run(
          `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
           VALUES (?, ?, ?, 'admin_space', ?, ?)`,
          [makerId, 'admin_space1', adminPass, now, now],
        );
        adminUserId = resAdmin.lastID;
      }

      let owner = await this.get('SELECT * FROM space_owners WHERE user_id = ? LIMIT 1', [adminUserId]);
      let ownerId = owner ? owner.id : null;
      if (!owner && adminUserId) {
        const ownerRes = await this.run(
          `INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            adminUserId,
            'Moklet Hub Coworking Space',
            'Ahmad Bidin, S.Kom',
            'Jl. Danau Ranau No. 1, Sawojajar, Malang',
            '081298765432',
            'Coworking modern dengan koneksi internet cepat, ruang meeting lengkap, dan kopi gratis.',
            now,
            now,
          ],
        );
        ownerId = ownerRes.lastID;
      }

      // Ensure Spaces exist
      const spacesCount = await this.get('SELECT COUNT(*) as count FROM spaces WHERE maker_id = ?', [makerId]);
      if (spacesCount && Number(spacesCount.count) === 0 && ownerId) {
        await this.run(
          `INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );

        await this.run(
          `INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );

        await this.run(
          `INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );
        this.logger.log(' Default spaces seeded successfully.');
      }

      // Ensure Discounts exist
      const diskonCount = await this.get('SELECT COUNT(*) as count FROM diskons WHERE maker_id = ?', [makerId]);
      if (diskonCount && Number(diskonCount.count) === 0) {
        await this.run(
          `INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            makerId,
            'DISKONHEMAT20',
            20,
            '2026-01-01T00:00:00.000Z',
            '2026-12-31T23:59:59.000Z',
            now,
            now,
          ],
        );

        await this.run(
          `INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            makerId,
            'UKKPROMO50',
            50,
            '2026-08-01T00:00:00.000Z',
            '2026-09-30T23:59:59.000Z',
            now,
            now,
          ],
        );
      }

      // Ensure Members exist
      const membersCount = await this.get(
        'SELECT COUNT(*) as count FROM members m JOIN users u ON m.user_id = u.id WHERE u.maker_id = ?',
        [makerId],
      );
      if (membersCount && Number(membersCount.count) === 0) {
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
          const userMember = await this.run(
            `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
             VALUES (?, ?, ?, 'member', ?, ?)`,
            [makerId, dm.username, memberPass, now, now],
          );

          await this.run(
            `INSERT INTO members (user_id, nama_member, instansi, alamat, telp, foto, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userMember.lastID,
              dm.nama,
              dm.instansi,
              dm.alamat,
              dm.telp,
              dm.foto,
              now,
              now,
            ],
          );
        }
      }

      // Check if reservations exist
      const resCount = await this.get('SELECT COUNT(*) as count FROM reservasis WHERE maker_id = ?', [makerId]);
      if (resCount && Number(resCount.count) === 0) {
        const firstMember = await this.get('SELECT id FROM members LIMIT 1');
        const space1 = await this.get("SELECT id, harga_per_jam FROM spaces WHERE tipe = 'desk' LIMIT 1");
        const space2 = await this.get("SELECT id, harga_per_jam FROM spaces WHERE tipe = 'meeting_room' LIMIT 1");
        const diskon = await this.get('SELECT id, persentase_diskon FROM diskons LIMIT 1');
        const today = new Date().toISOString().split('T')[0];

        if (firstMember && space1 && space2) {
          // 1. Pending Approval Reservation
          await this.run(
            `INSERT INTO reservasis (
              maker_id, kode_booking, id_member, id_space, id_diskon,
              tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
              harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
              status, created_at, updated_at
            ) VALUES (?, 'UHUB-RES-9901', ?, ?, ?, ?, '09:00', '12:00', 3, ?, ?, ?, ?, 'belum_dikonfirm', ?, ?)`,
            [
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
            ],
          );

          // 2. Approved Reservation
          await this.run(
            `INSERT INTO reservasis (
              maker_id, kode_booking, id_member, id_space, id_diskon,
              tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
              harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
              status, created_at, updated_at
            ) VALUES (?, 'UHUB-RES-7721', ?, ?, NULL, ?, '13:00', '17:00', 4, ?, ?, 0, ?, 'disetujui', ?, ?)`,
            [
              makerId,
              firstMember.id,
              space1.id,
              today,
              space1.harga_per_jam,
              space1.harga_per_jam * 4,
              space1.harga_per_jam * 4,
              now,
              now,
            ],
          );

          // 3. Completed Reservation
          await this.run(
            `INSERT INTO reservasis (
              maker_id, kode_booking, id_member, id_space, id_diskon,
              tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
              harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
              status, check_in_time, check_out_time, created_at, updated_at
            ) VALUES (?, 'UHUB-RES-5510', ?, ?, NULL, ?, '08:00', '12:00', 4, ?, ?, 0, ?, 'selesai', ?, ?, ?, ?)`,
            [
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
            ],
          );
          this.logger.log(' Demo reservations seeded successfully.');
        }
      }
    } catch (err) {
      this.logger.error(`❌ Seeding Data Gagal: ${err.message}`);
    }
  }
}
