"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const REMOTE_CONN_FILE_NAME = 'remoteConnection.json';
class RemoteConnectionDal {
    constructor(dataIo) {
        this.dataIo = dataIo;
        this.remoteSettings = dataIo.getDataSync();
    }
    /**
     * Get remote settings.
     */
    async getRemoteSettings() {
        return this.remoteSettings.length > 0 ? this.remoteSettings[0] : undefined;
    }
    /**
     * Delete remote settings.
     */
    async deleteRemoteSettings() {
        this.remoteSettings = [];
        await this.dataIo.setData(this.remoteSettings).catch(() => {
            throw new Error('fail to save remote settings delete request');
        });
    }
    /**
     * Set remote settings (and remove current).
     * @param remoteSettings remote settings to save.
     */
    async setRemoteSettings(remoteSettings) {
        this.remoteSettings = [remoteSettings];
        await this.dataIo.setData(this.remoteSettings).catch(() => {
            throw new Error('fail to save set remote settings request');
        });
    }
}
exports.RemoteConnectionDal = RemoteConnectionDal;
exports.RemoteConnectionDalSingleton = new RemoteConnectionDal(new dataIO_1.DataIO(REMOTE_CONN_FILE_NAME));
//# sourceMappingURL=remoteConnectionDal.js.map