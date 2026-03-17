"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeScopes = normalizeScopes;
exports.computeScopesHash = computeScopesHash;
const crypto_1 = require("crypto");
function normalizeScopes(scopes) {
    return [...new Set(scopes.map((s) => s.trim()).filter(Boolean))].sort();
}
function computeScopesHash(scopes) {
    const normalized = normalizeScopes(scopes);
    return (0, crypto_1.createHash)('sha256')
        .update(JSON.stringify(normalized))
        .digest('hex');
}
//# sourceMappingURL=permission-scope-hash.js.map