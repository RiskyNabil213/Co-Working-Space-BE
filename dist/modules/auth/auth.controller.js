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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const otp_service_1 = require("./otp.service");
const maker_key_guard_1 = require("../../common/guards/maker-key.guard");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService, otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }
    async sendOtp(email) {
        return this.otpService.sendOtp(email);
    }
    async verifyOtp(email, otp) {
        return this.otpService.verifyOtp(email, otp);
    }
    async registerMember(req, body) {
        return this.authService.registerMember(req.maker_id, body);
    }
    async registerAdminSpace(req, body) {
        return this.authService.registerAdminSpace(req.maker_id, body);
    }
    async login(req, body) {
        return this.authService.login(req.maker_id, body);
    }
    async getProfile(user) {
        return this.authService.getProfile(user);
    }
    async updateProfile(user, body) {
        return this.authService.updateProfile(user, body);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Kirim kode OTP 6-digit ke email Gmail' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Verifikasi kode OTP 6-digit yang diterima di email' }),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('register/member'),
    (0, common_1.UseGuards)(maker_key_guard_1.MakerKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Registrasi akun member/pelanggan baru' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerMember", null);
__decorate([
    (0, common_1.Post)('register/admin-space'),
    (0, common_1.UseGuards)(maker_key_guard_1.MakerKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Registrasi akun Admin Coworking Space' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerAdminSpace", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(maker_key_guard_1.MakerKeyGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Login pengguna (Member & Admin Space)' }),
    (0, swagger_1.ApiHeader)({ name: 'x-maker-key', required: false, description: 'Maker App Key' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Dapatkan profil pengguna yang sedang login' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update profil pengguna (username, password, nama, instansi, alamat, telp, foto)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        otp_service_1.OtpService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map