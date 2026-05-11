import { ConnectVerificationService } from './connect-verification.service';
export declare class ConnectVerificationController {
    private readonly connectVerificationService;
    constructor(connectVerificationService: ConnectVerificationService);
    getSnapshot(): Promise<import("./types/connect-verification-snapshot.type").ConnectVerificationSnapshot>;
}
