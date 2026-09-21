import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { MakerKeyGuard } from '../../common/guards/maker-key.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) { }

  @Post('send-otp')
  @ApiOperation({ summary: 'Kirim kode OTP 6-digit ke email Gmail' })
  async sendOtp(@Body('email') email: string) {
    return this.otpService.sendOtp(email);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verifikasi kode OTP 6-digit yang diterima di email' })
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    return this.otpService.verifyOtp(email, otp);
  }

  @Post('register/member')
  @UseGuards(MakerKeyGuard)
  @ApiOperation({ summary: 'Registrasi akun member/pelanggan baru' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async registerMember(@Req() req: any, @Body() body: any) {
    return this.authService.registerMember(req.maker_id, body);
  }

  @Post('register/admin-space')
  @UseGuards(MakerKeyGuard)
  @ApiOperation({ summary: 'Registrasi akun Admin Coworking Space' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async registerAdminSpace(@Req() req: any, @Body() body: any) {
    return this.authService.registerAdminSpace(req.maker_id, body);
  }

  @Post('login')
  @UseGuards(MakerKeyGuard)
  @ApiOperation({ summary: 'Login pengguna (Member & Admin Space)' })
  @ApiHeader({ name: 'x-maker-key', required: false, description: 'Maker App Key' })
  async login(@Req() req: any, @Body() body: any) {
    return this.authService.login(req.maker_id, body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan profil pengguna yang sedang login' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profil pengguna (username, password, nama, instansi, alamat, telp, foto)' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.authService.updateProfile(user, body);
  }
}
