import { DatabaseService } from '../../database/database.service';
export declare class ReservasiService {
    private readonly db;
    constructor(db: DatabaseService);
    private calculateHours;
    private addHoursToTime;
    createReservation(user: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            kode_booking: string;
            id_member: any;
            id_space: any;
            id_diskon: number;
            nama_space: any;
            tanggal: any;
            tanggal_reservasi: any;
            jam_mulai: any;
            jam_selesai: any;
            durasi_jam: number;
            harga_per_jam: number;
            total_harga_awal: number;
            persentase_diskon: number;
            potongan_diskon: number;
            total_bayar: number;
            status: string;
        };
    }>;
    getMyReservations(user: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getMyReservationHistory(user: any, query: any): Promise<{
        success: boolean;
        total: number;
        data: any[];
    }>;
    getReservationById(user: any, id: number): Promise<{
        success: boolean;
        data: any;
    }>;
    cancelReservation(user: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getETicket(user: any, id: number): Promise<{
        success: boolean;
        data: {
            ticket_code: any;
            qr_payload: string;
            reservation: any;
        };
    }>;
}
