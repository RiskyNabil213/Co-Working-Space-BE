import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class MakerService {
  constructor(private readonly db: DatabaseService) {}

  private generateToken(maker: any) {
    const secret = process.env.JWT_SECRET || 'ukk_coworking_secret_key_2026';
    return jwt.sign(
      { id: maker.id, role: 'maker', username: maker.username },
      secret,
      { expiresIn: '7d' },
    );
  }

  async register(body: any) {
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Name, username, email, dan password wajib diisi.',
      });
    }

    const existing = await this.db.get(
      'SELECT id FROM makers WHERE username = ? OR email = ?',
      [username, email],
    );

    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Username atau email Maker sudah terdaftar.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const appKey = `mk_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    const res = await this.db.run(
      `INSERT INTO makers (name, username, email, password, app_key, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, username, email, hashedPassword, appKey, now, now],
    );

    const makerId = res.lastID;

    // Auto provision user, space_owner, spaces, and discounts so Maker can immediately log in from website
    try {
      const userRes = await this.db.run(
        `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
         VALUES (?, ?, ?, 'admin_space', ?, ?)`,
        [makerId, username, hashedPassword, now, now],
      );

      const ownerRes = await this.db.run(
        `INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userRes.lastID,
          `${name} Coworking Hub`,
          name,
          'Jl. Coworking Hub No. 1',
          '081234567890',
          'Fasilitas modern lengkap dengan ruang kerja bersama dan ruang meeting.',
          now,
          now,
        ],
      );

      const ownerId = ownerRes.lastID;

      // Seed 6 standard spaces
      const defaultSpaces = [
        { nama: 'Personal Desk - Flexi 01', harga: 20000, tipe: 'desk', kapasitas: 1, desc: 'Meja kerja individual yang tenang dan nyaman dengan colokan listrik, WiFi kencang 100Mbps, lampu meja LED, dan free refill air mineral.', foto: 'desk_flexi_01.jpg' },
        { nama: 'Personal Desk - Dedicated 02', harga: 25000, tipe: 'desk', kapasitas: 1, desc: 'Dedicated desk privat dengan kursi ergonomis premium, monitor support, dan loker terkunci pribadi.', foto: 'desk_dedicated_02.jpg' },
        { nama: 'Meeting Room Alpha', harga: 100000, tipe: 'meeting_room', kapasitas: 8, desc: 'Ruang rapat kedap suara berkapasitas 8 orang, dilengkapi Smart TV 55 inch, soundbar Bluetooth, whiteboard kaca, AC dingin, dan conference speaker.', foto: 'meeting_room_alpha.jpg' },
        { nama: 'Executive Boardroom Beta', harga: 150000, tipe: 'meeting_room', kapasitas: 14, desc: 'Ruang rapat eksekutif premium dengan proyektor 4K laser, sistem audio Bose, dan video conference 360 derajat.', foto: 'boardroom_beta.jpg' },
        { nama: 'Private Office Suite 01', harga: 150000, tipe: 'private_office', kapasitas: 4, desc: 'Ruang kantor privat eksklusif untuk tim kecil 4 orang, meja kerja ergonomis, smart door lock, dan lemari berkas.', foto: 'private_office_01.jpg' },
        { nama: 'Enterprise Studio Suite 02', harga: 250000, tipe: 'private_office', kapasitas: 8, desc: 'Studio kantor mandiri lengkap berkapasitas 8 orang dengan pantry mini privat, lounge area, dan akses 24/7.', foto: 'enterprise_studio_02.jpg' },
      ];

      for (const s of defaultSpaces) {
        await this.db.run(
          `INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [makerId, ownerId, s.nama, s.harga, s.tipe, s.kapasitas, s.desc, s.foto, now, now],
        );
      }

      // Seed standard discounts
      await this.db.run(
        `INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [makerId, 'DISKONHEMAT20', 20, '2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z', now, now],
      );
      await this.db.run(
        `INSERT INTO diskons (maker_id, nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [makerId, 'UKKPROMO50', 50, '2026-08-01T00:00:00.000Z', '2026-09-30T23:59:59.000Z', now, now],
      );
    } catch (e) {
      // Ignore if setup already completed
    }

    const token = this.generateToken({ id: makerId, username, role: 'maker' });

    return {
      success: true,
      message: 'Registrasi Maker/Developer berhasil.',
      token,
      data: {
        id: res.lastID,
        name,
        username,
        email,
        app_key: appKey,
      },
    };
  }

  async login(body: any) {
    const { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Username dan password wajib diisi.',
      });
    }

    const maker = await this.db.get(
      'SELECT * FROM makers WHERE username = ? OR email = ?',
      [username, username],
    );

    if (!maker) {
      throw new UnauthorizedException({
        success: false,
        message: 'Kredensial maker salah.',
      });
    }

    const isMatch = await bcrypt.compare(password, maker.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        success: false,
        message: 'Kredensial maker salah.',
      });
    }

    const token = this.generateToken(maker);

    return {
      success: true,
      message: 'Login Maker berhasil.',
      token,
      data: {
        id: maker.id,
        name: maker.name,
        username: maker.username,
        email: maker.email,
        app_key: maker.app_key,
      },
    };
  }

  async generateNewKey(makerUser: any) {
    const newKey = `mk_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    await this.db.run(
      'UPDATE makers SET app_key = ?, updated_at = ? WHERE id = ?',
      [newKey, now, makerUser.id],
    );

    return {
      success: true,
      message: 'App Key baru berhasil digenerate.',
      app_key: newKey,
    };
  }

  async getDashboard(makerUser: any) {
    const spacesCount = await this.db.get(
      'SELECT COUNT(*) as count FROM spaces WHERE maker_id = ?',
      [makerUser.id],
    );
    const membersCount = await this.db.get(
      `SELECT COUNT(*) as count FROM members m
       JOIN users u ON m.user_id = u.id
       WHERE u.maker_id = ?`,
      [makerUser.id],
    );
    const reservationsCount = await this.db.get(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_bayar), 0) as total_volume FROM reservasis WHERE maker_id = ?',
      [makerUser.id],
    );

    return {
      success: true,
      data: {
        total_spaces: spacesCount?.count || 0,
        total_members: membersCount?.count || 0,
        total_reservations: reservationsCount?.count || 0,
        total_volume_idr: reservationsCount?.total_volume || 0,
      },
    };
  }

  async getProfile(makerUser: any) {
    const maker = await this.db.get(
      'SELECT id, name, username, email, app_key, created_at, updated_at FROM makers WHERE id = ?',
      [makerUser.id],
    );
    return {
      success: true,
      message: 'Profil Maker berhasil dimuat.',
      data: maker || makerUser,
    };
  }

  async getStats(makerUser: any) {
    return this.getDashboard(makerUser);
  }

  async listMakers() {
    const list = await this.db.all(
      'SELECT id, name, username, email, app_key, created_at FROM makers ORDER BY id DESC',
    );
    return {
      success: true,
      message: 'Daftar semua Maker berhasil dimuat.',
      data: list || [],
    };
  }
}
