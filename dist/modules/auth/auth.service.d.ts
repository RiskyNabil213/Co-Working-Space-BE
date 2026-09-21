import { DatabaseService } from '../../database/database.service';
export declare class AuthService {
    private readonly db;
    constructor(db: DatabaseService);
    private generateToken;
    registerMember(makerId: number, body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        access_token: string;
        data: {
            id: number;
            member_id: number;
            username: any;
            role: string;
            nama_member: any;
            instansi: any;
            alamat: any;
            telp: any;
            foto: any;
            token: string;
            access_token: string;
        };
    }>;
    registerAdminSpace(makerId: number, body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        access_token: string;
        data: {
            id: number;
            owner_id: number;
            username: any;
            role: string;
            nama_coworking: any;
            nama_pemilik: any;
            alamat: any;
            telp: any;
            deskripsi_fasilitas: any;
            token: string;
            access_token: string;
        };
    }>;
    login(makerId: number, body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        access_token: string;
        data: any;
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
    updateProfile(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        token: string;
        access_token: string;
        data: any;
    }>;
}
