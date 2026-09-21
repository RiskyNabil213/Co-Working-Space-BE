import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health', 'docs', 'docs-json'],
  });

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Coworking Space & Workstation Reservation REST API (NestJS)')
    .setDescription(
      'RESTful API Enterprise NestJS untuk Sistem Manajemen & Reservasi Coworking Space - UKK RPL Paket B',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-maker-key', in: 'header' },
      'x-maker-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'UKK Coworking Space API Docs (NestJS)',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 NestJS Coworking Backend Server running at: http://localhost:${port}`);
  logger.log(`📚 Swagger API Documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
