"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256FromObject = sha256FromObject;
exports.sha256HexFromObject = sha256HexFromObject;
const crypto_1 = require("crypto");
const canonical_json_util_1 = require("./canonical-json.util");
function sha256FromObject(input) {
    const canonicalJson = (0, canonical_json_util_1.toCanonicalJson)(input);
    return (0, crypto_1.createHash)('sha256').update(canonicalJson).digest();
}
function sha256HexFromObject(input) {
    const canonicalJson = (0, canonical_json_util_1.toCanonicalJson)(input);
    return (0, crypto_1.createHash)('sha256').update(canonicalJson).digest('hex');
}
//# sourceMappingURL=hash.util.js.map