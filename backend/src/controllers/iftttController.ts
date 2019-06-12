import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { IftttIntegrationBlSingleton } from '../business-layer/iftttIntegrationBl';
import { ErrorResponse, IftttActionTriggered, IftttActionTriggeredRequest, IftttIntegrationSettings, IftttRawActionTriggerd } from '../models/sharedInterfaces';

@Tags('Ifttt')
@Route('ifttt')
export class IftttController extends Controller {

    /**
     * Is IFTTT inegration enabled.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('adminAuth')
    @Security('userAuth')
    @Get('/settings')
    public async isIftttEnabled(): Promise<boolean> {
        const iftttSettings = await IftttIntegrationBlSingleton.getIftttIntergrationSettings();
        return iftttSettings.enableIntegration;
    }

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
     * when all details in body only, to allow send all data ion one text line.
     * Example to use: SMS trigger has only simple text that can pass to IFTTT activity,
     * and by current request, it is possible to control any minion by one single line of text. 
     * so fill the SMS text with JSON and by IFTTT set it to be the request body.
     * @param iftttActionTriggered status to and minion to set.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('iftttAuth')
    @Post('/trigger/minions/raw/')
    public async triggeredSomeAction(@Body() iftttRawActionTriggerd: IftttRawActionTriggerd): Promise<void> {
        const { apiKey, minionId, setStatus } = iftttRawActionTriggerd;
        await IftttIntegrationBlSingleton.triggeredMinionAction(minionId, {
            apiKey,
            setStatus,
        });
    }

    /**
     * Ifttt webhooks triggering casa-net *minion* action API.
     * @param minionId minion to set status.
     * @param iftttActionTriggered status to set.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('iftttAuth')
    @Post('/trigger/minions/{minionId}/')
    public async triggeredMinionAction(minionId: string, @Body() iftttActionTriggered: IftttActionTriggered): Promise<void> {
        await IftttIntegrationBlSingleton.triggeredMinionAction(minionId, iftttActionTriggered);
    }

    /**
     * Ifttt webhooks triggering casa-net *operation* action API.
     * @param operationId operation to invoke.
     * @param iftttActionTriggeredRequest Ifttt request auth and redirect data.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Security('iftttAuth')
    @Post('/trigger/operations/{operationId}/')
    public async triggeredOperationAction(operationId: string, @Body() iftttActionTriggeredRequest: IftttActionTriggeredRequest)
        : Promise<void> {
        await IftttIntegrationBlSingleton.triggeredOperationAction(operationId);
    }
}
