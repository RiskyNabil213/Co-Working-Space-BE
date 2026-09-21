import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getSpaces(user: any, query: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    createSpace(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            nama_space: any;
            harga_per_jam: number;
            tipe: any;
            kapasitas: number;
            deskripsi: any;
            foto: any;
        };
    }>;
    getSpaceById(user: any, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateSpace(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    deleteSpace(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCoworkingProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
    updateCoworkingProfile(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    updateProfile(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getDiscounts(user: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getDiscountsAlias(user: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    createDiscount(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            nama_diskon: any;
            persentase_diskon: number;
            tanggal_awal: any;
            tanggal_akhir: any;
        };
    }>;
    createDiscountAlias(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            nama_diskon: any;
            persentase_diskon: number;
            tanggal_awal: any;
            tanggal_akhir: any;
        };
    }>;
    getDiscountById(user: any, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateDiscount(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    deleteDiscount(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllReservations(user: any, query: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getAllReservationsAlias(user: any, query: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    updateReservationStatus(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
        };
    }>;
    updateReservationStatusAlias(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
        };
    }>;
    checkIn(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_in_at: string;
            member: any;
            space: any;
        };
    }>;
    checkInAlias(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_in_at: string;
            member: any;
            space: any;
        };
    }>;
    checkInAlias2(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_in_at: string;
            member: any;
            space: any;
        };
    }>;
    checkOut(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_out_at: string;
            member: any;
            space: any;
        };
    }>;
    checkOutAlias(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_out_at: string;
            member: any;
            space: any;
        };
    }>;
    checkOutAlias2(user: any, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            status: string;
            checked_out_at: string;
            member: any;
            space: any;
        };
    }>;
    getMembers(user: any, search?: string): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    createMember(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            user_id: number;
            username: any;
            nama_member: any;
            instansi: any;
            alamat: any;
            telp: any;
        };
    }>;
    getMemberById(user: any, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateMember(user: any, id: string, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMember(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFinancialReport(user: any): Promise<{
        success: boolean;
        summary: any;
        monthly_breakdown: any[];
        space_breakdown: any[];
    }>;
    getIncomeReport(user: any): Promise<{
        success: boolean;
        summary: any;
        monthly_breakdown: any[];
        space_breakdown: any[];
    }>;
    getMonthlyReport(user: any, query: any): Promise<{
        success: boolean;
        period: {
            month: number;
            year: number;
            formatted: string;
            daysInMonth: number;
            monthName: string;
        };
        stats: any;
        daily_trajectory: any[];
        space_breakdown: {
            type: any;
            label: string;
            sub: string;
            total_bookings: number;
            total_jam: number;
            pendapatan_kotor: number;
            potongan_diskon: number;
            total_pendapatan: number;
            yield: number;
        }[];
    }>;
    getMonthlyReportAlias(user: any, query: any): Promise<{
        success: boolean;
        period: {
            month: number;
            year: number;
            formatted: string;
            daysInMonth: number;
            monthName: string;
        };
        stats: any;
        daily_trajectory: any[];
        space_breakdown: {
            type: any;
            label: string;
            sub: string;
            total_bookings: number;
            total_jam: number;
            pendapatan_kotor: number;
            potongan_diskon: number;
            total_pendapatan: number;
            yield: number;
        }[];
    }>;
    getVisitorReport(user: any): Promise<{
        success: boolean;
        summary: any;
        daily_breakdown: any[];
    }>;
    getVisitorReportAlias(user: any): Promise<{
        success: boolean;
        summary: any;
        daily_breakdown: any[];
    }>;
}
