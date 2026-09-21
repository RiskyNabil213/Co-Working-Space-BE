import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) { }

  private generateToken(user: any) {
    const secret = process.env.JWT_SECRET || 'ukk_coworking_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        maker_id: user.maker_id,
      },
      secret,
      { expiresIn } as any,
    );
  }

  async registerMember(makerId: number, body: any) {
    const { username, password, nama_member, instansi, alamat, telp, foto } = body;

    if (!username || !password || !nama_member || !telp) {
      throw new BadRequestException({
        success: false,
        message: 'Username, password, nama_member, dan telp wajib diisi.',
      });
    }

    const existing = await this.db.get(
      'SELECT id FROM users WHERE username = ? AND maker_id = ?',
      [username, makerId],
    );

    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Username sudah digunakan di tenant ini.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const userRes = await this.db.run(
      `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'member', ?, ?)`,
      [makerId, username, hashedPassword, now, now],
    );

    const userId = userRes.lastID;

    const memberRes = await this.db.run(
      `INSERT INTO members (user_id, nama_member, instansi, alamat, telp, foto, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, nama_member, instansi || null, alamat || null, telp, foto || null, now, now],
    );

    const token = this.generateToken({
      id: userId,
      username,
      role: 'member',
      maker_id: makerId,
    });

    return {
      success: true,
      message: 'Registrasi member berhasil.',
      token,
      access_token: token,
      data: {
        id: userId,
        member_id: memberRes.lastID,
        username,
        role: 'member',
        nama_member,
        instansi,
        alamat,
        telp,
        foto,
        token,
        access_token: token,
      },
    };
  }

  async registerAdminSpace(makerId: number, body: any) {
    const {
      username,
      password,
      nama_coworking,
      nama_pemilik,
      alamat,
      telp,
      deskripsi_fasilitas,
    } = body;

    if (!username || !password || !nama_coworking || !nama_pemilik || !telp) {
      throw new BadRequestException({
        success: false,
        message: 'Username, password, nama_coworking, nama_pemilik, dan telp wajib diisi.',
      });
    }

    const existing = await this.db.get(
      'SELECT id FROM users WHERE username = ? AND maker_id = ?',
      [username, makerId],
    );

    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Username sudah digunakan di tenant ini.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const userRes = await this.db.run(
      `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'admin_space', ?, ?)`,
      [makerId, username, hashedPassword, now, now],
    );

    const userId = userRes.lastID;

    const ownerRes = await this.db.run(
      `INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        nama_coworking,
        nama_pemilik,
        alamat || null,
        telp,
        deskripsi_fasilitas || null,
        now,
        now,
      ],
    );

    const token = this.generateToken({
      id: userId,
      username,
      role: 'admin_space',
      maker_id: makerId,
    });

    return {
      success: true,
      message: 'Registrasi Admin Coworking Space berhasil.',
      token,
      access_token: token,
      data: {
        id: userId,
        owner_id: ownerRes.lastID,
        username,
        role: 'admin_space',
        nama_coworking,
        nama_pemilik,
        alamat,
        telp,
        deskripsi_fasilitas,
        token,
        access_token: token,
      },
    };
  }

  async login(makerId: number, body: any) {
    let { username, password } = body;

    if (!username || !password) {
      throw new BadRequestException({
        success: false,
        message: 'Username dan password wajib diisi.',
      });
    }

    username = String(username).trim();
    password = String(password).trim();

    let user = await this.db.get(
      `SELECT u.*,
              m.id as member_id, m.nama_member, m.instansi, m.alamat as member_alamat, m.telp as member_telp, m.foto,
              so.id as owner_id, so.nama_coworking, so.nama_pemilik, so.alamat as owner_alamat, so.telp as owner_telp, so.deskripsi_fasilitas
       FROM users u
       LEFT JOIN members m ON u.id = m.user_id
       LEFT JOIN space_owners so ON u.id = so.user_id
       WHERE (LOWER(u.username) = LOWER(?) OR LOWER(m.nama_member) = LOWER(?)) AND u.maker_id = ?`,
      [username, username, makerId],
    );

    // Fallback 1: Search by username or nama_member across any tenant if not found in current maker
    if (!user) {
      user = await this.db.get(
        `SELECT u.*,
                m.id as member_id, m.nama_member, m.instansi, m.alamat as member_alamat, m.telp as member_telp, m.foto,
                so.id as owner_id, so.nama_coworking, so.nama_pemilik, so.alamat as owner_alamat, so.telp as owner_telp, so.deskripsi_fasilitas
         FROM users u
         LEFT JOIN members m ON u.id = m.user_id
         LEFT JOIN space_owners so ON u.id = so.user_id
         WHERE (LOWER(u.username) = LOWER(?) OR LOWER(m.nama_member) = LOWER(?))`,
        [username, username],
      );
    }

    // Fallback 2: Check makers table (if user registered via /api/maker/register)
    if (!user) {
      const maker = await this.db.get(
        'SELECT * FROM makers WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)',
        [username, username],
      );

      if (maker) {
        const isMatchMaker = await bcrypt.compare(password, maker.password);
        if (!isMatchMaker) {
          throw new UnauthorizedException({
            success: false,
            message: 'Username atau password salah.',
          });
        }

        // Auto-provision user & space_owner for this maker so they have full admin access
        const now = new Date().toISOString();
        let existingUser = await this.db.get(
          'SELECT * FROM users WHERE maker_id = ? AND username = ?',
          [maker.id, maker.username],
        );

        let userId = existingUser?.id;
        if (!existingUser) {
          const userRes = await this.db.run(
            `INSERT INTO users (maker_id, username, password, role, created_at, updated_at)
             VALUES (?, ?, ?, 'admin_space', ?, ?)`,
            [maker.id, maker.username, maker.password, now, now],
          );
          userId = userRes.lastID;
        }

        let existingOwner = await this.db.get(
          'SELECT * FROM space_owners WHERE user_id = ?',
          [userId],
        );
        let ownerId = existingOwner?.id;
        if (!existingOwner) {
          const ownerRes = await this.db.run(
            `INSERT INTO space_owners (user_id, nama_coworking, nama_pemilik, alamat, telp, deskripsi_fasilitas, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              `${maker.name} Coworking Hub`,
              maker.name,
              'Jl. Coworking Hub No. 1',
              '081234567890',
              'Fasilitas modern lengkap dengan ruang kerja bersama dan ruang meeting.',
              now,
              now,
            ],
          );
          ownerId = ownerRes.lastID;
        }

        const token = this.generateToken({
          id: userId,
          username: maker.username,
          role: 'admin_space',
          maker_id: maker.id,
        });

        return {
          success: true,
          message: 'Login berhasil (Akun Maker terhubung sebagai Admin Space).',
          token,
          access_token: token,
          data: {
            id: userId,
            maker_id: maker.id,
            owner_id: ownerId,
            username: maker.username,
            role: 'admin_space',
            app_key: maker.app_key,
            nama_coworking: `${maker.name} Coworking Hub`,
            nama_pemilik: maker.name,
            alamat: 'Jl. Coworking Hub No. 1',
            telp: '081234567890',
            token,
            access_token: token,
          },
        };
      }
    }

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        success: false,
        message: 'Username atau password salah.',
      });
    }

    const token = this.generateToken(user);

    const userMaker = await this.db.get('SELECT app_key FROM makers WHERE id = ?', [user.maker_id]);
    const userAppKey = userMaker ? userMaker.app_key : 'mk_default_ukk_2026';

    let profileData: any = {
      id: user.id,
      maker_id: user.maker_id,
      username: user.username,
      role: user.role,
      app_key: userAppKey,
    };

    if (user.role === 'member') {
      profileData = {
        ...profileData,
        member_id: user.member_id,
        nama_member: user.nama_member,
        instansi: user.instansi,
        alamat: user.member_alamat,
        telp: user.member_telp,
        foto: user.foto,
      };
    } else if (user.role === 'admin_space') {
      profileData = {
        ...profileData,
        owner_id: user.owner_id,
        nama_coworking: user.nama_coworking,
        nama_pemilik: user.nama_pemilik,
        alamat: user.owner_alamat,
        telp: user.owner_telp,
        deskripsi_fasilitas: user.deskripsi_fasilitas,
      };
    }

    return {
      success: true,
      message: 'Login berhasil.',
      token,
      access_token: token,
      data: {
        ...profileData,
        token,
        access_token: token,
      },
    };
  }

  async getProfile(user: any) {
    const refreshed = await this.db.get(
      `SELECT u.id, u.maker_id, u.username, u.role,
              m.id as member_id, m.nama_member, m.instansi, m.alamat, m.telp, m.foto,
              so.id as owner_id, so.nama_coworking, so.nama_pemilik, so.alamat as owner_alamat, so.telp as owner_telp
       FROM users u
       LEFT JOIN members m ON u.id = m.user_id
       LEFT JOIN space_owners so ON u.id = so.user_id
       WHERE u.id = ?`,
      [user.id],
    );

    return {
      success: true,
      data: refreshed || user,
    };
  }

  async updateProfile(user: any, body: any) {
    const { username, password, nama_member, nama, instansi, alamat, telp, foto } = body;
    const now = new Date().toISOString();
    const fullName = nama_member || nama;

    // 1. If username changed, check uniqueness
    if (username && username.trim() !== user.username) {
      const existing = await this.db.get(
        'SELECT id FROM users WHERE username = ? AND maker_id = ? AND id != ?',
        [username.trim(), user.maker_id, user.id],
      );
      if (existing) {
        throw new BadRequestException({
          success: false,
          message: 'Username sudah digunakan oleh akun lain.',
        });
      }

      await this.db.run(
        'UPDATE users SET username = ?, updated_at = ? WHERE id = ?',
        [username.trim(), now, user.id],
      );
    }

    // 2. If password provided, update password
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await this.db.run(
        'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
        [hashedPassword, now, user.id],
      );
    }

    // 3. Update member or space owner details
    if (user.role === 'member' || user.member_id) {
      const member = await this.db.get(
        'SELECT id FROM members WHERE user_id = ? OR id = ?',
        [user.id, user.member_id || 0],
      );

      if (member) {
        await this.db.run(
          `UPDATE members SET 
            nama_member = COALESCE(?, nama_member),
            instansi = COALESCE(?, instansi),
            alamat = COALESCE(?, alamat),
            telp = COALESCE(?, telp),
            foto = COALESCE(?, foto),
            updated_at = ?
           WHERE id = ?`,
          [
            fullName !== undefined ? fullName : null,
            instansi !== undefined ? instansi : null,
            alamat !== undefined ? alamat : null,
            telp !== undefined ? telp : null,
            foto !== undefined ? foto : null,
            now,
            member.id,
          ],
        );
      } else {
        await this.db.run(
          `INSERT INTO members (user_id, nama_member, instansi, alamat, telp, foto, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            fullName || user.username,
            instansi || 'UHUB Member',
            alamat || 'Malang',
            telp || '',
            foto || null,
            now,
            now,
          ],
        );
      }
    } else if (user.role === 'admin_space') {
      await this.db.run(
        `UPDATE space_owners SET
          nama_coworking = COALESCE(?, nama_coworking),
          nama_pemilik = COALESCE(?, nama_pemilik),
          alamat = COALESCE(?, alamat),
          telp = COALESCE(?, telp),
          updated_at = ?
         WHERE user_id = ?`,
        [
          instansi || null,
          fullName || null,
          alamat || null,
          telp || null,
          now,
          user.id,
        ],
      );
    }

    // Fetch refreshed user profile
    const updatedUser = await this.db.get(
      `SELECT u.id, u.maker_id, u.username, u.role,
              m.id as member_id, m.nama_member, m.instansi, m.alamat, m.telp, m.foto,
              so.id as owner_id, so.nama_coworking, so.nama_pemilik, so.alamat as owner_alamat, so.telp as owner_telp
       FROM users u
       LEFT JOIN members m ON u.id = m.user_id
       LEFT JOIN space_owners so ON u.id = so.user_id
       WHERE u.id = ?`,
      [user.id],
    );

    const token = this.generateToken(updatedUser);

    return {
      success: true,
      message: 'Profil berhasil diperbarui.',
      token,
      access_token: token,
      data: {
        ...updatedUser,
        nama: updatedUser.nama_member || updatedUser.nama_pemilik || updatedUser.username,
        perusahaan: updatedUser.instansi || updatedUser.nama_coworking,
        token,
        access_token: token,
      },
    };
  }
}
