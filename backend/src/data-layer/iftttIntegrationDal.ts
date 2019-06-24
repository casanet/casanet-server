import { IDataIO } from '../models/backendInterfaces';
import { IftttIntegrationSettings } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const IFTTT_INTEG_FILE_NAME = 'iftttIntegration';

export class IftttIntergrationDal {

    private dataIo: IDataIO;

    /**
     * iftttIntegrationSettings.
     */
    private iftttIntegrationSettings: IftttIntegrationSettings[];

    constructor(dataIo: IDataIO) {
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
    public async getIntegrationSettings(): Promise<IftttIntegrationSettings> {
        return this.iftttIntegrationSettings.length > 0 ? this.iftttIntegrationSettings[0] : { enableIntegration : false };
    }

    /**
     * Delete / Disable Integration Settings.
     */
    public async disableIntegrationSettings(): Promise<void> {
        this.iftttIntegrationSettings = [{
            apiKey: '',
            enableIntegration: false,
        }];

        await this.dataIo.setData(this.iftttIntegrationSettings)
            .catch(() => {
                throw new Error('fail to save iftttIntegrationSettings delete request');
            });
    }

    /**
     * Set Integration Settings(and remove current).
     * @param iftttIntegrationSettings Integration settings to save.
     */
    public async setIntegrationSettings(iftttIntegrationSettings: IftttIntegrationSettings): Promise<void> {

        this.iftttIntegrationSettings = [iftttIntegrationSettings];

        await this.dataIo.setData(this.iftttIntegrationSettings)
            .catch(() => {
                throw new Error('fail to save set iftttIntegrationSettings request');
            });
    }
}

export const IftttIntergrationDalSingleton = new IftttIntergrationDal(new DataIO(IFTTT_INTEG_FILE_NAME, true));
