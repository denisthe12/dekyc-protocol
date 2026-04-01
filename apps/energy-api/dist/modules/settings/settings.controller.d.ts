import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { SetActionPasswordDto } from './dto/set-action-password.dto';
import { VerifyActionPasswordDto } from './dto/verify-action-password.dto';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getActionPasswordStatus(req: AuthenticatedRequest): Promise<{
        isSet: boolean;
    }>;
    setActionPassword(req: AuthenticatedRequest, dto: SetActionPasswordDto): Promise<{
        ok: boolean;
    }>;
    verifyActionPassword(req: AuthenticatedRequest, dto: VerifyActionPasswordDto): Promise<{
        valid: true;
    }>;
}
export {};
