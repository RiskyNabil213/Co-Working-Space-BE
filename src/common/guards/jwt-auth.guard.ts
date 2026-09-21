import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'ukk_coworking_secret_key_2026';

    try {
      const decoded: any = jwt.verify(token, secret);
      const userId = decoded.id || decoded.userId;
      const username = decoded.username;

      const user = await this.db.get(
        `SELECT u.id, u.maker_id, u.username, u.role,
                m.id as member_id, m.nama_member, m.instansi, m.alamat, m.telp, m.foto,
                so.id as owner_id, so.nama_coworking
         FROM users u
         LEFT JOIN members m ON u.id = m.user_id
         LEFT JOIN space_owners so ON u.id = so.user_id
         WHERE u.id = ? OR (u.username = ? AND u.username IS NOT NULL)`,
        [userId, username || ''],
      );

      if (!user) {
        throw new UnauthorizedException({
          success: false,
          message: 'Pengguna tidak ditemukan atau token tidak valid.',
        });
      }

      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException({
        success: false,
        message: 'Token tidak valid atau telah kedaluwarsa.',
      });
    }
  }
}
