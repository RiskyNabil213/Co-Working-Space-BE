import { SpacesService } from './spaces.service';
export declare class SpacesController {
    private readonly spacesService;
    constructor(spacesService: SpacesService);
    getSpaces(req: any, query: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    checkAvailability(req: any, query: any): Promise<{
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
    getTypes(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    getTypesSummary(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    getSpaceById(req: any, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
