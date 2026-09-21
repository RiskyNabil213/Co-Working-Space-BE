"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskonService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let DiskonService = class DiskonService {
    constructor(db) {
        this.db = db;
    }
    async getAllDiscounts(makerId) {
        const discounts = await this.db.all('SELECT * FROM diskons WHERE maker_id = ? ORDER BY id DESC', [makerId]);
        return {
            success: true,
            total: discounts.length,
            data: discounts,
        };
    }
    async checkDiscount(makerId, namaDiskon) {
        if (!namaDiskon) {
            throw new common_1.BadRequestException({
                success: false,
                message: 'Kode diskon wajib diisi.',
            });
        }
        const diskon = await this.db.get('SELECT * FROM diskons WHERE UPPER(nama_diskon) = UPPER(?) AND maker_id = ?', [namaDiskon, makerId]);
        if (!diskon) {
            throw new common_1.NotFoundException({
                success: false,
                message: 'Kode diskon/voucher tidak ditemukan.',
            });
        }
        const now = new Date();
        const startDate = new Date(diskon.tanggal_awal);
        const endDate = new Date(diskon.tanggal_akhir);
        if (now < startDate) {
            throw new common_1.BadRequestException({
                success: false,
                message: `Kupon ini belum aktif. Baru dapat digunakan mulai ${diskon.tanggal_awal}`,
            });
        }
        if (now > endDate) {
            throw new common_1.BadRequestException({
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
    async getActiveDiscounts(makerId) {
        const now = new Date().toISOString();
        const discounts = await this.db.all('SELECT * FROM diskons WHERE maker_id = ? AND date(tanggal_awal) <= date(?) AND date(tanggal_akhir) >= date(?) ORDER BY id DESC', [makerId, now, now]);
        return {
            success: true,
            total: discounts.length,
            data: discounts,
        };
    }
    async getDiscountById(makerId, id) {
        const diskon = await this.db.get('SELECT * FROM diskons WHERE id = ? AND maker_id = ?', [id, makerId]);
        if (!diskon) {
            throw new common_1.NotFoundException({
                success: false,
                message: `Diskon dengan ID ${id} tidak ditemukan.`,
            });
        }
        return {
            success: true,
            data: diskon,
        };
    }
};
exports.DiskonService = DiskonService;
exports.DiskonService = DiskonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DiskonService);
//# sourceMappingURL=diskon.service.js.map