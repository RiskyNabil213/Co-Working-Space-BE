export declare class UploadController {
    uploadImage(file: Express.Multer.File): {
        success: boolean;
        message: string;
        filename: string;
        url: string;
    };
    uploadAvatar(file: Express.Multer.File): {
        success: boolean;
        message: string;
        filename: string;
        url: string;
    };
    uploadSpaces(file: Express.Multer.File): {
        success: boolean;
        message: string;
        filename: string;
        url: string;
    };
    uploadMembers(file: Express.Multer.File): {
        success: boolean;
        message: string;
        filename: string;
        url: string;
    };
}
