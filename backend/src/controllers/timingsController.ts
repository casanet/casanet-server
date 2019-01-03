import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
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
        return [];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Get operation by id.
     * @returns Operation.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{timingId}')
    public async getTiming(timingId: string): Promise<Timing> {
        return;
        // TODO: await new DevicesService().get(id);
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
        // TODO ...
        return;
    }

    /**
     * Delete timing from system.
     * @param timingId Timing id.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{timingId}')
    public async deleteTiming(timingId: string): Promise<void> {
        // TODO ...
        return;
    }

    /**
     *  Creates new timing.
     * @param timing new timing to create.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createTiming(@Body() timing: Timing): Promise<void> {
        // TODO ...
        return;
    }

}
