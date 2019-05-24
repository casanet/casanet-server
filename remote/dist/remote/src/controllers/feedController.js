"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const SseStream = require("express-sse");
const tsoa_1 = require("tsoa");
const channelsBl_1 = require("../business-layer/channelsBl");
/**
 * Because that swagger not fully support SSE.
 * Use the TSOA routing is for documentation only.
 */
let FeedController = class FeedController extends tsoa_1.Controller {
    constructor() {
        super();
        /** SSE events objects for minions feed, map to local servers. */
        this.minionsSseFeedServersMap = {};
        /** SSE events objects for timings feed, map to local servers. */
        this.timingsSseFeedServersMap = {};
        /** Subscribe to each feed event that arrrived from each local server, to send sse event based on it. */
        channelsBl_1.ChannelsBlSingleton.localServersFeed.subscribe((localServerFeed) => {
            if (!localServerFeed) {
                return;
            }
            switch (localServerFeed.localServerFeed.feedType) {
                case 'minions':
                    this.handleFeedArrived(this.minionsSseFeedServersMap, localServerFeed.localServerId, localServerFeed.localServerFeed.feedContent);
                    break;
                case 'timings':
                    this.handleFeedArrived(this.timingsSseFeedServersMap, localServerFeed.localServerId, localServerFeed.localServerFeed.feedContent);
                    break;
            }
        });
    }
    /**
     * Handle feed arived, and send sse feed update to all local server feed users.
     * @param sseFeedServersMap All SSE objects maping by local server.
     * @param localServerId Id of local server that sent feed.
     * @param feedData Feed data to send by SSE object.
     */
    handleFeedArrived(sseFeedServersMap, localServerId, feedData) {
        if (!(localServerId in sseFeedServersMap)) {
            return;
        }
        try {
            sseFeedServersMap[localServerId].send(feedData);
        }
        catch (error) { }
    }
    /**
     * Handle SSE feed minioins request.
     * @param localServerId local server of user to get feed from.
     * @param request express request data.
     * @param response express response data.
     */
    initMinionsFeed(localServerId, request, response) {
        /** If SSE object not exist yet for current local server, create it. */
        if (!(localServerId in this.minionsSseFeedServersMap)) {
            this.minionsSseFeedServersMap[localServerId] = new SseStream(['init'], { isSerialized: true });
        }
        /** Subscribe client to his local server SSE object */
        this.minionsSseFeedServersMap[localServerId].init(request, response);
    }
    /**
     * Handle SSE feed timings request.
     * @param localServerId local server of user to get feed from.
     * @param request express request data.
     * @param response express response data.
     */
    initTimingsFeed(localServerId, request, response) {
        /** If SSE object not exist yet for current local server, create it. */
        if (!(localServerId in this.timingsSseFeedServersMap)) {
            this.timingsSseFeedServersMap[localServerId] = new SseStream(['init'], { isSerialized: true });
        }
        /** Subscribe client to his local server SSE object */
        this.timingsSseFeedServersMap[localServerId].init(request, response);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Local server minions feed.
     * when minion status changed, minion created etc.
     */
    async getMinionsFeed() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Local server timing feed.
     * when timing activated.
     */
    async getTimingFeed() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('minions')
], FeedController.prototype, "getMinionsFeed", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('timings')
], FeedController.prototype, "getTimingFeed", null);
FeedController = __decorate([
    tsoa_1.Tags('Feeds'),
    tsoa_1.Route('feed')
], FeedController);
exports.FeedController = FeedController;
//# sourceMappingURL=feedController.js.map