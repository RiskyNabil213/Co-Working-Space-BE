import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { MakerKeyGuard } from '../../common/guards/maker-key.guard';

@ApiTags('Spaces')
@Controller('spaces')
@UseGuards(MakerKeyGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  @ApiOperation({ summary: 'Katalog ruang kerja & workstation' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getSpaces(@Req() req: any, @Query() query: any) {
    return this.spacesService.getSpaces(req.maker_id, query);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Cek ketersediaan space realtime berdasarkan tanggal & jam' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async checkAvailability(@Req() req: any, @Query() query: any) {
    return this.spacesService.checkAvailability(req.maker_id, query);
  }

  @Get('types')
  @ApiOperation({ summary: 'Publik/User: Daftar Tipe Space (Personal Desk, Meeting Room, Private Office)' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getTypes(@Req() req: any) {
    return this.spacesService.getTypesSummary(req.maker_id);
  }

  @Get('types/summary')
  @ApiOperation({ summary: 'Ringkasan kategori space dan rentang harga (alias)' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getTypesSummary(@Req() req: any) {
    return this.spacesService.getTypesSummary(req.maker_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail spesifik space' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getSpaceById(@Req() req: any, @Param('id') id: string) {
    return this.spacesService.getSpaceById(req.maker_id, Number(id));
  }
}
