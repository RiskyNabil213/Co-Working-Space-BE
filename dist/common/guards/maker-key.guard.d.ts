import { CanActivate, ExecutionContext } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
export declare class MakerKeyGuard implements CanActivate {
    private readonly db;
    constructor(db: DatabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
