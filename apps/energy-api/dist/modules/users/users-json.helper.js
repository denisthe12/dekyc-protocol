"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPrismaJson = toPrismaJson;
const client_1 = require("../../../prisma/generated/client");
function isJsonLike(value) {
    if (value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean') {
        return true;
    }
    if (Array.isArray(value)) {
        return value.every(isJsonLike);
    }
    if (typeof value === 'object') {
        return Object.values(value).every(isJsonLike);
    }
    return false;
}
function toPrismaJson(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return client_1.Prisma.JsonNull;
    }
    if (!isJsonLike(value)) {
        throw new Error('Claims contain non-JSON-serializable values');
    }
    return value;
}
//# sourceMappingURL=users-json.helper.js.map