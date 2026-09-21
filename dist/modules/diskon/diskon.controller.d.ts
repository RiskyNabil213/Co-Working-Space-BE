import { DiskonService } from './diskon.service';
export declare class DiskonController {
    private readonly diskonService;
    constructor(diskonService: DiskonService);
    getAllDiscounts(req: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getActiveDiscounts(req: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    checkDiscountPost(req: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    checkDiscount(req: any, namaDiskon: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getDiscountById(req: any, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
