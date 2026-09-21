import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
export declare class AuthController {
    private readonly authService;
    private readonly otpService;
    constructor(authService: AuthService, otpService: OtpService);
    sendOtp(email: string): Promise<{
        success: boolean;
        message: string;
        debugOtp?: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        success: boolean;
        message: string;
    }>;
    registerMember(req: any, body: any): Promise<{
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
    registerAdminSpace(req: any, body: any): Promise<{
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
    login(req: any, body: any): Promise<{
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
