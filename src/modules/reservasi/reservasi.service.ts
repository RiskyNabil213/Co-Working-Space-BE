import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReservasiService {
  constructor(private readonly db: DatabaseService) {}

  private calculateHours(start: string, end: string): number {
    const [startH, startM] = (start || '09:00').split(':').map(Number);
    const [endH, endM] = (end || '12:00').split(':').map(Number);
    const diffMin = endH * 60 + endM - (startH * 60 + startM);
    if (diffMin <= 0) return 1;
    return Math.max(1, Math.ceil(diffMin / 60));
  }

  private addHoursToTime(start: string, hours: number): string {
    const [h, m] = (start || '09:00').split(':').map(Number);
    const endH = (h + hours) % 24;
    return `${endH.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`;
  }

  async createReservation(user: any, body: any) {
    let {
      id_space,
      tanggal,
      tanggal_reservasi,
      jam_mulai,
      jam_selesai,
      durasi_jam,
      id_diskon,
      kode_promo,
    } = body;

    const reservationDate = tanggal_reservasi || tanggal;
    const startTime = jam_mulai || '09:00';
    let duration = Number(durasi_jam) || 0;
    let endTime = jam_selesai;

    if (!endTime && duration > 0) {
      endTime = this.addHoursToTime(startTime, duration);
    } else if (endTime && duration <= 0) {
      duration = this.calculateHours(startTime, endTime);
    } else if (!endTime && duration <= 0) {
      duration = 3;
      endTime = this.addHoursToTime(startTime, 3);
    }

    if (!id_space || !reservationDate || !startTime || !endTime) {
      throw new BadRequestException({
        success: false,
        message: 'id_space, tanggal, jam_mulai, dan jam_selesai wajib diisi.',
      });
    }

    // Resolve member_id
    let memberId = user.member_id;
    if (!memberId) {
      const member = await this.db.get(
        'SELECT id FROM members WHERE user_id = ?',
        [user.id],
      );
      if (member) {
        memberId = member.id;
      } else {
        // Auto-create a member profile for this user
        const now = new Date().toISOString();
        const newMember = await this.db.run(
          `INSERT INTO members (user_id, nama_member, instansi, alamat, telp, created_at, updated_at)
           VALUES (?, ?, 'UHUB Member', 'Malang', '081234567890', ?, ?)`,
          [user.id, user.username || 'Member User', now, now],
        );
        memberId = newMember.lastID;
      }
    }

    const space = await this.db.get(
      'SELECT * FROM spaces WHERE id = ? AND maker_id = ?',
      [id_space, user.maker_id],
    );

    if (!space) {
      throw new NotFoundException({
        success: false,
        message: 'Space tidak ditemukan.',
      });
    }

    // Calculate Pricing & Discount
    const hargaPerJam = Number(space.harga_per_jam) || 50000;
    const totalHargaAwal = hargaPerJam * duration;
    let persentaseDiskon = 0;
    let diskonId: number | null = id_diskon || null;

    if (!diskonId && kode_promo) {
      const diskon = await this.db.get(
        'SELECT * FROM diskons WHERE (nama_diskon = ? OR nama_diskon = ?) AND maker_id = ?',
        [kode_promo.toUpperCase(), kode_promo, user.maker_id],
      );
      if (diskon) {
        diskonId = diskon.id;
        persentaseDiskon = Number(diskon.persentase_diskon) || 0;
      }
    } else if (diskonId) {
      const diskon = await this.db.get(
        'SELECT * FROM diskons WHERE id = ? AND maker_id = ?',
        [diskonId, user.maker_id],
      );
      if (diskon) {
        persentaseDiskon = Number(diskon.persentase_diskon) || 0;
      }
    }

    const potonganDiskon = (totalHargaAwal * persentaseDiskon) / 100;
    const totalBayar = Math.max(0, totalHargaAwal - potonganDiskon);
    const now = new Date().toISOString();
    const kodeBooking = `UHUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const res = await this.db.run(
      `INSERT INTO reservasis (
        maker_id, kode_booking, id_member, id_space, id_diskon,
        tanggal_reservasi, jam_mulai, jam_selesai, durasi_jam,
        harga_per_jam, total_harga_awal, potongan_diskon, total_bayar,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'belum_dikonfirm', ?, ?)`,
      [
        user.maker_id,
        kodeBooking,
        memberId,
        id_space,
        diskonId,
        reservationDate,
        startTime,
        endTime,
        duration,
        hargaPerJam,
        totalHargaAwal,
        potonganDiskon,
        totalBayar,
        now,
        now,
      ],
    );

    return {
      success: true,
      message: 'Reservasi berhasil dibuat.',
      data: {
        id: res.lastID,
        kode_booking: kodeBooking,
        id_member: memberId,
        id_space,
        id_diskon: diskonId,
        nama_space: space.nama_space,
        tanggal: reservationDate,
        tanggal_reservasi: reservationDate,
        jam_mulai: startTime,
        jam_selesai: endTime,
        durasi_jam: duration,
        harga_per_jam: hargaPerJam,
        total_harga_awal: totalHargaAwal,
        persentase_diskon: persentaseDiskon,
        potongan_diskon: potonganDiskon,
        total_bayar: totalBayar,
        status: 'belum_dikonfirm',
      },
    };
  }

  async getMyReservations(user: any) {
    let memberId = user.member_id;
    if (!memberId && user.id) {
      const member = await this.db.get(
        'SELECT id FROM members WHERE user_id = ?',
        [user.id],
      );
      if (member) memberId = member.id;
    }

    if (!memberId) {
      return { success: true, total: 0, data: [] };
    }

    const reservations = await this.db.all(
      `SELECT r.*, r.tanggal_reservasi as tanggal,
              s.nama_space, s.tipe, s.kapasitas, s.harga_per_jam as space_rate, s.foto,
              d.nama_diskon, d.persentase_diskon,
              so.nama_coworking, so.alamat as lokasi_coworking
       FROM reservasis r
       JOIN spaces s ON r.id_space = s.id
       LEFT JOIN diskons d ON r.id_diskon = d.id
       LEFT JOIN space_owners so ON s.id_owner = so.id
       WHERE r.id_member = ? AND r.maker_id = ?
       ORDER BY r.id DESC`,
      [memberId, user.maker_id],
    );

    return {
      success: true,
      total: reservations.length,
      data: reservations,
    };
  }

  async getMyReservationHistory(user: any, query: any) {
    let memberId = user.id;
    if (user.role === 'member') {
      const member = await this.db.get(
        'SELECT id FROM members WHERE user_id = ? AND maker_id = ?',
        [user.id, user.maker_id],
      );
      if (member) memberId = member.id;
    }

    if (!memberId) {
      return { success: true, total: 0, data: [] };
    }

    let sql = `SELECT r.*, r.tanggal_reservasi as tanggal,
                      s.nama_space, s.tipe, s.kapasitas, s.harga_per_jam as space_rate, s.foto,
                      d.nama_diskon, d.persentase_diskon,
                      so.nama_coworking, so.alamat as lokasi_coworking
               FROM reservasis r
               JOIN spaces s ON r.id_space = s.id
               LEFT JOIN diskons d ON r.id_diskon = d.id
               LEFT JOIN space_owners so ON s.id_owner = so.id
               WHERE r.id_member = ? AND r.maker_id = ?`;
    const params: any[] = [memberId, user.maker_id];

    if (query?.month) {
      sql += ' AND strftime("%m", r.tanggal_reservasi) = ?';
      params.push(String(query.month).padStart(2, '0'));
    }
    if (query?.year) {
      sql += ' AND strftime("%Y", r.tanggal_reservasi) = ?';
      params.push(String(query.year));
    }
    if (query?.status && query.status !== 'all') {
      sql += ' AND r.status = ?';
      params.push(query.status);
    }

    sql += ' ORDER BY r.id DESC';

    const reservations = await this.db.all(sql, params);
    return {
      success: true,
      total: reservations.length,
      data: reservations,
    };
  }

  async getReservationById(user: any, id: number) {
    const reservation = await this.db.get(
      `SELECT r.*, r.tanggal_reservasi as tanggal,
              s.nama_space, s.tipe, s.kapasitas, s.harga_per_jam as space_rate, s.foto, s.deskripsi as space_desc,
              d.nama_diskon, d.persentase_diskon,
              m.nama_member, m.telp as member_telp, m.instansi,
              so.nama_coworking, so.alamat as lokasi_coworking, so.telp as kontak_coworking
       FROM reservasis r
       JOIN spaces s ON r.id_space = s.id
       LEFT JOIN diskons d ON r.id_diskon = d.id
       LEFT JOIN members m ON r.id_member = m.id
       LEFT JOIN space_owners so ON s.id_owner = so.id
       WHERE r.id = ? AND r.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan.',
      });
    }

    return {
      success: true,
      data: reservation,
    };
  }

  async cancelReservation(user: any, id: number) {
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

    if (reservation.status === 'dibatalkan') {
      throw new BadRequestException({
        success: false,
        message: 'Reservasi ini sudah dibatalkan sebelumnya.',
      });
    }

    if (reservation.status === 'selesai') {
      throw new BadRequestException({
        success: false,
        message: 'Reservasi yang sudah selesai tidak dapat dibatalkan.',
      });
    }

    const now = new Date().toISOString();
    await this.db.run(
      'UPDATE reservasis SET status = ?, updated_at = ? WHERE id = ?',
      ['dibatalkan', now, id],
    );

    return {
      success: true,
      message: 'Reservasi berhasil dibatalkan.',
    };
  }

  async getETicket(user: any, id: number) {
    const reservation = await this.db.get(
      `SELECT r.*, r.tanggal_reservasi as tanggal,
              s.nama_space, s.tipe, s.kapasitas, s.foto as space_foto,
              m.nama_member, m.telp as member_telp, m.instansi,
              so.nama_coworking, so.alamat as lokasi_coworking
       FROM reservasis r
       JOIN spaces s ON r.id_space = s.id
       JOIN members m ON r.id_member = m.id
       LEFT JOIN space_owners so ON s.id_owner = so.id
       WHERE r.id = ? AND r.maker_id = ?`,
      [id, user.maker_id],
    );

    if (!reservation) {
      throw new NotFoundException({
        success: false,
        message: 'Reservasi tidak ditemukan.',
      });
    }

    const ticketCode = reservation.kode_booking || `TKT-${reservation.id}`;
    const qrPayload = JSON.stringify({
      reservation_id: reservation.id,
      ticket_code: ticketCode,
      member_name: reservation.nama_member,
      space: reservation.nama_space,
      date: reservation.tanggal_reservasi,
      time: `${reservation.jam_mulai} - ${reservation.jam_selesai}`,
      status: reservation.status,
    });

    return {
      success: true,
      data: {
        ticket_code: ticketCode,
        qr_payload: qrPayload,
        reservation,
      },
    };
  }
}
