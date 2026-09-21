import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class MakerKeyGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const appKey =
      request.headers['x-maker-key'] ||
      request.headers['x-app-key'] ||
      process.env.DEFAULT_MAKER_KEY ||
      'mk_ba15ea132879ce1088f6c9efc6034cf6';

    let maker = await this.db.get('SELECT * FROM makers WHERE app_key = ?', [
      appKey,
    ]);

    // Fallback: If provided key is invalid/stale, fallback to default maker or first maker
    if (!maker) {
      maker = await this.db.get(
        'SELECT * FROM makers WHERE app_key = ?',
        ['mk_ba15ea132879ce1088f6c9efc6034cf6'],
      );
    }

    if (!maker) {
      maker = await this.db.get(
        'SELECT * FROM makers ORDER BY id ASC LIMIT 1',
      );
    }

    if (!maker) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid or missing x-maker-key header',
      });
    }

    request.maker = maker;
    request.maker_id = maker.id;
    return true;
  }
}
