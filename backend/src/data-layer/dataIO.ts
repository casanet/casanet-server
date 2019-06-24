import * as fse from 'fs-extra';
import * as path from 'path';
import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { logger } from '../utilities/logger';
import * as cryptoJs from 'crypto-js';


/**
 * Used for r/w files.
 */
export class DataIO implements IDataIO {


    public static readonly DATA_DIRACTORY = path.join('./data/', Configuration.runningMode);

    /**
     * File full path.
     */
    private filePath: string;

    /**
     * Init data IO.
     * @param fileName File name to r/w from.
     * @param encryptData Encrypt only sensitive data (API keys etc.) n
     */
    constructor(private fileName: string, private encryptData: boolean = false) {
        this.filePath = path.join(DataIO.DATA_DIRACTORY, this.fileName + (encryptData ? '.txt' : '.json'));
    }

    private encryptText(text: string) : string {
        return cryptoJs.AES.encrypt(text, Configuration.keysHandling.dataPasswprd).toString();
    }

    private decryptText(text: string) {
        console.log(Configuration.keysHandling.dataPasswprd);
        return cryptoJs.AES.decrypt(text, Configuration.keysHandling.dataPasswprd).toString(cryptoJs.enc.Utf8);
    }

    private dataToText(data: any[]): string {
        const dataAsText = JSON.stringify(data, null, 2);
        return this.encryptData ? this.encryptText(dataAsText) : dataAsText;
    }

    private textToData(text: string): any[] {
        const validText = this.encryptData ? this.decryptText(text) : text;
        return JSON.parse(validText);
    }

    /**
     * Get data sync.
     * Use it in init only. else the app will black until read finish.
     */
    public getDataSync(): any[] {
        try {
            const data = fse.readFileSync(this.filePath);
            return this.textToData(data.toString('utf8'));
        } catch (error) {
            logger.warn(`Fail to read ${this.fileName} file, ${error}`);
            return [];
        }
    }

    public async getData(): Promise<any[]> {
        try {
            const data = await fse.readFile(this.filePath);
            return this.textToData(data.toString('utf8'));
        } catch (error) {
            logger.warn(`Fail to read ${this.fileName} file, ${error}`);
            throw new Error('Fail to read data');
        }
    }

    public async setData(data: any[]): Promise<void> {
        try {
            await fse.outputFile(this.filePath, this.dataToText(data));
        } catch (error) {
            logger.warn(`Fail to write ${this.fileName} file, ${error}`);
            throw new Error('Fail to write data');
        }
    }
}
