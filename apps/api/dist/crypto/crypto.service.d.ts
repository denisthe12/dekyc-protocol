export type EncryptPayloadResult = {
    cipherText: string;
    iv: string;
    authTag: string;
    algorithm: string;
    keyVersion: string;
};
export declare class CryptoService {
    private readonly algorithm;
    private readonly keyVersion;
    encryptJson(payload: unknown): EncryptPayloadResult;
    decryptJson(input: {
        cipherText: string;
        iv: string;
        authTag: string;
    }): unknown;
    computeKycHash(payload: unknown): string;
    private getMasterKey;
}
