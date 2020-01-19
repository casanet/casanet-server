"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const minionsBl_1 = require("../business-layer/minionsBl");
const timingsBl_1 = require("../business-layer/timingsBl");
/**
 * Because that swagger does not fully support SSE.
 * Use the TSOA routing is for documentation only.
 */
let FeedController = class FeedController extends tsoa_1.Controller {
    /**
     * Init minions feed.
     * @param miniosSse minion sse object.
     */
    initMinionsFeed(miniosSse) {
        this.miniosSse = miniosSse;
        minionsBl_1.MinionsBlSingleton.minionFeed.subscribe(minionFeed => {
            if (!minionFeed) {
                return;
            }
            this.miniosSse.send(minionFeed);
        });
    }
    /**
     * Init timings feed.
     * @param timingsSse timing sse object.
     */
    initTimingsFeed(timingsSse) {
        this.timingsSse = timingsSse;
        timingsBl_1.TimingsBlSingleton.timingFeed.subscribe(timingFeed => {
            if (!timingFeed) {
                return;
            }
            this.timingsSse.send(timingFeed);
        });
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Minions feed.
     * when minion status changed minion created etc.
     */
    async getMinionsFeed() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Timing feed.
     * when timing activated.
     */
    async getTimingFeed() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('minions')
], FeedController.prototype, "getMinionsFeed", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('timings')
], FeedController.prototype, "getTimingFeed", null);
FeedController = __decorate([
    tsoa_1.Tags('Feeds'),
    tsoa_1.Route('feed')
], FeedController);
exports.FeedController = FeedController;
//# sourceMappingURL=feedController.js.map