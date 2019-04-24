import * as request from 'request-promise';
import { IftttIntergrationDal, IftttIntergrationDalSingleton } from '../data-layer/iftttIntegrationDal';
import { IftttActionTriggered, IftttIntegrationSettings, Minion, MinionFeed, Operation } from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';
import { OperationsBl, OperationsBlSingleton } from './operationsBl';
/**
 * Used to invoke ifttt triggers and to act ifttt actions.
 * Using Webhooks API.
 */
export class IftttIntegrationBl {

    /**
     * Init Ifttt IntegrationBl bl. using dependecy injection pattern to allow units testings.
     * @param iftttIntergrationDal Inject the ifttt intergration dal.
     * @param minionsBl Inject the minions bl instance to used minionsBl.
     */
    constructor(private iftttIntergrationDal: IftttIntergrationDal,
                private minionsBl: MinionsBl,
                private operationsBl: OperationsBl,
    ) {
        /** Subscribe to minions feed, to trigger an wenhooks event */
        this.minionsBl.minionFeed.subscribe((minionFeed: MinionFeed) => {
            if (!minionFeed || minionFeed.event !== 'update') {
                return;
            }
            this.invokeTrigger(minionFeed.minion);
        });
    }

    /**
     * Set Ifttt intergration settings.
     */
    public async setIftttIntergrationSettings(iftttIntegrationSettings: IftttIntegrationSettings) {
        await this.iftttIntergrationDal.setIntegrationSettings(iftttIntegrationSettings);
    }

    /** Get current ifttt integration settings */
    public async getIftttIntergrationSettings(): Promise<IftttIntegrationSettings> {
        return await this.iftttIntergrationDal.getIntegrationSettings();
    }

    /** Trigger requested minion action. */
    public async triggeredMinionAction(minionId: string, iftttActionTriggered: IftttActionTriggered): Promise<void> {
        const minion = DeepCopy<Minion>(await this.minionsBl.getMinionById(minionId));
        minion.minionStatus[minion.minionType].status = iftttActionTriggered.setStatus;
        await this.minionsBl.setMinionStatus(minionId, minion.minionStatus);
    }

    /** Trigger requested operation action. */
    public async triggeredOperationAction(operationId: string): Promise<void> {
        await this.operationsBl.triggerOperation(operationId);
    }

    /** Send trigger to webhooks API */
    private async invokeTrigger(minion: Minion) {

        const ifttSettings = await this.iftttIntergrationDal.getIntegrationSettings();
        if (!ifttSettings.enableIntegration) {
            return;
        }

        try {
            // tslint:disable-next-line:max-line-length
            await request(`https://maker.ifttt.com/trigger/when-${minion.minionId}-${minion.minionStatus[minion.minionType].status}/with/key/${ifttSettings.apiKey}`);
        } catch (error) {
            logger.warn(`Sent IFTTT trigger for ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
        }
    }

}

export const IftttIntegrationBlSingleton = new IftttIntegrationBl(IftttIntergrationDalSingleton, MinionsBlSingleton, OperationsBlSingleton);
