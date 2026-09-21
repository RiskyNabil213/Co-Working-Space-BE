import { Module } from '@nestjs/common';
import { MakerController } from './maker.controller';
import { MakerService } from './maker.service';

@Module({
  controllers: [MakerController],
  providers: [MakerService],
  exports: [MakerService],
})
export class MakerModule {}
