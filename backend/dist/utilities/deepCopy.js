"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copy Json object/array by *val*.
 * @param fromData data to copy from.
 * @returns A totaly new copy of data.
 */
exports.DeepCopy = (fromData) => {
    return JSON.parse(JSON.stringify(fromData));
};
//# sourceMappingURL=deepCopy.js.map