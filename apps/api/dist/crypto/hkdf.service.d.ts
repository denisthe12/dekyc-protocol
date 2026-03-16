export declare class HkdfService {
    private readonly masterSecret;
    constructor();
    derivePermissionKey(params: {
        permissionId: string;
        serviceId: string;
        userId: string;
        version?: number;
    }): string;
}
