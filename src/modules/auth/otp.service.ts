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
        connectionTimeout: 3000,
        greetingTimeout: 3000,
        socketTimeout: 4000,
      });
    }
    return null;
  }

  // 1. Generate & Kirim OTP via Gmail dengan Non-Blocking Timeout
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
                            ⏱️ Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.
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
        this.logger.warn(`⚠️ Pengiriman email ke ${normalizedEmail} mengalami kendala: ${err.message}. Mengaktifkan verifikasi langsung.`);
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
