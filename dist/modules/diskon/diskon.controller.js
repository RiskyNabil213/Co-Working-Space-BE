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
exports.DiskonController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diskon_service_1 = require("./diskon.service");
const maker_key_guard_1 = require("../../common/guards/maker-key.guard");
let DiskonController = class DiskonController {
    constructor(diskonService) {
        this.diskonService = diskonService;
    }
    async getAllDiscounts(req) {
        return this.diskonService.getAllDiscounts(req.maker_id);
    }
    async getActiveDiscounts(req) {
        return this.diskonService.getActiveDiscounts(req.maker_id);
    }
    async checkDiscountPost(req, body) {
        return this.diskonService.checkDiscount(req.maker_id, body.nama_diskon);
    }
    async checkDiscount(req, namaDiskon) {
        return this.diskonService.checkDiscount(req.maker_id, namaDiskon);
    }
    async getDiscountById(req, id) {
        return this.diskonService.getDiscountById(req.maker_id, Number(id));
    }
};
exports.DiskonController = DiskonController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Daftar voucher promo/diskon yang tersedia' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiskonController.prototype, "getAllDiscounts", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Daftar Promo / Diskon yang Sedang Aktif' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiskonController.prototype, "getActiveDiscounts", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Periksa Validitas & Hitung Potongan Kode Promo (POST)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                nama_diskon: { type: 'string', example: 'DISKONHEMAT20' },
            },
            required: ['nama_diskon'],
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DiskonController.prototype, "checkDiscountPost", null);
__decorate([
    (0, common_1.Get)('check/:nama_diskon'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Cek validitas kode promo/diskon (GET Param)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('nama_diskon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiskonController.prototype, "checkDiscount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Lihat Detail Diskon Berdasarkan ID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiskonController.prototype, "getDiscountById", null);
exports.DiskonController = DiskonController = __decorate([
    (0, swagger_1.ApiTags)('Diskon'),
    (0, common_1.Controller)('diskon'),
    (0, common_1.UseGuards)(maker_key_guard_1.MakerKeyGuard),
    __metadata("design:paramtypes", [diskon_service_1.DiskonService])
], DiskonController);
//# sourceMappingURL=diskon.controller.js.map