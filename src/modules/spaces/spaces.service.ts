import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SpacesService {
  constructor(private readonly db: DatabaseService) {}

  async getSpaces(makerId: number, queryParams: any) {
    const { tipe, min_kapasitas, max_harga, search, sort } = queryParams;

    let sql = `
      SELECT s.*, so.nama_coworking, so.alamat as lokasi_coworking, so.telp as kontak_coworking
      FROM spaces s
      LEFT JOIN space_owners so ON s.id_owner = so.id
      WHERE s.maker_id = ?
    `;
    const params: any[] = [makerId];

    if (tipe) {
      sql += ' AND s.tipe = ?';
      params.push(tipe);
    }
    if (min_kapasitas) {
      sql += ' AND s.kapasitas >= ?';
      params.push(Number(min_kapasitas));
    }
    if (max_harga) {
      sql += ' AND s.harga_per_jam <= ?';
      params.push(Number(max_harga));
    }
    if (search) {
      sql += ' AND (s.nama_space LIKE ? OR s.deskripsi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY s.harga_per_jam ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY s.harga_per_jam DESC';
    } else if (sort === 'capacity_desc') {
      sql += ' ORDER BY s.kapasitas DESC';
    } else {
      sql += ' ORDER BY s.id DESC';
    }

    const spaces = await this.db.all(sql, params);
    return {
      success: true,
      total: spaces.length,
      data: spaces,
    };
  }

  async getSpaceById(makerId: number, id: number) {
    const space = await this.db.get(
      `SELECT s.*, so.nama_coworking, so.alamat as lokasi_coworking, so.telp as kontak_coworking, so.deskripsi_fasilitas
       FROM spaces s
       LEFT JOIN space_owners so ON s.id_owner = so.id
       WHERE s.id = ? AND s.maker_id = ?`,
      [id, makerId],
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

  async checkAvailability(makerId: number, queryParams: any) {
    const { tanggal, jam_mulai, jam_selesai, space_id } = queryParams;

    let spacesSql = 'SELECT * FROM spaces WHERE maker_id = ?';
    const spacesParams: any[] = [makerId];

    if (space_id) {
      spacesSql += ' AND id = ?';
      spacesParams.push(space_id);
    }

    const spaces = await this.db.all(spacesSql, spacesParams);

    if (!tanggal || !jam_mulai || !jam_selesai) {
      return {
        success: true,
        message: 'Silakan cantumkan tanggal, jam_mulai, dan jam_selesai untuk cek slot akurat.',
        data: spaces.map((s) => ({ ...s, is_available: true })),
      };
    }

    const bookedReservations = await this.db.all(
      `SELECT id_space FROM reservasis
       WHERE maker_id = ?
         AND tanggal = ?
         AND status IN ('pending', 'approved', 'active')
         AND (
           (jam_mulai < ? AND jam_selesai > ?) OR
           (jam_mulai >= ? AND jam_mulai < ?) OR
           (jam_selesai > ? AND jam_selesai <= ?)
         )`,
      [makerId, tanggal, jam_selesai, jam_mulai, jam_mulai, jam_selesai, jam_mulai, jam_selesai],
    );

    const bookedSpaceIds = new Set(bookedReservations.map((r) => r.id_space));

    const result = spaces.map((s) => ({
      ...s,
      is_available: !bookedSpaceIds.has(s.id),
    }));

    return {
      success: true,
      checked_params: { tanggal, jam_mulai, jam_selesai },
      total_spaces: result.length,
      available_count: result.filter((s) => s.is_available).length,
      data: result,
    };
  }

  async getTypesSummary(makerId: number) {
    const summary = await this.db.all(
      `SELECT tipe, COUNT(*) as count, MIN(harga_per_jam) as min_price, MAX(harga_per_jam) as max_price
       FROM spaces
       WHERE maker_id = ?
       GROUP BY tipe`,
      [makerId],
    );

    return {
      success: true,
      data: summary,
    };
  }
}
