"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api', {
        exclude: ['/', 'health', 'docs', 'docs-json'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Coworking Space & Workstation Reservation REST API (NestJS)')
        .setDescription('RESTful API Enterprise NestJS untuk Sistem Manajemen & Reservasi Coworking Space - UKK RPL Paket B')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'x-maker-key', in: 'header' }, 'x-maker-key')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'UKK Coworking Space API Docs (NestJS)',
    });
    const port = process.env.PORT || 5000;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 NestJS Coworking Backend Server running at: http://localhost:${port}`);
    logger.log(`📚 Swagger API Documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map