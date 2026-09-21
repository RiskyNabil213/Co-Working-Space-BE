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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reservasi_service_1 = require("./reservasi.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReservasiController = class ReservasiController {
    constructor(reservasiService) {
        this.reservasiService = reservasiService;
    }
    async createReservation(user, body) {
        return this.reservasiService.createReservation(user, body);
    }
    async getMyReservations(user) {
        return this.reservasiService.getMyReservations(user);
    }
    async getMyReservationHistory(user, query) {
        return this.reservasiService.getMyReservationHistory(user, query);
    }
    async getReservationById(user, id) {
        return this.reservasiService.getReservationById(user, Number(id));
    }
    async cancelReservation(user, id) {
        return this.reservasiService.cancelReservation(user, Number(id));
    }
    async getETicket(user, id) {
        return this.reservasiService.getETicket(user, Number(id));
    }
};
exports.ReservasiController = ReservasiController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Member: Buat Pemesanan Space Baru (+ Kode Promo & Perhitungan Otomatis)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Member: Lihat Status Semua Pemesanan Milik Sendiri' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getMyReservations", null);
__decorate([
    (0, common_1.Get)('my/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Member: Lihat Histori Pemesanan Berdasarkan Bulan & Tahun (month, year)' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, description: 'Bulan (01-12)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: false, description: 'Tahun (2026)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Status Filter' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getMyReservationHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail spesifik reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getReservationById", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Batalkan reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "cancelReservation", null);
__decorate([
    (0, common_1.Get)(':id/e-ticket'),
    (0, swagger_1.ApiOperation)({ summary: 'Dapatkan pass E-Ticket QR Code reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReservasiController.prototype, "getETicket", null);
exports.ReservasiController = ReservasiController = __decorate([
    (0, swagger_1.ApiTags)('Reservasi (Member)'),
    (0, common_1.Controller)('reservasi'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reservasi_service_1.ReservasiService])
], ReservasiController);
//# sourceMappingURL=reservasi.controller.js.map