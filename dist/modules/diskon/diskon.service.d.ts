import { DatabaseService } from '../../database/database.service';
export declare class DiskonService {
    private readonly db;
    constructor(db: DatabaseService);
    getAllDiscounts(makerId: number): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    checkDiscount(makerId: number, namaDiskon: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getActiveDiscounts(makerId: number): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getDiscountById(makerId: number, id: number): Promise<{
        success: boolean;
        data: any;
    }>;
}
