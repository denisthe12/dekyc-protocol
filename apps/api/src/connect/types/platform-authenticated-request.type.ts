import type { Request } from 'express';
import type { JwtUserPayload } from '../../auth/auth.types';

export interface PlatformAuthenticatedRequest extends Request {
  user: JwtUserPayload;
}