import { DatabaseService } from '../../database/database.service';
export declare class SpacesService {
    private readonly db;
    constructor(db: DatabaseService);
    getSpaces(makerId: number, queryParams: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getSpaceById(makerId: number, id: number): Promise<{
        success: boolean;
        data: any;
    }>;
    checkAvailability(makerId: number, queryParams: any): Promise<{
        success: boolean;
        message: string;
        data: any[];
        checked_params?: undefined;
        total_spaces?: undefined;
        available_count?: undefined;
    } | {
        success: boolean;
        checked_params: {
            tanggal: any;
            jam_mulai: any;
            jam_selesai: any;
        };
        total_spaces: number;
        available_count: number;
        data: any[];
        message?: undefined;
    }>;
    getTypesSummary(makerId: number): Promise<{
        success: boolean;
        data: any[];
    }>;
}
