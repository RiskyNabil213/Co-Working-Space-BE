import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

interface OtpRecord {
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore = new Map<string, OtpRecord>();

  private getTransporter(): nodemailer.Transporter | null {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (user && pass) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    }
    return null;
  }

  // 1. Generate & Kirim OTP via Gmail
  async sendOtp(email: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Format email tidak valid.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Buat 6 digit angka acak aman
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpDigits = otp.split('');

    // Hash OTP sebelum disimpan
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(otp, saltRounds);

    // Masa berlaku 5 menit
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    this.otpStore.set(normalizedEmail, {
      otpHash,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(`🔑 [OTP GENERATED] Email: ${normalizedEmail} | OTP Code: ${otp} | Expires in: 5m`);

    const transporter = this.getTransporter();
    const senderEmail = process.env.SMTP_USER || 'nabilrisky390@gmail.com';

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"UHUB Coworking Space" <${senderEmail}>`,
          to: normalizedEmail,
          subject: `${otp} - Kode Verifikasi Keamanan Akun UHUB Coworking`,
          html: `
            <!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Kode Verifikasi OTP - UHUB Coworking</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F4F6; padding: 40px 16px;">
                <tr>
                  <td align="center">
                    
                    <!-- MASTER CONTAINER CARD -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E2DF; box-shadow: 0 16px 36px -12px rgba(14, 15, 18, 0.08);">
                      
                      <!-- TOP BRAND HEADER -->
                      <tr>
                        <td style="background-color: #0E0F12; border-top: 5px solid #D5F066; padding: 36px 40px; text-align: center;">
                          
                          <!-- Security Badge -->
                          <div style="display: inline-block; padding: 6px 14px; background-color: rgba(213, 240, 102, 0.12); border: 1px solid rgba(213, 240, 102, 0.35); border-radius: 100px; margin-bottom: 12px;">
                            <span style="color: #D5F066; font-size: 10px; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase;">
                              🛡️ OFFICIAL AUTHENTICATION
                            </span>
                          </div>
                          
                          <!-- Main Wordmark -->
                          <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                            UHUB <span style="color: #D5F066;">COWORKING</span>
                          </h1>
                          <p style="color: #A1A1A5; font-size: 13px; margin: 8px 0 0 0; font-weight: 400;">
                            Sistem Reservasi Coworking Space & Workstation Modern
                          </p>
                        </td>
                      </tr>

                      <!-- BODY CONTENT -->
                      <tr>
                        <td style="padding: 40px 40px 32px 40px;">
                          
                          <!-- Salutation & Context -->
                          <h2 style="font-size: 22px; font-weight: 800; color: #0E0F12; margin: 0 0 12px 0; letter-spacing: -0.4px;">
                            Verifikasi Akun Pengguna
                          </h2>
                          <p style="font-size: 14px; color: #52525B; line-height: 1.65; margin: 0 0 28px 0;">
                            Halo, Anda baru saja mengajukan pendaftaran akun di platform <strong>UHUB Coworking Space</strong>. Gunakan kode 6-digit verifikasi di bawah ini untuk menyelesaikan proses pendaftaran:
                          </p>

                          <!-- 6-DIGIT OTP DISPLAY GRID (EMAIL SAFE TABLE) -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0;">
                            <tr>
                              <td align="center">
                                <table border="0" cellspacing="8" cellpadding="0">
                                  <tr>
                                    ${otpDigits.map((digit) => `
                                      <td width="52" height="64" align="center" valign="middle" style="background-color: #F8F8F6; border: 1.5px solid #D1D1CD; border-radius: 14px; color: #0E0F12; font-size: 32px; font-weight: 800; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);">
                                        ${digit}
                                      </td>
                                    `).join('')}
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Timer Pill Badge -->
                          <div style="text-align: center; margin-bottom: 28px;">
                            <span style="display: inline-block; background-color: #F4F4F5; border: 1px solid #E4E4E7; border-radius: 100px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #52525B;">
                              ⏱️ Kode berlaku selama <strong style="color: #0E0F12;">5 menit</strong> &bull; Sekali pakai
                            </span>
                          </div>

                          <!-- SECURITY ADVISORY BOX -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBFBFA; border: 1px solid #E2E2DF; border-left: 4px solid #0E0F12; border-radius: 12px; margin-bottom: 28px;">
                            <tr>
                              <td style="padding: 16px 20px;">
                                <div style="font-size: 12px; font-weight: 700; color: #0E0F12; margin-bottom: 4px;">
                                  🔒 Tips Keamanan Penting
                                </div>
                                <div style="font-size: 12px; color: #707175; line-height: 1.55;">
                                  Jangan berikan kode ini kepada siapa pun termasuk staf resmi UHUB. Jika Anda tidak merasa melakukan pendaftaran, abaikan email ini dengan aman.
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- DIVIDER -->
                          <hr style="border: none; border-top: 1px solid #EAEAEA; margin: 0 0 24px 0;" />

                          <!-- FOOTER INFO -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="text-align: center; font-size: 12px; color: #A1A1A5; line-height: 1.6;">
                                <strong style="color: #707175;">UKK RPL Paket B 2026/2027</strong> &bull; Sistem Reservasi Coworking Space<br/>
                                Pesan ini dikirimkan secara otomatis oleh Server Autentikasi UHUB.
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>

                    </table>
                    <!-- /MASTER CONTAINER CARD -->

                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });
        this.logger.log(`📧 [EMAIL SENT] OTP successfully delivered to ${normalizedEmail}`);
      } catch (err: any) {
        this.logger.error(`❌ Gagal mengirim email OTP ke ${normalizedEmail}: ${err.message}`);
        throw new BadRequestException(`Gagal mengirimkan email OTP: ${err.message}`);
      }
    } else {
      this.logger.warn(`⚠️ Transporter SMTP belum terkonfigurasi. OTP: ${otp}`);
    }

    return {
      success: true,
      message: `Kode OTP 6-digit telah dikirim ke ${normalizedEmail}. Berlaku 5 menit.`,
      debugOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  // 2. Verifikasi Input Pengguna
  async verifyOtp(email: string, inputOtp: string): Promise<{ success: boolean; message: string }> {
    if (!email || !inputOtp) {
      throw new BadRequestException('Email dan kode OTP wajib diisi.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = inputOtp.trim();
    const record = this.otpStore.get(normalizedEmail);

    if (!record) {
      throw new BadRequestException('Kode OTP belum diminta atau sudah hangus. Silakan minta kode baru.');
    }

    // Cek batas kedaluwarsa waktu
    if (new Date() > record.expiresAt) {
      this.otpStore.delete(normalizedEmail);
      throw new BadRequestException('Kode OTP telah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.');
    }

    // Proteksi brute force (maks 3 kali percobaan salah)
    if (record.attempts >= 3) {
      this.otpStore.delete(normalizedEmail);
      throw new UnauthorizedException('Terlalu banyak percobaan salah. Silakan minta kode OTP baru.');
    }

    // Cocokkan input dengan hash
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      this.otpStore.set(normalizedEmail, record);
      const sisa = 3 - record.attempts;
      throw new BadRequestException(`Kode OTP salah. Sisa kesempatan mencoba: ${sisa} kali.`);
    }

    // Berhasil verifikasi: hapus OTP agar tidak bisa dipakai ulang (single-use)
    this.otpStore.delete(normalizedEmail);
    this.logger.log(`✅ [OTP VERIFIED] Email: ${normalizedEmail} successfully verified.`);

    return {
      success: true,
      message: 'Email berhasil diverifikasi.',
    };
  }
}
