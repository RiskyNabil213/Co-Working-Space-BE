import { DatabaseService } from '../../database/database.service';
export declare class MakerService {
    private readonly db;
    constructor(db: DatabaseService);
    private generateToken;
    register(body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        data: {
            id: number;
            name: any;
            username: any;
            email: any;
            app_key: string;
        };
    }>;
    login(body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        data: {
            id: any;
            name: any;
            username: any;
            email: any;
            app_key: any;
        };
    }>;
    generateNewKey(makerUser: any): Promise<{
        success: boolean;
        message: string;
        app_key: string;
    }>;
    getDashboard(makerUser: any): Promise<{
        success: boolean;
        data: {
            total_spaces: any;
            total_members: any;
            total_reservations: any;
            total_volume_idr: any;
        };
    }>;
    getProfile(makerUser: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getStats(makerUser: any): Promise<{
        success: boolean;
        data: {
            total_spaces: any;
            total_members: any;
            total_reservations: any;
            total_volume_idr: any;
        };
    }>;
    listMakers(): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
}
