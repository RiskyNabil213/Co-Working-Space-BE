"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path = require("path");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const spaces_module_1 = require("./modules/spaces/spaces.module");
const diskon_module_1 = require("./modules/diskon/diskon.module");
const reservasi_module_1 = require("./modules/reservasi/reservasi.module");
const admin_module_1 = require("./modules/admin/admin.module");
const maker_module_1 = require("./modules/maker/maker.module");
const upload_module_1 = require("./modules/upload/upload.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: path.resolve(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            spaces_module_1.SpacesModule,
            diskon_module_1.DiskonModule,
            reservasi_module_1.ReservasiModule,
            admin_module_1.AdminModule,
            maker_module_1.MakerModule,
            upload_module_1.UploadModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map