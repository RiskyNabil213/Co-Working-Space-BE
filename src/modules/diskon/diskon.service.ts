import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DiskonService {
  constructor(private readonly db: DatabaseService) {}

  async getAllDiscounts(makerId: number) {
    const discounts = await this.db.all(
      'SELECT * FROM diskons WHERE maker_id = ? ORDER BY id DESC',
      [makerId],
    );

    return {
      success: true,
      total: discounts.length,
      data: discounts,
    };
  }

  async checkDiscount(makerId: number, namaDiskon: string) {
    if (!namaDiskon) {
      throw new BadRequestException({
        success: false,
        message: 'Kode diskon wajib diisi.',
      });
    }

    const diskon = await this.db.get(
      'SELECT * FROM diskons WHERE UPPER(nama_diskon) = UPPER(?) AND maker_id = ?',
      [namaDiskon, makerId],
    );

    if (!diskon) {
      throw new NotFoundException({
        success: false,
        message: 'Kode diskon/voucher tidak ditemukan.',
      });
    }

    const now = new Date();
    const startDate = new Date(diskon.tanggal_awal);
    const endDate = new Date(diskon.tanggal_akhir);

    if (now < startDate) {
      throw new BadRequestException({
        success: false,
        message: `Kupon ini belum aktif. Baru dapat digunakan mulai ${diskon.tanggal_awal}`,
      });
    }

    if (now > endDate) {
      throw new BadRequestException({
        success: false,
        message: `Kupon ini telah kedaluwarsa pada ${diskon.tanggal_akhir}`,
      });
    }

    return {
      success: true,
      message: 'Kode diskon valid!',
      data: diskon,
    };
  }

  async getActiveDiscounts(makerId: number) {
    const now = new Date().toISOString();
    const discounts = await this.db.all(
      'SELECT * FROM diskons WHERE maker_id = ? AND date(tanggal_awal) <= date(?) AND date(tanggal_akhir) >= date(?) ORDER BY id DESC',
      [makerId, now, now],
    );

    return {
      success: true,
      total: discounts.length,
      data: discounts,
    };
  }

  async getDiscountById(makerId: number, id: number) {
    const diskon = await this.db.get(
      'SELECT * FROM diskons WHERE id = ? AND maker_id = ?',
      [id, makerId],
    );

    if (!diskon) {
      throw new NotFoundException({
        success: false,
        message: `Diskon dengan ID ${id} tidak ditemukan.`,
      });
    }

    return {
      success: true,
      data: diskon,
    };
  }
}
