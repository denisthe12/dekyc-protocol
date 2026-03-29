import { EnergyUserRole } from '../../../prisma/generated/client';
export type CurrentUser = {
    id: string;
    dekycUserId: string;
    email: string | null;
    fullName: string | null;
    role: EnergyUserRole;
};
