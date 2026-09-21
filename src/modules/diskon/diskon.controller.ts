import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';
import { MakerKeyGuard } from '../../common/guards/maker-key.guard';

@ApiTags('Diskon')
@Controller('diskon')
@UseGuards(MakerKeyGuard)
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  @Get()
  @ApiOperation({ summary: 'Publik/User: Daftar voucher promo/diskon yang tersedia' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getAllDiscounts(@Req() req: any) {
    return this.diskonService.getAllDiscounts(req.maker_id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Publik/User: Daftar Promo / Diskon yang Sedang Aktif' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getActiveDiscounts(@Req() req: any) {
    return this.diskonService.getActiveDiscounts(req.maker_id);
  }

  @Post('check')
  @ApiOperation({ summary: 'Publik/User: Periksa Validitas & Hitung Potongan Kode Promo (POST)' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nama_diskon: { type: 'string', example: 'DISKONHEMAT20' },
      },
      required: ['nama_diskon'],
    },
  })
  async checkDiscountPost(@Req() req: any, @Body() body: any) {
    return this.diskonService.checkDiscount(req.maker_id, body.nama_diskon);
  }

  @Get('check/:nama_diskon')
  @ApiOperation({ summary: 'Publik/User: Cek validitas kode promo/diskon (GET Param)' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async checkDiscount(@Req() req: any, @Param('nama_diskon') namaDiskon: string) {
    return this.diskonService.checkDiscount(req.maker_id, namaDiskon);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Publik/User: Lihat Detail Diskon Berdasarkan ID' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async getDiscountById(@Req() req: any, @Param('id') id: string) {
    return this.diskonService.getDiscountById(req.maker_id, Number(id));
  }
}
