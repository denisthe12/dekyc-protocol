import type { ConsentReceiptSignablePayload } from './types/consent-receipt-signable-payload.type';
export declare class ConsentReceiptsSigner {
    createReceiptHash(payload: ConsentReceiptSignablePayload): string;
    signReceiptHash(receiptHash: string): string;
    verifyReceiptSignature(input: {
        receiptHash: string;
        signature: string;
    }): boolean;
    private getSigningSecret;
}
