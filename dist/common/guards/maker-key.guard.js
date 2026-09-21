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
exports.MakerKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let MakerKeyGuard = class MakerKeyGuard {
    constructor(db) {
        this.db = db;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const appKey = request.headers['x-maker-key'] ||
            request.headers['x-app-key'] ||
            process.env.DEFAULT_MAKER_KEY ||
            'mk_ba15ea132879ce1088f6c9efc6034cf6';
        let maker = await this.db.get('SELECT * FROM makers WHERE app_key = ?', [
            appKey,
        ]);
        if (!maker) {
            maker = await this.db.get('SELECT * FROM makers WHERE app_key = ?', ['mk_ba15ea132879ce1088f6c9efc6034cf6']);
        }
        if (!maker) {
            maker = await this.db.get('SELECT * FROM makers ORDER BY id ASC LIMIT 1');
        }
        if (!maker) {
            throw new common_1.UnauthorizedException({
                success: false,
                message: 'Invalid or missing x-maker-key header',
            });
        }
        request.maker = maker;
        request.maker_id = maker.id;
        return true;
    }
};
exports.MakerKeyGuard = MakerKeyGuard;
exports.MakerKeyGuard = MakerKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], MakerKeyGuard);
//# sourceMappingURL=maker-key.guard.js.map