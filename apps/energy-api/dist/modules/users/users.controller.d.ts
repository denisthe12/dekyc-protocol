import type { Request } from 'express';
import { UsersService } from './users.service';
type AuthenticatedRequest = Request & {
    user: {
        id: string;
    };
};
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<{
        user: {
            id: string;
            dekycUserId: string;
            fullName: string | null;
            email: string | null;
            iin: string | null | undefined;
            createdAt: string;
        };
        wallet: {
            custodialWalletAddress: string;
            kzteTokenAccountAddress: string | null;
            energyPointsTokenAccountAddress: string | null;
        } | null;
        balances: {
            kzte: {
                amountBaseUnits: string;
                decimals: number;
            };
            energyPoints: {
                amountBaseUnits: string;
                decimals: number;
            };
        };
        security: {
            actionPasswordIsSet: boolean;
        };
    }>;
}
export {};
