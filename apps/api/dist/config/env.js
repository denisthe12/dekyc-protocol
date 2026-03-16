"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequiredEnv = getRequiredEnv;
exports.getEnv = getEnv;
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function getEnv(name, fallback) {
    const value = process.env[name];
    return value && value.trim().length > 0 ? value : fallback;
}
//# sourceMappingURL=env.js.map