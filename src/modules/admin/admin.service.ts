import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  // Helper to normalize status values between frontend formats and database CHECK constraints
  private normalizeStatus(status: string): string {
    if (!status) return 'belum_dikonfirm';
    const s = status.toLowerCase().trim();
    if (s === 'pending' || s === 'belum_dikonfirmasi') return 'belum_dikonfirm';
    if (s === 'approved') return 'disetujui';
    if (s === 'active') return 'aktif';
    if (s === 'completed') return 'selesai';
    if (s === 'rejected' || s === 'cancelled' || s === 'canceled') return 'dibatalkan';
    return s;
  }

  // ================= 1. SPACES CRUD =================
  async getSpaces(user: any, queryParams?: any) {
    const { tipe, search } = queryParams || {};
    let sql = 'SELECT * FROM spaces WHERE maker_id = ?';
    const params: any[] = [user.maker_id];

    if (tipe && tipe !== 'all') {
      sql += ' AND tipe = ?';
      params.push(tipe);
    }
    if (search) {
      sql += ' AND (nama_space LIKE ? OR deskripsi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id DESC';
    const spaces = await this.db.all(sql, params);

    return {
      success: true,
      total: spaces.length,
      data: spaces,
    };
  }

  async createSpace(user: any, body: any) {
    const { nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto } = body;

    if (!nama_space || !harga_per_jam || !tipe || !kapasitas) {
      throw new BadRequestException({
        success: false,
        message: 'nama_space, harga_per_jam, tipe, dan kapasitas wajib diisi.',
      });
    }

    // Resolve owner_id
    let ownerId = user.owner_id;
    if (!ownerId) {
      const owner = await this.db.get(
        'SELECT id FROM space_owners WHERE user_id = ?',
        [user.id],
      );
      if (owner) {
        ownerId = owner.id;
      } else {
        const firstOwner = await this.db.get(
          'SELECT so.id FROM space_owners so JOIN users u ON so.user_id = u.id WHERE u.maker_id = ? LIMIT 1',
          [user.maker_id],
        );
        ownerId = firstOwner ? firstOwner.id : 1;
      }
    }

    const now = new Date().toISOString();
    const res = await this.db.run(
      `INSERT INTO spaces (
        maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.maker_id,
        ownerId,
        nama_space,
        Number(harga_per_jam),
        tipe,
        Number(kapasitas),
        deskripsi || '',
        foto || null,
        now,
        now,
      ],
    );

    return {
      success: true,
      message: 'Space berhasil ditambahkan.',
      data: {
        id: res.lastID,
        nama_space,
        harga_per_jam: Number(harga_per_jam),
        tipe,
        kapasitas: Number(kapasitas),
        deskripsi,
        foto,
      },
    };
  }

  async updateSpace(user: any, id: number, body: any) {
    const space = await this.db.get(
      'SELECT * FROM spaces WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!space) {
      throw new NotFoundException({
        success: false,
        message: 'Space tidak ditemukan.',
      });
    }

    const { nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto } = body;
    const now = new Date().toISOString();

    await this.db.run(
      `UPDATE spaces SET
        nama_space = COALESCE(?, nama_space),
        harga_per_jam = COALESCE(?, harga_per_jam),
        tipe = COALESCE(?, tipe),
        kapasitas = COALESCE(?, kapasitas),
        deskripsi = COALESCE(?, deskripsi),
        foto = COALESCE(?, foto),
        updated_at = ?
       WHERE id = ? AND maker_id = ?`,
      [
        nama_space ?? null,
        harga_per_jam ? Number(harga_per_jam) : null,
        tipe ?? null,
        kapasitas ? Number(kapasitas) : null,
        deskripsi ?? null,
        foto ?? null,
        now,
        id,
        user.maker_id,
      ],
    );

    const updated = await this.db.get(
      'SELECT * FROM spaces WHERE id = ?',
      [id],
    );

    return {
      success: true,
      message: 'Space berhasil diperbarui.',
      data: updated,
    };
  }

  async getSpaceById(user: any, id: number) {
    const space = await this.db.get(
      'SELECT * FROM spaces WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!space) {
      throw new NotFoundException({
        success: false,
        message: 'Space tidak ditemukan.',
      });
    }

    return {
      success: true,
      data: space,
    };
  }

  async deleteSpace(user: any, id: number) {
    const space = await this.db.get(
      'SELECT * FROM spaces WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!space) {
      throw new NotFoundException({
        success: false,
        message: 'Space tidak ditemukan.',
      });
    }

    await this.db.run(
      'DELETE FROM spaces WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    return {
      success: true,
      message: 'Space berhasil dihapus.',
    };
  }

  // ================= 2. COWORKING PROFILE =================
  async getCoworkingProfile(user: any) {
    let owner = await this.db.get(
      `SELECT so.*, u.username
       FROM space_owners so
       JOIN users u ON so.user_id = u.id
       WHERE u.maker_id = ? AND u.role = 'admin_space'
       LIMIT 1`,
      [user.maker_id],
    );

    if (!owner) {
      owner = {
        nama_coworking: 'UHUB Premium Coworking',
        nama_pemilik: user.username || 'Admin Space',
        telp: '081298765432',
        alamat: 'Jl. Danau Ranau No. 1, Sawojajar, Malang',
        deskripsi_fasilitas: 'Fasilitas premium lengkap dengan internet ultra cepat dan ruang kerja fleksibel.',
      };
    }

    return {
      success: true,
      data: owner,
    };
  }

  async updateCoworkingProfile(user: any, body: any) {
    const { nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas } = body;
    const now = new Date().toISOString();

    const owner = await this.db.get(
      `SELECT so.* FROM space_owners so
       JOIN users u ON so.user_id = u.id
       WHERE u.maker_id = ? AND u.role = 'admin_space'
       LIMIT 1`,
      [user.maker_id],
    );

    if (owner) {
      await this.db.run(
        `UPDATE space_owners SET
          nama_coworking = COALESCE(?, nama_coworking),
          nama_pemilik = COALESCE(?, nama_pemilik),
          alamat = COALESCE(?, alamat),
          telp = COALESCE(?, telp),
          deskripsi_fasilitas = COALESCE(?, deskripsi_fasilitas),
          updated_at = ?
         WHERE id = ?`,
        [
          nama_coworking ?? null,
          nama_pemilik ?? null,
          alamat ?? null,
          telp ?? null,
          deskripsi_fasilitas ?? null,
          now,
          owner.id,
        ],
      );
    } else {
      await this.db.run(
        `INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          nama_coworking || 'UHUB Premium Coworking',
          nama_pemilik || user.username || 'Admin Space',
          alamat || '',
          telp || '',
          deskripsi_fasilitas || '',
          now,
          now,
        ],
      );
    }

    const updated = await this.getCoworkingProfile(user);
    return {
      success: true,
      message: 'Profil Coworking Space berhasil diperbarui.',
      data: updated.data,
    };
  }

  // ================= 3. DISCOUNTS CRUD =================
  async getDiscounts(user: any) {
    const discounts = await this.db.all(
      'SELECT * FROM diskons WHERE maker_id = ? ORDER BY id DESC',
      [user.maker_id],
    );

    return {
      success: true,
      total: discounts.length,
      data: discounts,
    };
  }

  async createDiscount(user: any, body: any) {
    const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = body;

    if (!nama_diskon || !persentase_diskon || !tanggal_awal || !tanggal_akhir) {
      throw new BadRequestException({
        success: false,
        message: 'nama_diskon, persentase_diskon, tanggal_awal, dan tanggal_akhir wajib diisi.',
      });
    }

    const existing = await this.db.get(
      'SELECT id FROM diskons WHERE UPPER(nama_diskon) = UPPER(?) AND maker_id = ?',
      [nama_diskon, user.maker_id],
    );

    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Nama diskon/kupon sudah pernah dibuat.',
      });
    }

    const now = new Date().toISOString();
    const res = await this.db.run(
      `INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.maker_id,
        nama_diskon.toUpperCase(),
        Number(persentase_diskon),
        tanggal_awal,
        tanggal_akhir,
        now,
        now,
      ],
    );

    return {
      success: true,
      message: 'Diskon/kupon promo berhasil ditambahkan.',
      data: {
        id: res.lastID,
        nama_diskon: nama_diskon.toUpperCase(),
        persentase_diskon: Number(persentase_diskon),
        tanggal_awal,
        tanggal_akhir,
      },
    };
  }

  async updateDiscount(user: any, id: number, body: any) {
    const diskon = await this.db.get(
      'SELECT * FROM diskons WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!diskon) {
      throw new NotFoundException({
        success: false,
        message: 'Diskon tidak ditemukan.',
      });
    }

    const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = body;
    const now = new Date().toISOString();

    await this.db.run(
      `UPDATE diskons SET
        nama_diskon = COALESCE(?, nama_diskon),
        persentase_diskon = COALESCE(?, persentase_diskon),
        tanggal_awal = COALESCE(?, tanggal_awal),
        tanggal_akhir = COALESCE(?, tanggal_akhir),
        updated_at = ?
       WHERE id = ? AND maker_id = ?`,
      [
        nama_diskon ? nama_diskon.toUpperCase() : null,
        persentase_diskon ? Number(persentase_diskon) : null,
        tanggal_awal ?? null,
        tanggal_akhir ?? null,
        now,
        id,
        user.maker_id,
      ],
    );

    const updated = await this.db.get('SELECT * FROM diskons WHERE id = ?', [id]);
    return {
      success: true,
      message: 'Diskon berhasil diperbarui.',
      data: updated,
    };
  }

  async getDiscountById(user: any, id: number) {
    const diskon = await this.db.get(
      'SELECT * FROM diskons WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!diskon) {
      throw new NotFoundException({
        success: false,
        message: 'Diskon tidak ditemukan.',
      });
    }

    return {
      success: true,
      data: diskon,
    };
  }

  async deleteDiscount(user: any, id: number) {
    const diskon = await this.db.get(
      'SELECT * FROM diskons WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!diskon) {
      throw new NotFoundException({
        success: false,
        message: 'Diskon tidak ditemukan.',
      });
    }

    await this.db.run(
      'DELETE FROM diskons WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    return {
      success: true,
      message: 'Diskon berhasil dihapus.',
    };
  }

  // ================= 4. RESERVATIONS MANAGEMENT =================
  async getAllReservations(user: any, queryParams: any) {
    const { status, tanggal, search, month, year } = queryParams || {};

    let sql = `
      SELECT r.*, r.tanggal_reservasi as tanggal,
             s.nama_space, s.tipe, s.harga_per_jam, s.foto,
             d.nama_diskon, d.persentase_diskon,
             m.nama_member, m.telp as member_telp, m.instansi, u.username as member_username
      FROM reservasis r
      JOIN spaces s ON r.id_space = s.id
      JOIN members m ON r.id_member = m.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN diskons d ON r.id_diskon = d.id
      WHERE r.maker_id = ?
    `;
    const params: any[] = [user.maker_id];

    if (status && status !== 'all') {
      const normalized = this.normalizeStatus(status);
      sql += ' AND (r.status = ? OR r.status = ?)';
      params.push(normalized, status);
    }
    if (tanggal) {
      sql += ' AND r.tanggal_reservasi = ?';
      params.push(tanggal);
    }
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      sql += ` AND strftime('%Y-%m', r.tanggal_reservasi) = ?`;
      params.push(`${year}-${monthStr}`);
    } else if (year) {
      sql += ` AND strftime('%Y', r.tanggal_reservasi) = ?`;
      params.push(String(year));
    }
    if (search) {
      sql += ' AND (m.nama_member LIKE ? OR s.nama_space LIKE ? OR u.username LIKE ? OR r.kode_booking LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.id DESC';

    const reservations = await this.db.all(sql, params);
    return {
      success: true,
      total: reservations.length,
      data: reservations,
    };
  }

  async updateReservationStatus(user: any, id: number, body: any) {
    const rawStatus = body.status;
    const normalizedStatus = this.normalizeStatus(rawStatus);

    const allowed = ['belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan'];
    if (!allowed.includes(normalizedStatus)) {
      throw new BadRequestException({
        success: false,
        message: `Status tidak valid. Pilihan status: ${allowed.join(', ')}`,
      });
    }

    const reservation = await this.db.get(
      'SELECT * FROM reservasis WHERE id = ? AND maker_id = ?',
      [id, user.maker_id],
    );

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan.',
      });
    }

    const now = new Date().toISOString();
    let updateFields = 'status = ?, updated_at = ?';
    const updateParams: any[] = [normalizedStatus, now];

    if (normalizedStatus === 'aktif' && !reservation.check_in_time) {
      updateFields += ', check_in_time = ?';
      updateParams.push(now);
    }
    if (normalizedStatus === 'selesai' && !reservation.check_out_time) {
      updateFields += ', check_out_time = ?';
      updateParams.push(now);
    }

    updateParams.push(id, user.maker_id);

    await this.db.run(
      `UPDATE reservasis SET ${updateFields} WHERE id = ? AND maker_id = ?`,
      updateParams,
    );

    return {
      success: true,
      message: `Status reservasi #${id} berhasil diubah menjadi '${normalizedStatus}'.`,
      data: { id, status: normalizedStatus },
    };
  }

  async checkIn(user: any, id: number) {
    const reservation = await this.db.get(
      `SELECT r.*, s.nama_space, m.nama_member
       FROM reservasis r
       JOIN spaces s ON r.id_space = s.id
       JOIN members m ON r.id_member = m.id
       WHERE r.id = ? AND r.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan.',
      });
    }

    if (reservation.status === 'dibatalkan') {
      throw new BadRequestException({
        success: false,
        message: 'Tidak dapat Check-In: reservasi berstatus dibatalkan.',
      });
    }

    if (reservation.status === 'selesai') {
      throw new BadRequestException({
        success: false,
        message: 'Reservasi ini sudah selesai.',
      });
    }

    const now = new Date().toISOString();
    await this.db.run(
      'UPDATE reservasis SET status = ?, check_in_time = ?, updated_at = ? WHERE id = ? AND maker_id = ?',
      ['aktif', now, now, id, user.maker_id],
    );

    return {
      success: true,
      message: `Check-In Berhasil! Selamat datang ${reservation.nama_member} di ${reservation.nama_space}.`,
      data: {
        id,
        status: 'aktif',
        checked_in_at: now,
        member: reservation.nama_member,
        space: reservation.nama_space,
      },
    };
  }

  async checkOut(user: any, id: number) {
    const reservation = await this.db.get(
      `SELECT r.*, s.nama_space, m.nama_member
       FROM reservasis r
       JOIN spaces s ON r.id_space = s.id
       JOIN members m ON r.id_member = m.id
       WHERE r.id = ? AND r.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan.',
      });
    }

    const now = new Date().toISOString();
    await this.db.run(
      'UPDATE reservasis SET status = ?, check_out_time = ?, updated_at = ? WHERE id = ? AND maker_id = ?',
      ['selesai', now, now, id, user.maker_id],
    );

    return {
      success: true,
      message: `Check-Out Berhasil! Sesi penggunaan ${reservation.nama_space} oleh ${reservation.nama_member} telah selesai.`,
      data: {
        id,
        status: 'selesai',
        checked_out_at: now,
        member: reservation.nama_member,
        space: reservation.nama_space,
      },
    };
  }

  // ================= 5. MEMBERS MANAGEMENT =================
  async getMembers(user: any, search?: string) {
    let sql = `
      SELECT m.*, u.username, u.created_at as joined_at,
             COUNT(r.id) as total_reservasi,
             COALESCE(SUM(CASE WHEN r.status IN ('selesai', 'aktif', 'disetujui') THEN r.total_bayar ELSE 0 END), 0) as total_transaksi
      FROM members m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN reservasis r ON m.id = r.id_member
      WHERE u.maker_id = ?
    `;
    const params: any[] = [user.maker_id];

    if (search) {
      sql += ' AND (m.nama_member LIKE ? OR u.username LIKE ? OR m.instansi LIKE ? OR m.telp LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY m.id ORDER BY m.id DESC';

    const members = await this.db.all(sql, params);
    return {
      success: true,
      total: members.length,
      data: members,
    };
  }

  async createMember(user: any, body: any) {
    const { username, password, nama_member, instansi, alamat, telp, foto } = body;
    if (!username || !password || !nama_member) {
      throw new BadRequestException({
        success: false,
        message: 'Username, password, dan nama member wajib diisi.',
      });
    }

    const existingUser = await this.db.get(
      'SELECT id FROM users WHERE username = ? AND maker_id = ?',
      [username, user.maker_id],
    );
    if (existingUser) {
      throw new BadRequestException({
        success: false,
        message: 'Username sudah terdaftar.',
      });
    }

    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await this.db.run(
      `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'member', ?, ?)`,
      [user.maker_id, username, hashedPassword, now, now],
    );

    const memberRes = await this.db.run(
      `INSERT INTO members (user_id, nama_member, instansi, alamat, telp, foto, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userRes.lastID,
        nama_member,
        instansi || '-',
        alamat || '-',
        telp || '-',
        foto || null,
        now,
        now,
      ],
    );

    return {
      success: true,
      message: 'Member baru berhasil ditambahkan.',
      data: {
        id: memberRes.lastID,
        user_id: userRes.lastID,
        username,
        nama_member,
        instansi,
        alamat,
        telp,
      },
    };
  }

  async updateMember(user: any, id: number, body: any) {
    const member = await this.db.get(
      `SELECT m.*, u.maker_id FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = ? AND u.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!member) {
      throw new NotFoundException({
        success: false,
        message: 'Member tidak ditemukan.',
      });
    }

    const { nama_member, instansi, alamat, telp, foto } = body;
    const now = new Date().toISOString();

    await this.db.run(
      `UPDATE members SET
        nama_member = COALESCE(?, nama_member),
        instansi = COALESCE(?, instansi),
        alamat = COALESCE(?, alamat),
        telp = COALESCE(?, telp),
        foto = COALESCE(?, foto),
        updated_at = ?
       WHERE id = ?`,
      [nama_member ?? null, instansi ?? null, alamat ?? null, telp ?? null, foto ?? null, now, id],
    );

    return {
      success: true,
      message: 'Data member berhasil diperbarui.',
    };
  }

  async getMemberById(user: any, id: number) {
    const member = await this.db.get(
      `SELECT m.*, u.username, u.created_at as joined_at,
              COUNT(r.id) as total_reservasi,
              COALESCE(SUM(CASE WHEN r.status IN ('selesai', 'aktif', 'disetujui') THEN r.total_bayar ELSE 0 END), 0) as total_transaksi
       FROM members m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN reservasis r ON m.id = r.id_member
       WHERE m.id = ? AND u.maker_id = ?
       GROUP BY m.id`,
      [id, user.maker_id],
    );

    if (!member) {
      throw new NotFoundException({
        success: false,
        message: 'Member tidak ditemukan.',
      });
    }

    return {
      success: true,
      data: member,
    };
  }

  async deleteMember(user: any, id: number) {
    const member = await this.db.get(
      `SELECT m.*, u.id as user_id FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = ? AND u.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!member) {
      throw new NotFoundException({
        success: false,
        message: 'Member tidak ditemukan.',
      });
    }

    await this.db.run('DELETE FROM users WHERE id = ?', [member.user_id]);
    return {
      success: true,
      message: 'Member berhasil dihapus.',
    };
  }

  // ================= 6. REPORTS & ANALYTICS =================
  async getFinancialReport(user: any) {
    const summary = await this.db.get(
      `SELECT 
         COUNT(*) as total_transaksi,
         COALESCE(SUM(total_bayar), 0) as total_pendapatan,
         COALESCE(AVG(total_bayar), 0) as rata_rata_transaksi,
         COALESCE(SUM(CASE WHEN status IN ('selesai', 'aktif', 'disetujui') THEN total_bayar ELSE 0 END), 0) as pendapatan_realisasi,
         COALESCE(SUM(CASE WHEN status = 'belum_dikonfirm' THEN total_bayar ELSE 0 END), 0) as pendapatan_proyeksi,
         COALESCE(SUM(potongan_diskon), 0) as total_diskon_diberikan
       FROM reservasis
       WHERE maker_id = ? AND status != 'dibatalkan'`,
      [user.maker_id],
    );

    const monthlyBreakdown = await this.db.all(
      `SELECT 
         strftime('%Y-%m', tanggal_reservasi) as bulan,
         COUNT(*) as jumlah_reservasi,
         SUM(total_bayar) as total_pendapatan,
         SUM(CASE WHEN status IN ('selesai', 'aktif', 'disetujui') THEN total_bayar ELSE 0 END) as pendapatan_bersih
       FROM reservasis
       WHERE maker_id = ? AND status != 'dibatalkan'
       GROUP BY strftime('%Y-%m', tanggal_reservasi)
       ORDER BY bulan DESC`,
      [user.maker_id],
    );

    const spaceBreakdown = await this.db.all(
      `SELECT 
         s.id as space_id,
         s.nama_space, s.tipe, s.harga_per_jam,
         COUNT(r.id) as total_reservasi,
         COALESCE(SUM(r.total_bayar), 0) as total_pendapatan
       FROM spaces s
       LEFT JOIN reservasis r ON s.id = r.id_space AND r.status != 'dibatalkan'
       WHERE s.maker_id = ?
       GROUP BY s.id
       ORDER BY total_pendapatan DESC`,
      [user.maker_id],
    );

    return {
      success: true,
      summary: summary || {
        total_transaksi: 0,
        total_pendapatan: 0,
        rata_rata_transaksi: 0,
        pendapatan_realisasi: 0,
        pendapatan_proyeksi: 0,
      },
      monthly_breakdown: monthlyBreakdown || [],
      space_breakdown: spaceBreakdown || [],
    };
  }

  async getMonthlyReport(user: any, queryParams: any) {
    const now = new Date();
    const month = queryParams?.month ? Number(queryParams.month) : now.getMonth() + 1;
    const year = queryParams?.year ? Number(queryParams.year) : now.getFullYear();
    const monthStr = String(month).padStart(2, '0');
    const targetPeriod = `${year}-${monthStr}`;

    // Get number of days in this month
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const curMonthName = monthNames[month - 1] || 'Mon';

    const stats = await this.db.get(
      `SELECT 
         COUNT(*) as total_reservasi,
         COALESCE(SUM(total_bayar), 0) as total_pendapatan,
         COALESCE(SUM(total_harga_awal), 0) as pendapatan_kotor,
         COALESCE(SUM(potongan_diskon), 0) as total_potongan_promo,
         COALESCE(SUM(durasi_jam), 0) as total_jam_terpakai,
         COALESCE(AVG(durasi_jam), 0) as rata_rata_durasi,
         COALESCE(SUM(CASE WHEN status IN ('selesai', 'aktif', 'disetujui') THEN total_bayar ELSE 0 END), 0) as pendapatan_realisasi,
         COALESCE(SUM(CASE WHEN status = 'belum_dikonfirm' THEN 1 ELSE 0 END), 0) as pending_approval,
         COALESCE(SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END), 0) as disetujui,
         COALESCE(SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END), 0) as aktif,
         COALESCE(SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END), 0) as selesai,
         COALESCE(SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END), 0) as dibatalkan
       FROM reservasis
       WHERE maker_id = ? AND strftime('%Y-%m', tanggal_reservasi) = ? AND status != 'dibatalkan'`,
      [user.maker_id, targetPeriod],
    );

    const dailyRows = await this.db.all(
      `SELECT 
         tanggal_reservasi as tanggal,
         CAST(strftime('%d', tanggal_reservasi) AS INTEGER) as day_num,
         COUNT(*) as total_reservasi,
         COALESCE(SUM(total_bayar), 0) as pendapatan_harian
       FROM reservasis
       WHERE maker_id = ? AND strftime('%Y-%m', tanggal_reservasi) = ? AND status != 'dibatalkan'
       GROUP BY tanggal_reservasi
       ORDER BY day_num ASC`,
      [user.maker_id, targetPeriod],
    );

    // Map daily rows into day 1..daysInMonth trajectory
    const dailyMap = new Map<number, { revenue: number; bookings: number }>();
    for (const r of dailyRows) {
      dailyMap.set(r.day_num, {
        revenue: Number(r.pendapatan_harian || 0),
        bookings: Number(r.total_reservasi || 0),
      });
    }

    let maxRev = 0;
    let peakDay = 1;
    const daily_trajectory = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const entry = dailyMap.get(d) || { revenue: 0, bookings: 0 };
      if (entry.revenue > maxRev) {
        maxRev = entry.revenue;
        peakDay = d;
      }
      const dayPad = String(d).padStart(2, '0');
      daily_trajectory.push({
        day: d,
        dateStr: `${curMonthName} ${dayPad}`,
        revenue: entry.revenue,
        bookings: entry.bookings,
        isPeak: false,
      });
    }

    if (maxRev > 0 && daily_trajectory[peakDay - 1]) {
      daily_trajectory[peakDay - 1].isPeak = true;
      daily_trajectory[peakDay - 1].note = `${daily_trajectory[peakDay - 1].bookings} Bookings`;
    }

    // Space Category Breakdown
    const categoryRows = await this.db.all(
      `SELECT 
         COALESCE(s.tipe, 'desk') as category_type,
         COUNT(r.id) as total_bookings,
         COALESCE(SUM(r.durasi_jam), 0) as total_jam,
         COALESCE(SUM(r.total_harga_awal), 0) as pendapatan_kotor,
         COALESCE(SUM(r.potongan_diskon), 0) as potongan_diskon,
         COALESCE(SUM(r.total_bayar), 0) as total_pendapatan
       FROM reservasis r
       LEFT JOIN spaces s ON r.id_space = s.id
       WHERE r.maker_id = ? AND strftime('%Y-%m', r.tanggal_reservasi) = ? AND r.status != 'dibatalkan'
       GROUP BY COALESCE(s.tipe, 'desk')
       ORDER BY total_pendapatan DESC`,
      [user.maker_id, targetPeriod],
    );

    const totalNet = Number(stats?.total_pendapatan || 0);
    const space_breakdown = categoryRows.map((cat) => {
      const net = Number(cat.total_pendapatan || 0);
      const yieldPct = totalNet > 0 ? Number(((net / totalNet) * 100).toFixed(1)) : 0;
      let label = 'Personal Desk';
      let sub = 'Flexi & Dedicated';
      if (cat.category_type === 'meeting_room') {
        label = 'Meeting Room';
        sub = 'Alpha & Beta';
      } else if (cat.category_type === 'private_office') {
        label = 'Private Office';
        sub = 'Executive Class Suite';
      }
      return {
        type: cat.category_type,
        label,
        sub,
        total_bookings: Number(cat.total_bookings || 0),
        total_jam: Number(cat.total_jam || 0),
        pendapatan_kotor: Number(cat.pendapatan_kotor || 0),
        potongan_diskon: Number(cat.potongan_diskon || 0),
        total_pendapatan: net,
        yield: yieldPct,
      };
    });

    return {
      success: true,
      period: { month, year, formatted: targetPeriod, daysInMonth, monthName: curMonthName },
      stats: stats || {},
      daily_trajectory,
      space_breakdown,
    };
  }

  async getVisitorReport(user: any) {
    const summary = await this.db.get(
      `SELECT 
         COUNT(*) as total_kunjungan,
         COUNT(DISTINCT id_member) as total_pengunjung_unik,
         COALESCE(SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END), 0) as sedang_aktif,
         COALESCE(SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END), 0) as selesai
       FROM reservasis
       WHERE maker_id = ? AND status != 'dibatalkan'`,
      [user.maker_id],
    );

    const dailyBreakdown = await this.db.all(
      `SELECT 
         tanggal_reservasi as tanggal,
         COUNT(*) as total_pengunjung,
         COUNT(DISTINCT id_member) as pengunjung_unik
       FROM reservasis
       WHERE maker_id = ? AND status != 'dibatalkan'
       GROUP BY tanggal_reservasi
       ORDER BY tanggal_reservasi DESC
       LIMIT 30`,
      [user.maker_id],
    );

    return {
      success: true,
      summary,
      daily_breakdown: dailyBreakdown,
    };
  }
}
