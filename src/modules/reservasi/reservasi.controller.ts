import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservasiService } from './reservasi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reservasi (Member)')
@Controller('reservasi')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservasiController {
  constructor(private readonly reservasiService: ReservasiService) {}

  @Post()
  @ApiOperation({ summary: 'Member: Buat Pemesanan Space Baru (+ Kode Promo & Perhitungan Otomatis)' })
  async createReservation(@CurrentUser() user: any, @Body() body: any) {
    return this.reservasiService.createReservation(user, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'Member: Lihat Status Semua Pemesanan Milik Sendiri' })
  async getMyReservations(@CurrentUser() user: any) {
    return this.reservasiService.getMyReservations(user);
  }

  @Get('my/history')
  @ApiOperation({ summary: 'Member: Lihat Histori Pemesanan Berdasarkan Bulan & Tahun (month, year)' })
  @ApiQuery({ name: 'month', required: false, description: 'Bulan (01-12)' })
  @ApiQuery({ name: 'year', required: false, description: 'Tahun (2026)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status Filter' })
  async getMyReservationHistory(@CurrentUser() user: any, @Query() query: any) {
    return this.reservasiService.getMyReservationHistory(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail spesifik reservasi' })
  async getReservationById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reservasiService.getReservationById(user, Number(id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Batalkan reservasi' })
  async cancelReservation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reservasiService.cancelReservation(user, Number(id));
  }

  @Get(':id/e-ticket')
  @ApiOperation({ summary: 'Dapatkan pass E-Ticket QR Code reservasi' })
  async getETicket(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reservasiService.getETicket(user, Number(id));
  }
}
