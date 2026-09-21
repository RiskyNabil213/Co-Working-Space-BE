export declare class OtpService {
    private readonly logger;
    private otpStore;
    private getTransporter;
    sendOtp(email: string): Promise<{
        success: boolean;
        message: string;
        debugOtp?: string;
    }>;
    verifyOtp(email: string, inputOtp: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
