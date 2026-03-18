import { PermissionsService } from './permissions.service';
import { Request } from 'express';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { RevokePermissionDto } from './dto/revoke-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    grant(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }, body: GrantPermissionDto): Promise<unknown>;
    revoke(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }, body: RevokePermissionDto): Promise<unknown>;
    getMy(req: Request & {
        user: {
            sub: string;
            email: string;
        };
    }): Promise<unknown>;
}
