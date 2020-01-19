"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const IFTTT_INTEG_FILE_NAME = 'iftttIntegration.json';
class IftttIntergrationDal {
    constructor(dataIo) {
        this.dataIo = dataIo;
        this.iftttIntegrationSettings = dataIo.getDataSync();
        /** Set integration off as default */
        if (this.iftttIntegrationSettings.length === 0) {
            this.iftttIntegrationSettings.push({
                apiKey: '',
                enableIntegration: false,
            });
        }
    }
    /**
     * Get Integration Settings.
     */
    async getIntegrationSettings() {
        return this.iftttIntegrationSettings.length > 0 ? this.iftttIntegrationSettings[0] : { enableIntegration: false };
    }
    /**
     * Delete / Disable Integration Settings.
     */
    async disableIntegrationSettings() {
        this.iftttIntegrationSettings = [
            {
                apiKey: '',
                enableIntegration: false,
            },
        ];
        await this.dataIo.setData(this.iftttIntegrationSettings).catch(() => {
            throw new Error('fail to save iftttIntegrationSettings delete request');
        });
    }
    /**
     * Set Integration Settings(and remove current).
     * @param iftttIntegrationSettings Integration settings to save.
     */
    async setIntegrationSettings(iftttIntegrationSettings) {
        this.iftttIntegrationSettings = [iftttIntegrationSettings];
        await this.dataIo.setData(this.iftttIntegrationSettings).catch(() => {
            throw new Error('fail to save set iftttIntegrationSettings request');
        });
    }
}
exports.IftttIntergrationDal = IftttIntergrationDal;
exports.IftttIntergrationDalSingleton = new IftttIntergrationDal(new dataIO_1.DataIO(IFTTT_INTEG_FILE_NAME));
//# sourceMappingURL=iftttIntegrationDal.js.map