export declare class WebhookSignerService {
    createSigningSecret(endpointId: string): string;
    createRandomEndpointIdSalt(): string;
    hashSecret(secret: string): string;
    signPayload(input: {
        signingSecret: string;
        timestamp: number;
        payload: unknown;
    }): string;
    private getRootSecret;
}
