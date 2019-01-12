import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { TimingsBlSingleton } from '../business-layer/timingssBl';
import { ErrorResponse, Timing } from '../models/sharedInterfaces';

@Tags('Timings')
@Route('timings')
export class TimingsController extends Controller {

    /**
     * Get all timings in system.
     * @returns Timings array.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getTimings(): Promise<Timing[]> {
        return await TimingsBlSingleton.getTimings();
    }

    /**
     * Get operation by id.
     * @returns Operation.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{timingId}')
    public async getTiming(timingId: string): Promise<Timing> {
        return await TimingsBlSingleton.getTimingById(timingId);
    }

    /**
     * Update timing values.
     * @param timingId Timing id.
     * @param timing Timing object to update to.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{timingId}')
    public async setTiming(timingId: string, @Body() timing: Timing): Promise<void> {
        return await TimingsBlSingleton.SetTiming(timingId, timing);
    }

    /**
     * Delete timing from system.
     * @param timingId Timing id.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{timingId}')
    public async deleteTiming(timingId: string): Promise<void> {
        return await TimingsBlSingleton.DeleteTiming(timingId);
    }

    /**
     *  Creates new timing.
     * @param timing new timing to create.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createTiming(@Body() timing: Timing): Promise<void> {
        return await TimingsBlSingleton.CreateTiming(timing);
    }

}
