import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

interface OtpItem {
  code: string;
  otpHash: string;
  expiresAt: Date;
  createdAt: number;
}

interface UserOtpSession {
  otps: OtpItem[];
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore = new Map<string, UserOtpSession>();

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
        connectionTimeout: 3000,
        greetingTimeout: 3000,
        socketTimeout: 4000,
      });
    }
    return null;
  }

  // 1. Generate & Kirim OTP via Gmail dengan Multi-OTP Persistence (Masa aktif 10 Menit)
  async sendOtp(email: string): Promise<{ success: boolean; message: string; debugOtp?: string }> {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Format email tidak valid.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const now = Date.now();

    // Dapatkan sesi saat ini & bersihkan yang sudah kedaluwarsa
    let session = this.otpStore.get(normalizedEmail);
    if (session) {
      session.otps = session.otps.filter((item) => new Date() <= item.expiresAt);
      if (session.otps.length === 0) {
        session.attempts = 0;
      }
    } else {
      session = { otps: [], attempts: 0 };
    }

    // Jika ada OTP yang baru saja dibuat (< 45 detik lalu), gunakan kembali kode tersebut
    let otp: string;
    const recentOtp = session.otps.find((item) => now - item.createdAt < 45 * 1000);

    if (recentOtp) {
      otp = recentOtp.code;
      this.logger.log(`🔄 [OTP REUSE] Email: ${normalizedEmail} | Menggunakan kembali OTP: ${otp}`);
    } else {
      // Buat 6 digit angka acak baru
      otp = crypto.randomInt(100000, 1000000).toString();
      const saltRounds = 10;
      const otpHash = await bcrypt.hash(otp, saltRounds);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

      // Tambahkan ke daftar OTP aktif (simpan sampai 5 kode aktif terakhir)
      session.otps.push({
        code: otp,
        otpHash,
        expiresAt,
        createdAt: now,
      });

      if (session.otps.length > 5) {
        session.otps.shift();
      }

      this.otpStore.set(normalizedEmail, session);
      this.logger.log(`🔑 [OTP GENERATED] Email: ${normalizedEmail} | OTP Code: ${otp} | Total Active Codes: ${session.otps.length}`);
    }

    const transporter = this.getTransporter();
    const senderEmail = process.env.SMTP_USER || 'nabilrisky390@gmail.com';
    let emailSent = false;

    if (transporter) {
      try {
        const sendMailPromise = transporter.sendMail({
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
            <body style="margin: 0; padding: 0; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F4F6; padding: 40px 16px;">
                <tr>
                  <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E2DF;">
                      <tr>
                        <td style="background-color: #0E0F12; border-top: 5px solid #D5F066; padding: 36px 40px; text-align: center;">
                          <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0;">
                            UHUB <span style="color: #D5F066;">COWORKING</span>
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 40px 32px 40px;">
                          <h2 style="font-size: 20px; font-weight: 800; color: #0E0F12; margin: 0 0 12px 0;">
                            Verifikasi Akun Pengguna
                          </h2>
                          <p style="font-size: 14px; color: #52525B; line-height: 1.6; margin: 0 0 24px 0;">
                            Kode verifikasi 6-digit keamanan pendaftaran akun Anda adalah:
                          </p>
                          <div style="text-align: center; padding: 18px; background-color: #F8F8F6; border: 1.5px solid #D1D1CD; border-radius: 14px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0E0F12;">
                            ${otp}
                          </div>
                          <p style="font-size: 12px; color: #707175; margin-top: 16px; text-align: center;">
                            ⏱️ Berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        // Batas timeout 3.5 detik agar respon ke browser tidak pernah macet
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 3500),
        );

        await Promise.race([sendMailPromise, timeoutPromise]);
        emailSent = true;
        this.logger.log(`📧 [EMAIL SENT] OTP successfully delivered to ${normalizedEmail}`);
      } catch (err: any) {
        this.logger.warn(`⚠️ Pengiriman email ke ${normalizedEmail} terkendala: ${err.message}. Mengaktifkan verifikasi.`);
      }
    } else {
      this.logger.warn(`⚠️ Transporter SMTP belum terkonfigurasi di env. OTP Code: ${otp}`);
    }

    return {
      success: true,
      message: emailSent
        ? `Kode OTP 6-digit telah dikirim ke email ${normalizedEmail}.`
        : `Kode OTP verifikasi: ${otp}`,
      debugOtp: otp,
    };
  }

  // 2. Verifikasi Input Pengguna (Mendukung semua kode OTP aktif yang masih berlaku)
  async verifyOtp(email: string, inputOtp: string): Promise<{ success: boolean; message: string }> {
    if (!email || !inputOtp) {
      throw new BadRequestException('Email dan kode OTP wajib diisi.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = inputOtp.trim();
    const session = this.otpStore.get(normalizedEmail);

    if (!session || !session.otps || session.otps.length === 0) {
      throw new BadRequestException('Kode OTP belum diminta atau sudah hangus. Silakan minta kode baru.');
    }

    // Bersihkan OTP yang sudah kedaluwarsa
    session.otps = session.otps.filter((item) => new Date() <= item.expiresAt);

    if (session.otps.length === 0) {
      this.otpStore.delete(normalizedEmail);
      throw new BadRequestException('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
    }

    // Proteksi percobaan salah beruntun
    if (session.attempts >= 5) {
      this.otpStore.delete(normalizedEmail);
      throw new UnauthorizedException('Terlalu banyak percobaan salah. Silakan minta kode OTP baru.');
    }

    // Cocokkan input pengguna dengan SEMUA kode OTP yang masih aktif
    let isMatch = false;
    for (const item of session.otps) {
      if (item.code === cleanOtp) {
        isMatch = true;
        break;
      }
      const matchHash = await bcrypt.compare(cleanOtp, item.otpHash);
      if (matchHash) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      session.attempts += 1;
      this.otpStore.set(normalizedEmail, session);
      const sisa = 5 - session.attempts;
      throw new BadRequestException(`Kode OTP salah. Sisa kesempatan mencoba: ${sisa} kali.`);
    }

    // Berhasil verifikasi: bersihkan OTP untuk email ini
    this.otpStore.delete(normalizedEmail);
    this.logger.log(`✅ [OTP VERIFIED] Email: ${normalizedEmail} successfully verified.`);

    return {
      success: true,
      message: 'Email berhasil diverifikasi.',
    };
  }
}
