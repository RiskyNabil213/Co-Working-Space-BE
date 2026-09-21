"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakerModule = void 0;
const common_1 = require("@nestjs/common");
const maker_controller_1 = require("./maker.controller");
const maker_service_1 = require("./maker.service");
let MakerModule = class MakerModule {
};
exports.MakerModule = MakerModule;
exports.MakerModule = MakerModule = __decorate([
    (0, common_1.Module)({
        controllers: [maker_controller_1.MakerController],
        providers: [maker_service_1.MakerService],
        exports: [maker_service_1.MakerService],
    })
], MakerModule);
//# sourceMappingURL=maker.module.js.map