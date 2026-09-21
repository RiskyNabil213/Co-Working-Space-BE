import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MakerService } from './maker.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Maker / Developer Multi-Tenant')
@Controller('maker')
export class MakerController {
  constructor(private readonly makerService: MakerService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi Maker baru' })
  async register(@Body() body: any) {
    return this.makerService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login Maker' })
  async login(@Body() body: any) {
    return this.makerService.login(body);
  }

  @Post('keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('maker')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Maker App Key baru' })
  async generateNewKey(@CurrentUser() user: any) {
    return this.makerService.generateNewKey(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('maker')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'App Maker: Lihat Profil & App Key Siswa Saat Ini' })
  async getProfile(@CurrentUser() user: any) {
    return this.makerService.getProfile(user);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('maker')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'App Maker: Statistik Keseluruhan Data Siswa' })
  async getStats(@CurrentUser() user: any) {
    return this.makerService.getStats(user);
  }

  @Get('list')
  @ApiOperation({ summary: 'Guru/Penguji: Daftar Semua Siswa / App Maker Terdaftar' })
  async listMakers() {
    return this.makerService.listMakers();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('maker')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistik dashboard Maker' })
  async getDashboard(@CurrentUser() user: any) {
    return this.makerService.getDashboard(user);
  }
}
