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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let AppController = class AppController {
    getRoot() {
        return {
            name: 'UKK Coworking Space & Workstation Reservation REST API (NestJS)',
            version: '1.0.0',
            status: 'active',
            author: 'SMK Telkom Malang RPL',
            docs: '/docs',
            endpoints: {
                auth: '/api/auth',
                spaces: '/api/spaces',
                diskon: '/api/diskon',
                reservasi: '/api/reservasi',
                admin: '/api/admin',
                maker: '/api/maker',
                upload: '/api/upload',
            },
        };
    }
    getHealth() {
        return {
            status: true,
            statusCode: 200,
            message: 'Server Coworking Space API berjalan normal (Healthy).',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Backend Root Status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Publik: Health Check Server' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Root'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map