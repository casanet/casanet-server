"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple utility to sleep by promise.
 * @param delayDuration Time duration to delay.
 */
exports.Delay = (delayDuration) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delayDuration.asMilliseconds());
    });
};
//# sourceMappingURL=sleep.js.map