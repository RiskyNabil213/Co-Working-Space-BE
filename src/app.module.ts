import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpacesModule } from './modules/spaces/spaces.module';
import { DiskonModule } from './modules/diskon/diskon.module';
import { ReservasiModule } from './modules/reservasi/reservasi.module';
import { AdminModule } from './modules/admin/admin.module';
import { MakerModule } from './modules/maker/maker.module';
import { UploadModule } from './modules/upload/upload.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    SpacesModule,
    DiskonModule,
    ReservasiModule,
    AdminModule,
    MakerModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
