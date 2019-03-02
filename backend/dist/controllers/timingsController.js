"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const timingsBl_1 = require("../business-layer/timingsBl");
let TimingsController = class TimingsController extends tsoa_1.Controller {
    /**
     * Get all timings in system.
     * @returns Timings array.
     */
    async getTimings() {
        return await timingsBl_1.TimingsBlSingleton.getTimings();
    }
    /**
     * Get operation by id.
     * @returns Operation.
     */
    async getTiming(timingId) {
        return await timingsBl_1.TimingsBlSingleton.getTimingById(timingId);
    }
    /**
     * Update timing values.
     * @param timingId Timing id.
     * @param timing Timing object to update to.
     */
    async setTiming(timingId, timing) {
        return await timingsBl_1.TimingsBlSingleton.SetTiming(timingId, timing);
    }
    /**
     * Delete timing from system.
     * @param timingId Timing id.
     */
    async deleteTiming(timingId) {
        return await timingsBl_1.TimingsBlSingleton.DeleteTiming(timingId);
    }
    /**
     *  Creates new timing.
     * @param timing new timing to create.
     */
    async createTiming(timing) {
        return await timingsBl_1.TimingsBlSingleton.CreateTiming(timing);
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], TimingsController.prototype, "getTimings", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{timingId}')
], TimingsController.prototype, "getTiming", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{timingId}'),
    __param(1, tsoa_1.Body())
], TimingsController.prototype, "setTiming", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{timingId}')
], TimingsController.prototype, "deleteTiming", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], TimingsController.prototype, "createTiming", null);
TimingsController = __decorate([
    tsoa_1.Tags('Timings'),
    tsoa_1.Route('timings')
], TimingsController);
exports.TimingsController = TimingsController;
//# sourceMappingURL=timingsController.js.map