export declare class AppController {
    getRoot(): {
        name: string;
        version: string;
        status: string;
        author: string;
        docs: string;
        endpoints: {
            auth: string;
            spaces: string;
            diskon: string;
            reservasi: string;
            admin: string;
            maker: string;
            upload: string;
        };
    };
    getHealth(): {
        status: boolean;
        statusCode: number;
        message: string;
        uptime: number;
        timestamp: string;
    };
}
