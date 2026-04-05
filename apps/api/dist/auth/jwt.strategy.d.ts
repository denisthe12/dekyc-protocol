import { JwtUserPayload } from './auth.types';
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtUserPayload): JwtUserPayload;
}
export {};
