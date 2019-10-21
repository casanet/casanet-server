"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const path = require("path");
const config_1 = require("../config");
const logger_1 = require("../utilities/logger");
/**
 * Used for r/w files.
 */
class DataIO {
    /**
     * Init data IO.
     * @param fileName File name to r/w from.
     */
    constructor(fileName) {
        this.fileName = fileName;
        this.filePath = path.join(DataIO.DATA_DIRACTORY, this.fileName);
    }
    /**
     * Get data sync.
     * Use it in init only. else the app will black until read finish.
     */
    getDataSync() {
        try {
            return fse.readJSONSync(this.filePath);
        }
        catch (error) {
            return [];
        }
    }
    async getData() {
        const data = await fse.readJSON(this.filePath)
            .catch((err) => {
            logger_1.logger.warn(`Fail to read ${this.fileName} file, ${err}`);
            throw new Error('Fail to read data');
        });
        return data;
    }
    async setData(data) {
        await fse.outputFile(this.filePath, JSON.stringify(data, null, 2))
            .catch((err) => {
            logger_1.logger.warn(`Fail to write ${this.fileName} file, ${err}`);
            throw new Error('Fail to write data');
        });
    }
}
exports.DataIO = DataIO;
DataIO.DATA_DIRACTORY = path.join('./data/', config_1.Configuration.runningMode);
//# sourceMappingURL=dataIO.js.map