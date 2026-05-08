"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyCanonicalJson = stringifyCanonicalJson;
function stringifyCanonicalJson(value) {
    if (value === null) {
        return 'null';
    }
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error('Canonical JSON does not support non-finite numbers');
        }
        return JSON.stringify(value);
    }
    if (typeof value === 'boolean') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stringifyCanonicalJson(item)).join(',')}]`;
    }
    if (typeof value === 'object') {
        const record = value;
        const entries = Object.entries(record)
            .filter(([, entryValue]) => entryValue !== undefined)
            .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
        const serializedEntries = entries.map(([key, entryValue]) => {
            return `${JSON.stringify(key)}:${stringifyCanonicalJson(entryValue)}`;
        });
        return `{${serializedEntries.join(',')}}`;
    }
    throw new Error(`Unsupported canonical JSON value type: ${typeof value}`);
}
//# sourceMappingURL=canonical-json.js.map