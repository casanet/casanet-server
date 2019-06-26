import * as express from 'express';
import * as SseStream from 'express-sse';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, MinionFeed, TimingFeed } from '../../../backend/src/models/sharedInterfaces';
import { ChannelsBlSingleton } from '../logic/channelsBl';
/**
 * Because that swagger not fully support SSE.
 * Use the TSOA routing is for documentation only.
 */
@Tags('Feeds')
@Route('feed')
export class FeedController extends Controller {

    /** SSE events objects for minions feed, map to local servers. */
    private minionsSseFeedServersMap: { [key: string]: SseStream } = {};
    /** SSE events objects for timings feed, map to local servers. */
    private timingsSseFeedServersMap: { [key: string]: SseStream } = {};

    constructor() {
        super();

        /** Subscribe to each feed event that arrrived from each local server, to send sse event based on it. */
        ChannelsBlSingleton.localServersFeed.subscribe((localServerFeed) => {

            if (!localServerFeed) {
                return;
            }

            switch (localServerFeed.localServerFeed.feedType) {
                case 'minions':
                    this.handleFeedArrived(this.minionsSseFeedServersMap,
                        localServerFeed.localServerId,
                        localServerFeed.localServerFeed.feedContent);
                    break;
                case 'timings':
                    this.handleFeedArrived(this.timingsSseFeedServersMap,
                        localServerFeed.localServerId,
                        localServerFeed.localServerFeed.feedContent);
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
    private handleFeedArrived(sseFeedServersMap: { [key: string]: SseStream }, localServerId: string, feedData: any) {
        if (!(localServerId in sseFeedServersMap)) {
            return;
        }
        try { sseFeedServersMap[localServerId].send(feedData); } catch (error) { }
    }

    /**
     * Handle SSE feed minioins request.
     * @param localServerId local server of user to get feed from.
     * @param request express request data.
     * @param response express response data.
     */
    public initMinionsFeed(localServerId: string, request: express.Request, response: express.Response): void {
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
    public initTimingsFeed(localServerId: string, request: express.Request, response: express.Response): void {
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
    @Security('forwardAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('minions')
    public async getMinionsFeed(): Promise<MinionFeed> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Local server timing feed.
     * when timing activated.
     */
    @Security('forwardAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('timings')
    public async getTimingFeed(): Promise<TimingFeed> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
