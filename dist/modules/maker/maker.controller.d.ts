import { MakerService } from './maker.service';
export declare class MakerController {
    private readonly makerService;
    constructor(makerService: MakerService);
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
    generateNewKey(user: any): Promise<{
        success: boolean;
        message: string;
        app_key: string;
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getStats(user: any): Promise<{
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
    getDashboard(user: any): Promise<{
        success: boolean;
        data: {
            total_spaces: any;
            total_members: any;
            total_reservations: any;
            total_volume_idr: any;
        };
    }>;
}
