import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private db;
    onModuleInit(): void;
    onModuleDestroy(): void;
    get<T = any>(sql: string, params?: any[]): Promise<T | null>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<{
        lastID: number;
        changes: number;
    }>;
    exec(sql: string): Promise<void>;
    private initDatabase;
}
