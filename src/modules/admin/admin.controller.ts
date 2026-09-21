import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin Space')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_space')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ================= 1. SPACES CRUD =================
  @Get('spaces')
  @ApiOperation({ summary: 'Admin: Ambil daftar seluruh ruang kerja' })
  async getSpaces(@CurrentUser() user: any, @Query() query: any) {
    return this.adminService.getSpaces(user, query);
  }

  @Post('spaces')
  @ApiOperation({ summary: 'Admin: Tambah ruang kerja baru' })
  async createSpace(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.createSpace(user, body);
  }

  @Get('spaces/:id')
  @ApiOperation({ summary: 'Admin Space: Detail Data Space Berdasarkan ID' })
  async getSpaceById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.getSpaceById(user, Number(id));
  }

  @Put('spaces/:id')
  @ApiOperation({ summary: 'Admin: Update data ruang kerja' })
  async updateSpace(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateSpace(user, Number(id), body);
  }

  @Delete('spaces/:id')
  @ApiOperation({ summary: 'Admin: Hapus ruang kerja' })
  async deleteSpace(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteSpace(user, Number(id));
  }

  // ================= 2. COWORKING PROFILE =================
  @Get('coworking')
  @ApiOperation({ summary: 'Admin: Ambil profil coworking space' })
  async getCoworkingProfile(@CurrentUser() user: any) {
    return this.adminService.getCoworkingProfile(user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Admin: Ambil profil coworking space (alias)' })
  async getProfile(@CurrentUser() user: any) {
    return this.adminService.getCoworkingProfile(user);
  }

  @Put('coworking')
  @ApiOperation({ summary: 'Admin: Update profil coworking space' })
  async updateCoworkingProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.updateCoworkingProfile(user, body);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Admin: Update profil coworking space (alias)' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.updateCoworkingProfile(user, body);
  }

  // ================= 3. DISCOUNTS CRUD =================
  @Get('diskon')
  @ApiOperation({ summary: 'Admin: Daftar semua diskon/kupon promo' })
  async getDiscounts(@CurrentUser() user: any) {
    return this.adminService.getDiscounts(user);
  }

  @Get('discounts')
  @ApiOperation({ summary: 'Admin: Daftar semua diskon (alias)' })
  async getDiscountsAlias(@CurrentUser() user: any) {
    return this.adminService.getDiscounts(user);
  }

  @Post('diskon')
  @ApiOperation({ summary: 'Admin: Buat voucher diskon baru' })
  async createDiscount(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.createDiscount(user, body);
  }

  @Post('discounts')
  @ApiOperation({ summary: 'Admin: Buat voucher diskon baru (alias)' })
  async createDiscountAlias(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.createDiscount(user, body);
  }

  @Get('diskon/:id')
  @ApiOperation({ summary: 'Admin Space: Detail Data Diskon Berdasarkan ID' })
  async getDiscountById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.getDiscountById(user, Number(id));
  }

  @Put('diskon/:id')
  @ApiOperation({ summary: 'Admin: Edit voucher diskon' })
  async updateDiscount(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateDiscount(user, Number(id), body);
  }

  @Delete('diskon/:id')
  @ApiOperation({ summary: 'Admin: Hapus voucher diskon' })
  async deleteDiscount(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteDiscount(user, Number(id));
  }

  // ================= 4. RESERVATIONS MANAGEMENT =================
  @Get('reservasi')
  @ApiOperation({ summary: 'Admin: Kelola seluruh reservasi' })
  async getAllReservations(@CurrentUser() user: any, @Query() query: any) {
    return this.adminService.getAllReservations(user, query);
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Admin: Kelola seluruh reservasi (alias)' })
  async getAllReservationsAlias(@CurrentUser() user: any, @Query() query: any) {
    return this.adminService.getAllReservations(user, query);
  }

  @Patch('reservasi/:id/status')
  @Put('reservasi/:id/status')
  @ApiOperation({ summary: 'Admin: Ubah status reservasi' })
  async updateReservationStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateReservationStatus(user, Number(id), body);
  }

  @Patch('reservations/:id/status')
  @Put('reservations/:id/status')
  @ApiOperation({ summary: 'Admin: Ubah status reservasi (alias)' })
  async updateReservationStatusAlias(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateReservationStatus(user, Number(id), body);
  }

  @Post('reservasi/:id/checkin')
  @ApiOperation({ summary: 'Admin: Check-In kehadiran pengunjung' })
  async checkIn(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkIn(user, Number(id));
  }

  @Post('reservasi/:id/check-in')
  @ApiOperation({ summary: 'Admin: Check-In kehadiran pengunjung (alias)' })
  async checkInAlias(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkIn(user, Number(id));
  }

  @Post('reservations/:id/check-in')
  @ApiOperation({ summary: 'Admin: Check-In kehadiran pengunjung (alias)' })
  async checkInAlias2(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkIn(user, Number(id));
  }

  @Post('reservasi/:id/checkout')
  @ApiOperation({ summary: 'Admin: Check-Out penyelesaian reservasi' })
  async checkOut(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkOut(user, Number(id));
  }

  @Post('reservasi/:id/check-out')
  @ApiOperation({ summary: 'Admin: Check-Out penyelesaian reservasi (alias)' })
  async checkOutAlias(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkOut(user, Number(id));
  }

  @Post('reservations/:id/check-out')
  @ApiOperation({ summary: 'Admin: Check-Out penyelesaian reservasi (alias)' })
  async checkOutAlias2(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.checkOut(user, Number(id));
  }

  // ================= 5. MEMBERS LIST & CRUD =================
  @Get('members')
  @ApiOperation({ summary: 'Admin: Daftar seluruh member yang terdaftar' })
  async getMembers(@CurrentUser() user: any, @Query('search') search?: string) {
    return this.adminService.getMembers(user, search);
  }

  @Post('members')
  @ApiOperation({ summary: 'Admin: Tambah member baru' })
  async createMember(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.createMember(user, body);
  }

  @Get('members/:id')
  @ApiOperation({ summary: 'Admin Space: Detail Data Member Berdasarkan ID' })
  async getMemberById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.getMemberById(user, Number(id));
  }

  @Put('members/:id')
  @ApiOperation({ summary: 'Admin: Update member' })
  async updateMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateMember(user, Number(id), body);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Admin: Hapus member' })
  async deleteMember(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteMember(user, Number(id));
  }

  // ================= 6. REPORTS & ANALYTICS =================
  @Get('laporan/keuangan')
  @ApiOperation({ summary: 'Admin: Laporan pendapatan & omset' })
  async getFinancialReport(@CurrentUser() user: any) {
    return this.adminService.getFinancialReport(user);
  }

  @Get('reports/income')
  @ApiOperation({ summary: 'Admin: Laporan ringkasan income (alias)' })
  async getIncomeReport(@CurrentUser() user: any) {
    return this.adminService.getFinancialReport(user);
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Admin: Laporan bulanan (alias)' })
  async getMonthlyReport(@CurrentUser() user: any, @Query() query: any) {
    return this.adminService.getMonthlyReport(user, query);
  }

  @Get('laporan/bulanan')
  @ApiOperation({ summary: 'Admin: Laporan bulanan' })
  async getMonthlyReportAlias(@CurrentUser() user: any, @Query() query: any) {
    return this.adminService.getMonthlyReport(user, query);
  }

  @Get('laporan/pengunjung')
  @ApiOperation({ summary: 'Admin: Laporan statistik kunjungan member' })
  async getVisitorReport(@CurrentUser() user: any) {
    return this.adminService.getVisitorReport(user);
  }

  @Get('reports/visitors')
  @ApiOperation({ summary: 'Admin: Laporan statistik pengunjung (alias)' })
  async getVisitorReportAlias(@CurrentUser() user: any) {
    return this.adminService.getVisitorReport(user);
  }
}
