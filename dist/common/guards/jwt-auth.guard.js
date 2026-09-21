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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const database_service_1 = require("../../database/database.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(db) {
        this.db = db;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({
                success: false,
                message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
            });
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'ukk_coworking_secret_key_2026';
        try {
            const decoded = jwt.verify(token, secret);
            const userId = decoded.id || decoded.userId;
            const username = decoded.username;
            const user = await this.db.get(`SELECT u.id, u.maker_id, u.username, u.role,
                m.id as member_id, m.nama_member, m.instansi, m.alamat, m.telp, m.foto,
                so.id as owner_id, so.nama_coworking
         FROM users u
         LEFT JOIN members m ON u.id = m.user_id
         LEFT JOIN space_owners so ON u.id = so.user_id
         WHERE u.id = ? OR (u.username = ? AND u.username IS NOT NULL)`, [userId, username || '']);
            if (!user) {
                throw new common_1.UnauthorizedException({
                    success: false,
                    message: 'Pengguna tidak ditemukan atau token tidak valid.',
                });
            }
            request.user = user;
            return true;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException) {
                throw err;
            }
            throw new common_1.UnauthorizedException({
                success: false,
                message: 'Token tidak valid atau telah kedaluwarsa.',
            });
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map