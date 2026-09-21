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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getSpaces(user, query) {
        return this.adminService.getSpaces(user, query);
    }
    async createSpace(user, body) {
        return this.adminService.createSpace(user, body);
    }
    async getSpaceById(user, id) {
        return this.adminService.getSpaceById(user, Number(id));
    }
    async updateSpace(user, id, body) {
        return this.adminService.updateSpace(user, Number(id), body);
    }
    async deleteSpace(user, id) {
        return this.adminService.deleteSpace(user, Number(id));
    }
    async getCoworkingProfile(user) {
        return this.adminService.getCoworkingProfile(user);
    }
    async getProfile(user) {
        return this.adminService.getCoworkingProfile(user);
    }
    async updateCoworkingProfile(user, body) {
        return this.adminService.updateCoworkingProfile(user, body);
    }
    async updateProfile(user, body) {
        return this.adminService.updateCoworkingProfile(user, body);
    }
    async getDiscounts(user) {
        return this.adminService.getDiscounts(user);
    }
    async getDiscountsAlias(user) {
        return this.adminService.getDiscounts(user);
    }
    async createDiscount(user, body) {
        return this.adminService.createDiscount(user, body);
    }
    async createDiscountAlias(user, body) {
        return this.adminService.createDiscount(user, body);
    }
    async getDiscountById(user, id) {
        return this.adminService.getDiscountById(user, Number(id));
    }
    async updateDiscount(user, id, body) {
        return this.adminService.updateDiscount(user, Number(id), body);
    }
    async deleteDiscount(user, id) {
        return this.adminService.deleteDiscount(user, Number(id));
    }
    async getAllReservations(user, query) {
        return this.adminService.getAllReservations(user, query);
    }
    async getAllReservationsAlias(user, query) {
        return this.adminService.getAllReservations(user, query);
    }
    async updateReservationStatus(user, id, body) {
        return this.adminService.updateReservationStatus(user, Number(id), body);
    }
    async updateReservationStatusAlias(user, id, body) {
        return this.adminService.updateReservationStatus(user, Number(id), body);
    }
    async checkIn(user, id) {
        return this.adminService.checkIn(user, Number(id));
    }
    async checkInAlias(user, id) {
        return this.adminService.checkIn(user, Number(id));
    }
    async checkInAlias2(user, id) {
        return this.adminService.checkIn(user, Number(id));
    }
    async checkOut(user, id) {
        return this.adminService.checkOut(user, Number(id));
    }
    async checkOutAlias(user, id) {
        return this.adminService.checkOut(user, Number(id));
    }
    async checkOutAlias2(user, id) {
        return this.adminService.checkOut(user, Number(id));
    }
    async getMembers(user, search) {
        return this.adminService.getMembers(user, search);
    }
    async createMember(user, body) {
        return this.adminService.createMember(user, body);
    }
    async getMemberById(user, id) {
        return this.adminService.getMemberById(user, Number(id));
    }
    async updateMember(user, id, body) {
        return this.adminService.updateMember(user, Number(id), body);
    }
    async deleteMember(user, id) {
        return this.adminService.deleteMember(user, Number(id));
    }
    async getFinancialReport(user) {
        return this.adminService.getFinancialReport(user);
    }
    async getIncomeReport(user) {
        return this.adminService.getFinancialReport(user);
    }
    async getMonthlyReport(user, query) {
        return this.adminService.getMonthlyReport(user, query);
    }
    async getMonthlyReportAlias(user, query) {
        return this.adminService.getMonthlyReport(user, query);
    }
    async getVisitorReport(user) {
        return this.adminService.getVisitorReport(user);
    }
    async getVisitorReportAlias(user) {
        return this.adminService.getVisitorReport(user);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('spaces'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Ambil daftar seluruh ruang kerja' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSpaces", null);
__decorate([
    (0, common_1.Post)('spaces'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Tambah ruang kerja baru' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSpace", null);
__decorate([
    (0, common_1.Get)('spaces/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin Space: Detail Data Space Berdasarkan ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSpaceById", null);
__decorate([
    (0, common_1.Put)('spaces/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update data ruang kerja' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSpace", null);
__decorate([
    (0, common_1.Delete)('spaces/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Hapus ruang kerja' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSpace", null);
__decorate([
    (0, common_1.Get)('coworking'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Ambil profil coworking space' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCoworkingProfile", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Ambil profil coworking space (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('coworking'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update profil coworking space' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCoworkingProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update profil coworking space (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('diskon'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Daftar semua diskon/kupon promo' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDiscounts", null);
__decorate([
    (0, common_1.Get)('discounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Daftar semua diskon (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDiscountsAlias", null);
__decorate([
    (0, common_1.Post)('diskon'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Buat voucher diskon baru' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Post)('discounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Buat voucher diskon baru (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createDiscountAlias", null);
__decorate([
    (0, common_1.Get)('diskon/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin Space: Detail Data Diskon Berdasarkan ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDiscountById", null);
__decorate([
    (0, common_1.Put)('diskon/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Edit voucher diskon' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Delete)('diskon/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Hapus voucher diskon' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteDiscount", null);
__decorate([
    (0, common_1.Get)('reservasi'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Kelola seluruh reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllReservations", null);
__decorate([
    (0, common_1.Get)('reservations'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Kelola seluruh reservasi (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllReservationsAlias", null);
__decorate([
    (0, common_1.Patch)('reservasi/:id/status'),
    (0, common_1.Put)('reservasi/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Ubah status reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateReservationStatus", null);
__decorate([
    (0, common_1.Patch)('reservations/:id/status'),
    (0, common_1.Put)('reservations/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Ubah status reservasi (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateReservationStatusAlias", null);
__decorate([
    (0, common_1.Post)('reservasi/:id/checkin'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-In kehadiran pengunjung' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('reservasi/:id/check-in'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-In kehadiran pengunjung (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkInAlias", null);
__decorate([
    (0, common_1.Post)('reservations/:id/check-in'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-In kehadiran pengunjung (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkInAlias2", null);
__decorate([
    (0, common_1.Post)('reservasi/:id/checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-Out penyelesaian reservasi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)('reservasi/:id/check-out'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-Out penyelesaian reservasi (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkOutAlias", null);
__decorate([
    (0, common_1.Post)('reservations/:id/check-out'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Check-Out penyelesaian reservasi (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "checkOutAlias2", null);
__decorate([
    (0, common_1.Get)('members'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Daftar seluruh member yang terdaftar' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)('members'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Tambah member baru' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createMember", null);
__decorate([
    (0, common_1.Get)('members/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin Space: Detail Data Member Berdasarkan ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMemberById", null);
__decorate([
    (0, common_1.Put)('members/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Update member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)('members/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Hapus member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteMember", null);
__decorate([
    (0, common_1.Get)('laporan/keuangan'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan pendapatan & omset' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFinancialReport", null);
__decorate([
    (0, common_1.Get)('reports/income'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan ringkasan income (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getIncomeReport", null);
__decorate([
    (0, common_1.Get)('reports/monthly'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan bulanan (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMonthlyReport", null);
__decorate([
    (0, common_1.Get)('laporan/bulanan'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan bulanan' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMonthlyReportAlias", null);
__decorate([
    (0, common_1.Get)('laporan/pengunjung'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan statistik kunjungan member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVisitorReport", null);
__decorate([
    (0, common_1.Get)('reports/visitors'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Laporan statistik pengunjung (alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVisitorReportAlias", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin Space'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin_space'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map