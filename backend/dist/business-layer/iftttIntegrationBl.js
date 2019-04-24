"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const iftttIntegrationDal_1 = require("../data-layer/iftttIntegrationDal");
const deepCopy_1 = require("../utilities/deepCopy");
const logger_1 = require("../utilities/logger");
const minionsBl_1 = require("./minionsBl");
const operationsBl_1 = require("./operationsBl");
/**
 * Used to invoke ifttt triggers and to act ifttt actions.
 * Using Webhooks API.
 */
class IftttIntegrationBl {
    /**
     * Init Ifttt IntegrationBl bl. using dependecy injection pattern to allow units testings.
     * @param iftttIntergrationDal Inject the ifttt intergration dal.
     * @param minionsBl Inject the minions bl instance to used minionsBl.
     */
    constructor(iftttIntergrationDal, minionsBl, operationsBl) {
        this.iftttIntergrationDal = iftttIntergrationDal;
        this.minionsBl = minionsBl;
        this.operationsBl = operationsBl;
        /** Subscribe to minions feed, to trigger an wenhooks event */
        this.minionsBl.minionFeed.subscribe((minionFeed) => {
            if (!minionFeed || minionFeed.event !== 'update') {
                return;
            }
            this.invokeTrigger(minionFeed.minion);
        });
    }
    /**
     * Set Ifttt intergration settings.
     */
    async setIftttIntergrationSettings(iftttIntegrationSettings) {
        await this.iftttIntergrationDal.setIntegrationSettings(iftttIntegrationSettings);
    }
    /** Get current ifttt integration settings */
    async getIftttIntergrationSettings() {
        return await this.iftttIntergrationDal.getIntegrationSettings();
    }
    /** Trigger requested minion action. */
    async triggeredMinionAction(minionId, iftttActionTriggered) {
        const minion = deepCopy_1.DeepCopy(await this.minionsBl.getMinionById(minionId));
        minion.minionStatus[minion.minionType].status = iftttActionTriggered.setStatus;
        await this.minionsBl.setMinionStatus(minionId, minion.minionStatus);
    }
    /** Trigger requested operation action. */
    async triggeredOperationAction(operationId) {
        await this.operationsBl.triggerOperation(operationId);
    }
    /** Send trigger to webhooks API */
    async invokeTrigger(minion) {
        const ifttSettings = await this.iftttIntergrationDal.getIntegrationSettings();
        if (!ifttSettings.enableIntegration) {
            return;
        }
        try {
            // tslint:disable-next-line:max-line-length
            await request(`https://maker.ifttt.com/trigger/when-${minion.minionId}-${minion.minionStatus[minion.minionType].status}/with/key/${ifttSettings.apiKey}`);
        }
        catch (error) {
            logger_1.logger.warn(`Sent IFTTT trigger for ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
        }
    }
}
exports.IftttIntegrationBl = IftttIntegrationBl;
exports.IftttIntegrationBlSingleton = new IftttIntegrationBl(iftttIntegrationDal_1.IftttIntergrationDalSingleton, minionsBl_1.MinionsBlSingleton, operationsBl_1.OperationsBlSingleton);
//# sourceMappingURL=iftttIntegrationBl.js.map