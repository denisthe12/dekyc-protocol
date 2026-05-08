"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64Url = encodeBase64Url;
exports.decodeBase64Url = decodeBase64Url;
exports.decodeBase64UrlJson = decodeBase64UrlJson;
function encodeBase64Url(input) {
    const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
    return buffer
        .toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}
function decodeBase64Url(input) {
    const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);
    return Buffer.from(padded, 'base64');
}
function decodeBase64UrlJson(input) {
    const decoded = decodeBase64Url(input).toString('utf8');
    return JSON.parse(decoded);
}
//# sourceMappingURL=base64url.js.map