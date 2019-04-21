import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { IftttIntegrationBlSingleton } from '../business-layer/iftttIntegrationBl';
import { ErrorResponse, IftttActionTriggered, IftttIntegrationSettings } from '../models/sharedInterfaces';

@Tags('Ifttt')
@Route('ifttt')
export class IftttController extends Controller {

    /**
     * Put ifttt integration settings.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('adminAuth')
    @Put('/settings')
    public async setIftttIntegrationSettings(@Body() iftttIntegrationSettings: IftttIntegrationSettings): Promise<void> {
        await IftttIntegrationBlSingleton.setIftttIntergrationSettings(iftttIntegrationSettings);
    }

    /**
     * Ifttt webhooks triggering casa-net action API.
     * @param minionId minion to set status.
     * @param iftttActionTriggered status to set.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('iftttAuth')
    @Post('/trigger/minions/{minionId}/')
    public async triggeredAction(minionId: string, @Body() iftttActionTriggered: IftttActionTriggered): Promise<void> {
        await IftttIntegrationBlSingleton.triggeredAction(minionId, iftttActionTriggered);
    }
}
