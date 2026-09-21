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
exports.SpacesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const spaces_service_1 = require("./spaces.service");
const maker_key_guard_1 = require("../../common/guards/maker-key.guard");
let SpacesController = class SpacesController {
    constructor(spacesService) {
        this.spacesService = spacesService;
    }
    async getSpaces(req, query) {
        return this.spacesService.getSpaces(req.maker_id, query);
    }
    async checkAvailability(req, query) {
        return this.spacesService.checkAvailability(req.maker_id, query);
    }
    async getTypes(req) {
        return this.spacesService.getTypesSummary(req.maker_id);
    }
    async getTypesSummary(req) {
        return this.spacesService.getTypesSummary(req.maker_id);
    }
    async getSpaceById(req, id) {
        return this.spacesService.getSpaceById(req.maker_id, Number(id));
    }
};
exports.SpacesController = SpacesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Katalog ruang kerja & workstation' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "getSpaces", null);
__decorate([
    (0, common_1.Get)('availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Cek ketersediaan space realtime berdasarkan tanggal & jam' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik/User: Daftar Tipe Space (Personal Desk, Meeting Room, Private Office)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Get)('types/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Ringkasan kategori space dan rentang harga (alias)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "getTypesSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detail spesifik space' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SpacesController.prototype, "getSpaceById", null);
exports.SpacesController = SpacesController = __decorate([
    (0, swagger_1.ApiTags)('Spaces'),
    (0, common_1.Controller)('spaces'),
    (0, common_1.UseGuards)(maker_key_guard_1.MakerKeyGuard),
    __metadata("design:paramtypes", [spaces_service_1.SpacesService])
], SpacesController);
//# sourceMappingURL=spaces.controller.js.map